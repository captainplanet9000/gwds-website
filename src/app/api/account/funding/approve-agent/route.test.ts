import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
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

const agentAddress = `0x${'22'.repeat(20)}`;
function request(subscriptionId?: string) {
  return new NextRequest('https://example.test/api/account/funding/approve-agent', {
    method: 'POST', body: JSON.stringify({ subscriptionId,
      action: { type: 'approveAgent', agentAddress, nonce: 123 },
      nonce: 123, signature: { r: 'test-only', s: 'test-only' },
    }),
  });
}

describe('agent approval confirmation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mocks.fetch);
    mocks.fetch.mockReset();
    mocks.from.mockImplementation((table: string) => {
      const query = {
        select: () => query, eq: () => query,
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: { slug: 'tenant-a', api_wallet_address: agentAddress }, error: null }),
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
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect((await response.json()).code).toBe('HYPERLIQUID_REJECTED');
  });

  it('reports the documented exchange confirmation as success', async () => {
    mocks.fetch.mockResolvedValue(Response.json({ status: 'ok', response: { type: 'default' } }));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect((await response.json()).ok).toBe(true);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects another customer subscription before contacting the exchange', async () => {
    const response = await POST(request('11111111-1111-4111-8111-111111111111'));
    expect(response.status).toBe(403);
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
});
