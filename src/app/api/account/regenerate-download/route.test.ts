import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => ({ status: 'partially_refunded', owner: 'owner', entitlement: 'active', issued: 0 }));
vi.mock('@/lib/commerce', async (original) => ({
  ...await original<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: vi.fn(async () => ({ id: 'owner', email: 'owner@example.invalid' })),
  getSiteUrl: () => 'https://www.civalsystems.com',
}));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({
  storage: { from: () => ({ createSignedUrl: async () => ({ data: { signedUrl: 'https://storage.example.invalid/signed' } }) }) },
  from(table: string) {
    const filters: Record<string, unknown> = {};
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters[key] = value; return query; },
      in: (key: string, value: unknown) => { filters[key] = value; return query; },
      maybeSingle: async () => {
        if (table === 'orders') return { data: (filters.status as string[]).includes(state.status) && filters.user_id === state.owner ? { id: '11111111-1111-4111-8111-111111111111' } : null };
        if (table === 'order_items') return { data: { id: 'item' } };
        if (table === 'entitlements') return { data: state.entitlement === filters.status ? { id: 'license' } : null };
        if (table === 'products') return { data: { artifact_ready: true, artifact_path: 'fixture.zip', artifact_sha256: 'a'.repeat(64), artifact_size_bytes: 100 } };
        throw new Error(`Unexpected table ${table}`);
      },
      upsert: async () => { state.issued++; return { error: null }; },
    };
    return query;
  },
}) }));
import { POST } from './route';

function request() {
  return new NextRequest('https://www.civalsystems.com/api/account/regenerate-download', { method: 'POST', body: JSON.stringify({ orderId: '11111111-1111-4111-8111-111111111111', productId: 'trading-dashboard-template' }) });
}
beforeEach(() => { state.status = 'partially_refunded'; state.owner = 'owner'; state.entitlement = 'active'; state.issued = 0; });
describe('refund download access', () => {
  it.each(['paid', 'completed', 'partially_refunded'])('issues an owner download for an active license on %s', async (status) => {
    state.status = status;
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect((await response.json()).downloadUrl).toContain('/api/downloads/');
    expect(state.issued).toBe(1);
  });
  it.each(['refunded', 'disputed', 'dispute_lost', 'pending', 'payment_failed'])('denies %s orders without issuing a token', async (status) => {
    state.status = status;
    expect((await POST(request())).status).toBe(404);
    expect(state.issued).toBe(0);
  });
  it('still denies a revoked partial-refund license', async () => {
    state.entitlement = 'revoked';
    expect((await POST(request())).status).toBe(403);
    expect(state.issued).toBe(0);
  });
  it('does not grant access to another customer after a partial refund', async () => {
    state.owner = 'other-owner';
    expect((await POST(request())).status).toBe(404);
    expect(state.issued).toBe(0);
  });
});
