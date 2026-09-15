import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, POST } from './route';

const PENDING_ID = '11111111-1111-4111-8111-111111111111';

const mocks = vi.hoisted(() => ({
  hosts: [] as Array<{ admissions_enabled: boolean; available_slots: number }>,
  unfinished: [] as Array<Record<string, unknown>>,
  pendingRow: null as Record<string, unknown> | null,
  updates: [] as Array<Record<string, unknown>>,
  rpc: vi.fn(),
  retrieveSession: vi.fn(),
  expireSession: vi.fn(),
  createSession: vi.fn(),
}));

vi.mock('@/lib/commerce', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: async () => ({ id: 'customer-a', email: 'a@example.test' }),
}));
vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: { sessions: { retrieve: mocks.retrieveSession, expire: mocks.expireSession, create: mocks.createSession } },
    prices: { retrieve: async () => { throw new Error('not reached in these tests'); } },
  }),
}));
vi.mock('@/lib/supabase', () => ({
  createServerClient: () => ({
    rpc: async (name: string) => {
      mocks.rpc(name);
      return name === 'hosting_host_capacity' ? { data: mocks.hosts, error: null } : { data: null, error: { message: 'unexpected' } };
    },
    from(table: string) {
      let patch: Record<string, unknown> | null = null;
      const query = {
        select: () => query, eq: () => query, in: () => query, is: () => query, order: () => query,
        update: (values: Record<string, unknown>) => { patch = values; mocks.updates.push(values); return query; },
        maybeSingle: async () => {
          if (table === 'hosting_plans') {
            return { data: { id: 'solo', name: 'Solo', price_cents: 4900, currency: 'usd', billing_interval: 'month', stripe_price_id: 'price_x', is_active: true, launch_ready: true }, error: null };
          }
          if (patch) return { data: { id: PENDING_ID }, error: null };
          return { data: mocks.pendingRow, error: null };
        },
        then: (resolve: (value: unknown) => unknown) => Promise.resolve(
          patch ? { error: null } : { data: mocks.unfinished, error: null },
        ).then(resolve),
      };
      return query;
    },
  }),
}));

function post(body: Record<string, unknown>) {
  return new NextRequest('https://example.test/api/hosting/checkout', { method: 'POST', body: JSON.stringify(body) });
}

describe('hosting checkout', () => {
  const originalSales = process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED;
  beforeEach(() => {
    process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = 'true';
    mocks.hosts = [{ admissions_enabled: true, available_slots: 3 }];
    mocks.unfinished = [];
    mocks.pendingRow = null;
    mocks.updates.length = 0;
    for (const fn of [mocks.rpc, mocks.retrieveSession, mocks.expireSession, mocks.createSession]) fn.mockReset();
  });
  afterEach(() => {
    if (originalSales === undefined) delete process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED;
    else process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = originalSales;
  });

  it('refuses before creating anything when no host is admitting tenants', async () => {
    mocks.hosts = [{ admissions_enabled: false, available_slots: 5 }, { admissions_enabled: true, available_slots: 0 }];
    const response = await POST(post({ planId: 'solo', acceptedTerms: true }));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('HOSTING_NO_HOST_AVAILABLE');
    expect(mocks.rpc).not.toHaveBeenCalledWith('create_hosting_checkout');
    expect(mocks.createSession).not.toHaveBeenCalled();
  });

  it('resumes an unfinished checkout for the same plan without asking for the terms again', async () => {
    mocks.unfinished = [{ id: PENDING_ID, plan_id: 'solo', status: 'pending_checkout', stripe_checkout_session_id: 'cs_open', created_at: new Date().toISOString() }];
    mocks.retrieveSession.mockResolvedValue({ id: 'cs_open', status: 'open', url: 'https://checkout.stripe.test/cs_open' });
    const response = await POST(post({ planId: 'solo' }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ stripeUrl: 'https://checkout.stripe.test/cs_open', subscriptionId: PENDING_ID, resumed: true });
    expect(mocks.updates).toEqual([]);
  });

  it('closes an expired checkout and asks the customer to start again', async () => {
    mocks.unfinished = [{ id: PENDING_ID, plan_id: 'solo', status: 'pending_checkout', stripe_checkout_session_id: 'cs_old', created_at: '2026-09-01T00:00:00Z' }];
    mocks.retrieveSession.mockResolvedValue({ id: 'cs_old', status: 'expired', url: null });
    const response = await POST(post({ planId: 'solo' }));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('CHECKOUT_RESTART_REQUIRED');
    expect(mocks.updates).toContainEqual(expect.objectContaining({ status: 'incomplete_expired' }));
  });

  it('never replaces a checkout Stripe has already been paid for', async () => {
    mocks.unfinished = [{ id: PENDING_ID, plan_id: 'solo', status: 'pending_checkout', stripe_checkout_session_id: 'cs_paid', created_at: new Date().toISOString() }];
    mocks.retrieveSession.mockResolvedValue({ id: 'cs_paid', status: 'complete', payment_status: 'paid' });
    const response = await POST(post({ planId: 'solo', acceptedTerms: true }));
    expect(response.status).toBe(409);
    expect((await response.json()).code).toBe('CHECKOUT_ALREADY_PAID');
    expect(mocks.updates).toEqual([]);
  });

  it('cancels a pending checkout by expiring the Stripe session first', async () => {
    mocks.pendingRow = { id: PENDING_ID, status: 'pending_checkout', stripe_checkout_session_id: 'cs_open' };
    mocks.retrieveSession.mockResolvedValue({ id: 'cs_open', status: 'open' });
    mocks.expireSession.mockResolvedValue({ id: 'cs_open', status: 'expired' });
    const response = await DELETE(new NextRequest(`https://example.test/api/hosting/checkout?subscriptionId=${PENDING_ID}`, { method: 'DELETE' }));
    expect(response.status).toBe(200);
    expect(mocks.expireSession).toHaveBeenCalledWith('cs_open');
    expect(mocks.updates).toContainEqual(expect.objectContaining({ status: 'incomplete_expired' }));
  });

  it('refuses to cancel anything but an unfinished checkout', async () => {
    mocks.pendingRow = { id: PENDING_ID, status: 'active', stripe_checkout_session_id: 'cs_done' };
    const response = await DELETE(new NextRequest(`https://example.test/api/hosting/checkout?subscriptionId=${PENDING_ID}`, { method: 'DELETE' }));
    expect(response.status).toBe(409);
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.updates).toEqual([]);
  });
});
