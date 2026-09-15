import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { parseSignature } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { buildApproveAgentRequest } from '@/lib/hyperliquid-agent';
import { POST } from './route';

const mocks = vi.hoisted(() => ({ from: vi.fn(), fetch: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({ from: mocks.from }) }));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
}));
vi.mock('@/lib/control-plane', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/control-plane')>(),
  controlClient: () => ({ from: mocks.from }),
  resolveOwnedTenant: async () => ({ id: 'tenant-a' }),
}));

// Well-known throwaway test keys (Hardhat accounts #1 and #2). Never funded; test-only.
const customerWallet = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');
const otherWallet = privateKeyToAccount('0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a');
const agentAddress = `0x${'22'.repeat(20)}` as `0x${string}`;

// Signs exactly what the funding page signs, and sends it the way the page sends it: {r, s, v}.
async function signedBody(signer = customerWallet, subscriptionId?: string) {
  const { action, nonce, typedData } = buildApproveAgentRequest(agentAddress, 'tenant-a');
  const sig = parseSignature(await signer.signTypedData(typedData));
  return { subscriptionId, action, nonce, signature: { r: sig.r, s: sig.s, v: Number(sig.v) } };
}

function request(body: unknown) {
  return new NextRequest('https://example.test/api/account/funding/approve-agent', {
    method: 'POST', body: JSON.stringify(body),
  });
}

let tenantRow: Record<string, unknown>;

describe('agent approval relay', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockReset();
    tenantRow = { slug: 'tenant-a', api_wallet_address: agentAddress, main_wallet_address: customerWallet.address };
    mocks.from.mockImplementation(() => {
      const query = {
        select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: tenantRow, error: null }),
        insert: async () => ({ error: null }),
      };
      return query;
    });
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

  it('reports the documented exchange confirmation as success', async () => {
    mocks.fetch.mockResolvedValue(Response.json({ status: 'ok', response: { type: 'default' } }));
    const response = await POST(request(await signedBody()));
    expect(response.status).toBe(200);
    expect((await response.json()).ok).toBe(true);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('refuses an approval signed by a wallet other than the tenant main wallet', async () => {
    const response = await POST(request(await signedBody(otherWallet)));
    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe('SIGNER_MISMATCH');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('refuses before the customer has a verified main wallet', async () => {
    tenantRow = { ...tenantRow, main_wallet_address: null };
    const response = await POST(request(await signedBody()));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('MAIN_WALLET_NOT_VERIFIED');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('rejects a raw hex signature instead of forwarding it to the exchange', async () => {
    const body = await signedBody();
    const response = await POST(request({ ...body, signature: '0xdeadbeef' }));
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe('INVALID_SIGNATURE');
    expect(mocks.fetch).not.toHaveBeenCalled();
  });

  it('rejects another customer subscription before contacting the exchange', async () => {
    const response = await POST(request(await signedBody(customerWallet, '11111111-1111-4111-8111-111111111111')));
    expect(response.status).toBe(403);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
