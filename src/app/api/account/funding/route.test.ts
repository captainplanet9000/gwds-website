import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { getAddress } from 'viem';
import { FUNDING_NETWORKS } from '@/lib/hyperliquid-funding';
import { fakeDb } from './_test/fake-db';
import { GET } from './route';

const mocks = vi.hoisted(() => ({ db: null as unknown as ReturnType<typeof fakeDb>, fetch: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => mocks.db.client }));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
  enforceRateLimit: async () => undefined,
}));

const mainWallet = getAddress(`0x${'ab'.repeat(20)}`);
const agentWallet = getAddress(`0x${'cd'.repeat(20)}`);
const subscriptionId = '11111111-1111-4111-8111-111111111111';

function database({ main = mainWallet as string | null, api = agentWallet as string | null, proven = true, policy = true, tenant = true } = {}) {
  mocks.db = fakeDb({
    hosting_subscriptions: [{ id: subscriptionId, user_id: 'customer-a', status: 'active', created_at: '2026-09-01' }],
    hosting_onboarding: [],
    hosting_audit: proven
      ? [{ user_id: 'customer-a', action: 'funding_wallet_verified', metadata: { address: mainWallet }, created_at: '2026-09-02' }]
      : [],
    tenants: tenant ? [{
      id: 'tenant-a', slug: 'tenant-a', display_name: 'Tenant A', status: 'active', owner_email: 'a@example.test',
      hosting_subscription_id: subscriptionId, main_wallet_address: main, api_wallet_address: api,
    }] : [],
    tenant_env: [],
    env_key_policy: policy ? [{ key: 'HYPERLIQUID_NETWORK', default_value: 'testnet' }] : [],
  });
}

// Hyperliquid and the Arbitrum Sepolia RPC, answered by URL. The spot read fails on purpose.
function network({ agentValidUntil = Date.now() + 86_400_000 } = {}) {
  mocks.fetch.mockImplementation(async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    if (url === 'https://api.hyperliquid-testnet.xyz/info') {
      if (body.type === 'clearinghouseState') return Response.json({ marginSummary: { accountValue: '42.5' }, withdrawable: '40.0' });
      if (body.type === 'spotClearinghouseState') throw new Error('spot endpoint down');
      if (body.type === 'extraAgents') {
        return Response.json([{ name: 'cival', address: agentWallet.toLowerCase(), validUntil: agentValidUntil }]);
      }
    }
    if (url === FUNDING_NETWORKS.testnet.rpcUrl) {
      if (body.method === 'eth_call') {
        return Response.json({ jsonrpc: '2.0', id: body.id, result: `0x${(25_500_000).toString(16).padStart(64, '0')}` });
      }
      if (body.method === 'eth_getBalance') {
        return Response.json({ jsonrpc: '2.0', id: body.id, result: `0x${(10 ** 15).toString(16)}` });
      }
    }
    throw new Error(`unexpected request ${url} ${init.body}`);
  });
}

const request = (query = '') => new NextRequest(`https://example.test/api/account/funding${query}`);

describe('funding status', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch);
    vi.stubEnv('ARBITRUM_RPC_URL', '');
    mocks.fetch.mockReset();
    database();
    network();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("reports a ready tenant with its network config and balances, a failed read as null", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const body = await response.json();
    expect(body).toMatchObject({
      state: 'ready', hasTenant: true, network: 'testnet', config: FUNDING_NETWORKS.testnet,
      minDepositUsdc: 5, withdrawFeeUsdc: 1, verifiedAddress: mainWallet, addressMismatch: false, agentApproved: true,
      subscriptionId,
      tenant: { slug: 'tenant-a', status: 'active', mainWallet, apiWallet: agentWallet, mainWalletAddress: mainWallet },
      balances: {
        accountValue: '42.5', withdrawable: '40.0', spotUsdc: null, walletUsdc: '25.5', gasEth: '0.001',
        arbitrumUsdc: 25.5, hyperliquidAccountValueKnown: true, fundsArrived: true,
      },
    });
  });

  it('does not count an expired agent approval', async () => {
    network({ agentValidUntil: Date.now() - 1000 });
    expect((await (await GET(request())).json()).agentApproved).toBe(false);
  });

  it('asks for a wallet when the tenant has none and nothing is verified', async () => {
    database({ main: null, api: null, proven: false });
    const body = await (await GET(request())).json();
    expect(body).toMatchObject({ state: 'awaiting_wallet', verifiedAddress: null, agentApproved: null, balances: { accountValue: null } });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('reports provisioning once the wallet is verified but the tenant has no main wallet yet', async () => {
    database({ main: null, api: null });
    expect(await (await GET(request())).json()).toMatchObject({ state: 'provisioning', verifiedAddress: mainWallet });
  });

  it('never guesses the network', async () => {
    database({ policy: false });
    const body = await (await GET(request())).json();
    expect(body).toMatchObject({ state: 'network_unknown', network: null, config: null, balances: { walletUsdc: null } });
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('reports no tenant', async () => {
    database({ tenant: false });
    expect(await (await GET(request())).json()).toMatchObject({ state: 'no_tenant', hasTenant: false, tenant: null, config: null });
  });

  it("refuses a subscription id that is not the customer's", async () => {
    const response = await GET(request('?subscriptionId=22222222-2222-4222-8222-222222222222'));
    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe('SUBSCRIPTION_NOT_OWNED');
  });
});
