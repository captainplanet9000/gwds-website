import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const state = vi.hoisted(() => ({ review: true, db: vi.fn(), stripe: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createServerClient: state.db }));
vi.mock('@/lib/stripe', () => ({ getStripe: state.stripe }));
vi.mock('@/lib/release-readiness', () => ({ needsReleaseAcceptance: () => state.review }));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'verified-customer', email: 'customer@example.test' }),
}));
import { POST } from './route';
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); state.review = true; });
describe('checkout release and duplicate-license guards', () => {
  it('blocks an unverified archive before creating an order or Stripe session', async () => {
    vi.stubEnv('NEXT_PUBLIC_STORE_SALES_ENABLED', 'true');
    const response = await POST(new NextRequest('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify({ acceptedTerms: true, items: [{productId: 'trading-dashboard-template', quantity: 1}] }) }));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('RELEASE_ACCEPTANCE_PENDING');
    expect(state.db).not.toHaveBeenCalled();
    expect(state.stripe).not.toHaveBeenCalled();
  });
  it('blocks overlapping licenses even when a caller bypasses cart normalization', async () => {
    state.review = false;
    vi.stubEnv('NEXT_PUBLIC_STORE_SALES_ENABLED', 'true');
    const response = await POST(new NextRequest('http://localhost/api/checkout', { method: 'POST', body: JSON.stringify({ acceptedTerms: true, items: ['trading-dashboard-template','darvas-indicator'].map(productId => ({productId,quantity:1})) }) }));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('INCLUDED_PRODUCT');
    expect(state.db).not.toHaveBeenCalled();
    expect(state.stripe).not.toHaveBeenCalled();
  });
});
