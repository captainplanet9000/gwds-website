import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';
import { buildChallengeMessage, signChallenge } from '../challenge/route';
import { POST } from './route';

const mocks = vi.hoisted(() => ({ from: vi.fn(), controlFrom: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({ from: mocks.from, schema: () => ({ from: mocks.controlFrom }) }) }));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
}));

// Disposable signing identity, never funded or sent to an exchange.
const wallet = privateKeyToAccount(`0x${'11'.repeat(32)}`);
const subscriptionId = '11111111-1111-4111-8111-111111111111';
const secret = 'test-only-wallet-challenge-secret';

async function request() {
  const message = buildChallengeMessage('customer-a', wallet.address, Date.now(), 'test');
  return new NextRequest('https://example.test/api/account/funding/verify-wallet', {
    method: 'POST', body: JSON.stringify({ subscriptionId, address: wallet.address,
      message, token: signChallenge(message, secret), signature: await wallet.signMessage({ message }) }),
  });
}

function database({ foreign = false, auditFailure = false, linkFailure = false } = {}) {
  const writes: string[] = [];
  mocks.from.mockImplementation((table: string) => {
    const result = table === 'hosting_subscriptions'
      ? { data: foreign ? null : { id: subscriptionId }, error: null }
      : table === 'hosting_audit'
        ? { error: auditFailure ? { message: 'offline' } : null }
        : { data: linkFailure ? null : { id: 'onboarding' }, error: null };
    const query = {
      select: () => query, eq: () => query,
      maybeSingle: async () => result,
      insert: () => { writes.push(table); return Promise.resolve(result); },
      update: () => { writes.push(table); return query; },
    };
    return query;
  });
  // No colliding control.tenants row by default — the wallet-collision guard's own tests
  // (below) supply a dedicated controlFrom mock instead of reusing this helper.
  mocks.controlFrom.mockImplementation(() => {
    const query = { select: () => query, neq: () => query, ilike: async () => ({ data: [], error: null }) };
    return query;
  });
  return writes;
}

describe('durable customer wallet verification', () => {
  beforeEach(() => { vi.stubEnv('WALLET_CHALLENGE_SECRET', secret); mocks.from.mockReset(); });
  it('saves signed proof before linking the wallet and reporting success', async () => {
    const writes = database();
    const response = await POST(await request());
    expect(response.status).toBe(200);
    expect((await response.json()).verified).toBe(true);
    expect(writes).toEqual(['hosting_audit', 'hosting_onboarding']);
  });
  it('rejects another customer subscription before writing', async () => {
    const writes = database({ foreign: true });
    expect((await POST(await request())).status).toBe(403);
    expect(writes).toEqual([]);
  });
  it('does not designate a wallet when its proof cannot be persisted', async () => {
    const writes = database({ auditFailure: true });
    expect((await POST(await request())).status).toBe(503);
    expect(writes).toEqual(['hosting_audit']);
  });
  it('does not report success when onboarding linkage fails', async () => {
    database({ linkFailure: true });
    const response = await POST(await request());
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('WALLET_LINK_FAILED');
  });
});

describe('wallet-collision guard', () => {
  beforeEach(() => { vi.stubEnv('WALLET_CHALLENGE_SECRET', secret); mocks.from.mockReset(); mocks.controlFrom.mockReset(); });

  // Own subscriptionId lookup uses .maybeSingle(); the collision guard's "which subscriptions
  // are mine" lookup awaits the query directly (no terminal method) — see route.ts's own
  // `mySubs` query. This one query builder serves both shapes, exactly like supabase-js does.
  function subscriptionsQuery() {
    const query = {
      select: () => query, eq: () => query,
      maybeSingle: async () => ({ data: { id: subscriptionId }, error: null }),
      then: (resolve: (v: unknown) => void) => resolve({ data: [{ id: subscriptionId }], error: null }),
    };
    return query;
  }

  it('rejects a wallet already bound to a different tenant', async () => {
    mocks.from.mockImplementation((table: string) => table === 'hosting_subscriptions' ? subscriptionsQuery() : undefined);
    mocks.controlFrom.mockImplementation(() => {
      const query = { select: () => query, neq: () => query, ilike: async () => ({ data: [{ id: 'tenant-x', hosting_subscription_id: 'someone-elses-subscription' }], error: null }) };
      return query;
    });
    const response = await POST(await request());
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('WALLET_ALREADY_IN_USE');
  });

  it('allows re-verifying a wallet already bound to the caller\'s own tenant', async () => {
    const writes = database();
    // database() already stubbed hosting_audit/hosting_onboarding on mocks.from; only replace the
    // hosting_subscriptions shape (it needs the array-awaitable form the collision guard uses).
    const shared = mocks.from.getMockImplementation()!;
    mocks.from.mockImplementation((table: string) => table === 'hosting_subscriptions' ? subscriptionsQuery() : shared(table));
    mocks.controlFrom.mockImplementation(() => {
      const query = { select: () => query, neq: () => query, ilike: async () => ({ data: [{ id: 'tenant-mine', hosting_subscription_id: subscriptionId }], error: null }) };
      return query;
    });
    const response = await POST(await request());
    expect(response.status).toBe(200);
    expect((await response.json()).verified).toBe(true);
    expect(writes).toEqual(['hosting_audit', 'hosting_onboarding']);
  });
});
