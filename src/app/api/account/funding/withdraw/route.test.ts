import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { parseSignature, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { FUNDING_NETWORKS, WITHDRAW_PRIMARY_TYPE, WITHDRAW_TYPES, withdrawDomain } from '@/lib/hyperliquid-funding';
import { fakeDb } from '../_test/fake-db';
import { POST } from './route';

const mocks = vi.hoisted(() => ({ db: null as unknown as ReturnType<typeof fakeDb>, fetch: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => mocks.db.client }));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
  enforceRateLimit: async () => undefined,
}));

// Well-known throwaway test keys (Hardhat accounts #1 and #2). Never funded; test-only.
const customerWallet = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const otherWallet = privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a');
const subscriptionId = '11111111-1111-4111-8111-111111111111';

// The wallet returns a hex signature; the panel splits it into {r, s, v} before posting.
function splitSignature(hex: Hex) {
  const sig = parseSignature(hex);
  return { r: sig.r, s: sig.s, v: sig.v !== undefined ? Number(sig.v) : sig.yParity + 27 };
}

async function signedWithdraw(opts: {
  signer?: typeof customerWallet; destination?: string; amount?: string; time?: number; network?: 'mainnet' | 'testnet';
} = {}) {
  const cfg = FUNDING_NETWORKS[opts.network ?? 'testnet'];
  const time = opts.time ?? Date.now();
  const destination = opts.destination ?? customerWallet.address.toLowerCase();
  const amount = opts.amount ?? '10';
  const hex = await (opts.signer ?? customerWallet).signTypedData({
    domain: withdrawDomain(cfg),
    types: WITHDRAW_TYPES,
    primaryType: WITHDRAW_PRIMARY_TYPE,
    message: { hyperliquidChain: cfg.hyperliquidChain, destination, amount, time: BigInt(time) },
  });
  const action = {
    type: 'withdraw3', hyperliquidChain: cfg.hyperliquidChain, signatureChainId: cfg.signatureChainId, amount, time, destination,
  };
  return { action, nonce: time, signature: splitSignature(hex) };
}

function request(body: unknown) {
  return new NextRequest('https://example.test/api/account/funding/withdraw', { method: 'POST', body: JSON.stringify(body) });
}

function database({ mainWallet = customerWallet.address as string | null, subscriptionOwner = 'customer-a', policy = true } = {}) {
  mocks.db = fakeDb({
    // A suspended workspace: the customer must still be able to take their money out.
    tenants: [{
      id: 'tenant-a', slug: 'tenant-a', status: 'suspended', owner_email: 'a@example.test',
      hosting_subscription_id: subscriptionId, main_wallet_address: mainWallet,
    }],
    hosting_subscriptions: [{ id: subscriptionId, user_id: subscriptionOwner, status: 'canceled' }],
    tenant_env: [],
    env_key_policy: policy ? [{ key: 'HYPERLIQUID_NETWORK', default_value: 'testnet' }] : [],
    hosting_audit: [],
  });
}

async function expectRefused(body: unknown, status: number, code: string) {
  const response = await POST(request(body));
  expect(response.status).toBe(status);
  expect((await response.json()).code).toBe(code);
  expect(mocks.fetch).not.toHaveBeenCalled();
}

describe('withdrawal relay', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockReset();
    database();
  });
  afterEach(() => vi.unstubAllGlobals());

  it("relays the customer's own signed withdrawal from a suspended workspace to the tenant network's exchange", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ status: 'ok', response: { type: 'default' } }));
    const body = await signedWithdraw();
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, status: 'ok', response: { type: 'default' } });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = mocks.fetch.mock.calls[0];
    expect(url).toBe('https://api.hyperliquid-testnet.xyz/exchange');
    expect(JSON.parse(init.body)).toEqual(body);
    expect(mocks.db.inserts).toMatchObject([{
      table: 'hosting_audit',
      row: { actor_type: 'customer', action: 'funding_withdraw_relayed', subscription_id: subscriptionId, metadata: { network: 'testnet', amount: '10' } },
    }]);
  });

  it('refuses a withdrawal signed by a different wallet', async () => {
    await expectRefused(await signedWithdraw({ signer: otherWallet }), 403, 'SIGNER_MISMATCH');
  });

  it.each([
    ['another wallet', otherWallet.address.toLowerCase()],
    ['the main wallet in checksum case (a different signed string)', customerWallet.address],
  ])('refuses a destination that is %s', async (_label, destination) => {
    await expectRefused(await signedWithdraw({ destination }), 403, 'DESTINATION_NOT_OWN_WALLET');
  });

  it('refuses a stale signature', async () => {
    await expectRefused(await signedWithdraw({ time: Date.now() - 11 * 60 * 1000 }), 400, 'SIGNATURE_EXPIRED');
  });

  it.each(['1', '0.5'])('refuses an amount of %s, which does not exceed the fee', async amount => {
    await expectRefused(await signedWithdraw({ amount }), 400, 'INVALID_AMOUNT');
  });

  it("refuses a withdrawal signed for a network other than the tenant's", async () => {
    await expectRefused(await signedWithdraw({ network: 'mainnet' }), 400, 'WRONG_NETWORK');
  });

  it("refuses a workspace bought under someone else's subscription", async () => {
    database({ subscriptionOwner: 'customer-b' });
    await expectRefused(await signedWithdraw(), 403, 'TENANT_NOT_OWNED');
  });

  it('refuses before the tenant has a main wallet', async () => {
    database({ mainWallet: null });
    await expectRefused(await signedWithdraw(), 409, 'MAIN_WALLET_NOT_PROVISIONED');
  });

  it('refuses when the tenant network cannot be resolved', async () => {
    database({ policy: false });
    await expectRefused(await signedWithdraw(), 409, 'NETWORK_UNKNOWN');
  });

  it('reports an HTTP 200 {status: "err"} from Hyperliquid as a failure, and still audits it', async () => {
    mocks.fetch.mockResolvedValue(Response.json({ status: 'err', response: 'Insufficient balance' }));
    const response = await POST(request(await signedWithdraw()));
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.code).toBe('HYPERLIQUID_REJECTED');
    expect(body.error).toContain('Insufficient balance');
    expect(mocks.db.inserts).toMatchObject([{ row: { metadata: { hlResponse: 'err' } } }]);
  });
});
