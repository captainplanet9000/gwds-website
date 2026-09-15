import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { parseSignature, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { buildApproveAgentRequest } from '@/lib/hyperliquid-agent';
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
const agentAddress = `0x${'22'.repeat(20)}` as `0x${string}`;
const subscriptionId = '11111111-1111-4111-8111-111111111111';

// Produces the signature the way the browser does: the wallet returns a hex string, which the
// client splits with parseSignature into the {r, s, v} object Hyperliquid expects.
function splitSignature(hex: Hex) {
  const sig = parseSignature(hex);
  return { r: sig.r, s: sig.s, v: sig.v !== undefined ? Number(sig.v) : sig.yParity + 27 };
}

async function signedBody(opts: { signer?: typeof customerWallet; network?: 'mainnet' | 'testnet' } = {}) {
  const { action, nonce, typedData } = buildApproveAgentRequest(agentAddress, 'tenant-a', opts.network ?? 'testnet');
  const hex = await (opts.signer ?? customerWallet).signTypedData(typedData);
  return { action, nonce, signature: splitSignature(hex) } as Record<string, unknown>;
}

function request(body: unknown) {
  return new NextRequest('https://example.test/api/account/funding/approve-agent', {
    method: 'POST', body: JSON.stringify(body),
  });
}

function tenantRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tenant-a', slug: 'tenant-a', status: 'active', owner_email: 'a@example.test',
    hosting_subscription_id: subscriptionId, api_wallet_address: agentAddress,
    main_wallet_address: customerWallet.address, ...overrides,
  };
}

function database(tenant = tenantRow(), subscriptionOwner = 'customer-a') {
  mocks.db = fakeDb({
    tenants: [tenant],
    hosting_subscriptions: [{ id: subscriptionId, user_id: subscriptionOwner, status: 'active' }],
    tenant_env: [],
    env_key_policy: [{ key: 'HYPERLIQUID_NETWORK', default_value: 'testnet' }],
    hosting_audit: [],
  });
}

async function expectRefused(body: unknown, status: number, code: string) {
  const response = await POST(request(body));
  expect(response.status).toBe(status);
  expect((await response.json()).code).toBe(code);
  expect(mocks.fetch).not.toHaveBeenCalled();
}

describe('agent approval relay', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockReset();
    database();
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    { status: 'err', response: 'Invalid signature' },
    {},
    { status: 'ok', response: { type: 'unexpected' } },
  ])('does not report HTTP 200 rejection or malformed response as approval: %j', async body => {
    mocks.fetch.mockResolvedValue(Response.json(body));
    const response = await POST(request(await signedBody()));
    expect(response.status).toBe(502);
    expect((await response.json()).code).toBe('HYPERLIQUID_REJECTED');
  });

  it("relays the main wallet's approval to the tenant network's exchange", async () => {
    mocks.fetch.mockResolvedValue(Response.json({ status: 'ok', response: { type: 'default' } }));
    const body = await signedBody();
    const response = await POST(request(body));
    expect(response.status).toBe(200);
    expect((await response.json()).ok).toBe(true);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    const [url, init] = mocks.fetch.mock.calls[0];
    expect(url).toBe('https://api.hyperliquid-testnet.xyz/exchange');
    expect(JSON.parse(init.body)).toEqual(body);
    expect(mocks.db.inserts).toMatchObject([{ table: 'hosting_audit', row: { action: 'funding_agent_approval_relayed' } }]);
  });

  it('refuses an approval signed by a wallet other than the tenant main wallet', async () => {
    await expectRefused(await signedBody({ signer: otherWallet }), 403, 'SIGNER_MISMATCH');
  });

  it('rejects a raw hex signature instead of forwarding it to the exchange', async () => {
    const { action, nonce, typedData } = buildApproveAgentRequest(agentAddress, 'tenant-a', 'testnet');
    await expectRefused({ action, nonce, signature: await customerWallet.signTypedData(typedData) }, 400, 'INVALID_SIGNATURE');
  });

  it("refuses an approval signed for a network other than the tenant's", async () => {
    await expectRefused(await signedBody({ network: 'mainnet' }), 400, 'WRONG_NETWORK');
  });

  it('refuses a stale nonce', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now - 11 * 60 * 1000);
    const body = await signedBody();
    clock.mockRestore();
    await expectRefused(body, 400, 'SIGNATURE_EXPIRED');
  });

  it('refuses an action carrying fields beyond the approveAgent schema', async () => {
    const body = await signedBody();
    await expectRefused({ ...body, action: { ...(body.action as object), extra: 1 } }, 400, 'INVALID_ACTION');
  });

  it('refuses before the tenant has a main wallet', async () => {
    database(tenantRow({ main_wallet_address: null }));
    await expectRefused(await signedBody(), 409, 'MAIN_WALLET_NOT_PROVISIONED');
  });

  it("refuses a tenant whose purchase belongs to another customer", async () => {
    database(tenantRow(), 'customer-b');
    await expectRefused(await signedBody(), 403, 'TENANT_NOT_OWNED');
  });

  it('rejects another customer subscription before contacting the exchange', async () => {
    await expectRefused({ ...await signedBody(), subscriptionId: '22222222-2222-4222-8222-222222222222' }, 403, 'SUBSCRIPTION_NOT_OWNED');
  });
});
