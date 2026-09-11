import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';
import { buildChallengeMessage, signChallenge } from '@/lib/funding-challenge';
import { POST } from './route';

const mocks = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({ from: mocks.from }) }));
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
