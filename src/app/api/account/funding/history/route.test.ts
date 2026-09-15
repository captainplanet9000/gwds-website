import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { fakeDb } from '../_test/fake-db';
import { GET } from './route';

const mocks = vi.hoisted(() => ({ db: null as unknown as ReturnType<typeof fakeDb>, fetch: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => mocks.db.client }));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
  enforceRateLimit: async () => undefined,
}));

const mainWallet = `0x${'ab'.repeat(20)}`;
const subscriptionId = '11111111-1111-4111-8111-111111111111';

function database({ subscriptionOwner = 'customer-a', network = 'mainnet' } = {}) {
  mocks.db = fakeDb({
    tenants: [{
      id: 'tenant-a', slug: 'tenant-a', status: 'archived', owner_email: 'a@example.test',
      hosting_subscription_id: subscriptionId, main_wallet_address: mainWallet,
    }],
    hosting_subscriptions: [{ id: subscriptionId, user_id: subscriptionOwner, status: 'canceled' }],
    tenant_env: [{ tenant_id: 'tenant-a', key: 'HYPERLIQUID_NETWORK', value: network }],
    env_key_policy: [{ key: 'HYPERLIQUID_NETWORK', default_value: 'testnet' }],
  });
}

const request = () => new NextRequest('https://example.test/api/account/funding/history');

describe('funding history', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockReset();
    database();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("reads the tenant main wallet's ledger on the tenant's network and keeps only deposits and withdrawals", async () => {
    mocks.fetch.mockResolvedValue(Response.json([
      { time: 1000, hash: '0x01', delta: { type: 'deposit', usdc: '25.0' } },
      { time: 3000, hash: '0x03', delta: { type: 'withdraw', usdc: '9.0', fee: '1.0', nonce: 3000 } },
      { time: 2000, hash: '0x02', delta: { type: 'accountClassTransfer', usdc: '5.0', toPerp: true } },
    ]));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({
      network: 'mainnet',
      items: [
        { type: 'withdraw', usdc: '9.0', fee: '1.0', time: 3000, hash: '0x03' },
        { type: 'deposit', usdc: '25.0', fee: null, time: 1000, hash: '0x01' },
      ],
    });
    const [url, init] = mocks.fetch.mock.calls[0];
    expect(url).toBe('https://api.hyperliquid.xyz/info');
    expect(JSON.parse(init.body)).toMatchObject({ type: 'userNonFundingLedgerUpdates', user: mainWallet });
  });

  it('answers 502 with an empty list when Hyperliquid cannot be read', async () => {
    mocks.fetch.mockResolvedValue(new Response('busy', { status: 500 }));
    const response = await GET(request());
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.items).toEqual([]);
    expect(body.error).toBeTruthy();
  });

  it("refuses a workspace bought under someone else's subscription", async () => {
    database({ subscriptionOwner: 'customer-b' });
    const response = await GET(request());
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'TENANT_NOT_OWNED', items: [] });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
