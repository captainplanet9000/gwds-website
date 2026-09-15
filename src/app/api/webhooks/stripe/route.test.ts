import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const HOSTING_SUBSCRIPTION_ID = '11111111-1111-4111-8111-111111111111';

const mocks = vi.hoisted(() => ({
  event: null as unknown,
  rpc: vi.fn(),
  retrieveSubscription: vi.fn(),
  updates: [] as Array<{ table: string; values: Record<string, unknown>; filters: Array<[string, unknown]> }>,
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    webhooks: { constructEvent: () => mocks.event },
    subscriptions: { retrieve: mocks.retrieveSubscription },
  }),
}));
vi.mock('@/lib/hosting-notifications', () => ({ deliverHostingNotification: vi.fn() }));
vi.mock('@/lib/supabase', () => ({
  createServerClient: () => ({
    rpc: async (name: string, args: unknown) => { mocks.rpc(name, args); return { data: [], error: null }; },
    from(table: string) {
      const entry = { table, values: {} as Record<string, unknown>, filters: [] as Array<[string, unknown]> };
      const query = {
        update: (values: Record<string, unknown>) => { entry.values = values; mocks.updates.push(entry); return query; },
        eq: (column: string, value: unknown) => { entry.filters.push([column, value]); return query; },
        then: (resolve: (value: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve),
      };
      return query;
    },
  }),
}));

function deliver(type: string, session: Record<string, unknown>) {
  mocks.event = { id: 'evt_1', type, livemode: false, data: { object: session } };
  return POST(new NextRequest('https://example.test/api/webhooks/stripe', {
    method: 'POST', body: '{}', headers: { 'stripe-signature': 'test-only' },
  }));
}

const hostingSession = {
  id: 'cs_1', mode: 'subscription',
  metadata: { commerce_kind: 'hosting', hosting_subscription_id: HOSTING_SUBSCRIPTION_ID, hosting_plan_id: 'solo', user_id: HOSTING_SUBSCRIPTION_ID },
};

describe('Stripe webhook, hosting checkout', () => {
  const env = { secret: process.env.STRIPE_WEBHOOK_SECRET, key: process.env.STRIPE_SECRET_KEY };
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_only';
    process.env.STRIPE_SECRET_KEY = 'sk_test_only';
    mocks.rpc.mockReset();
    mocks.retrieveSubscription.mockReset();
    mocks.updates.length = 0;
  });
  afterEach(() => {
    if (env.secret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET; else process.env.STRIPE_WEBHOOK_SECRET = env.secret;
    if (env.key === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = env.key;
  });

  it('does not activate or provision a checkout whose payment has not arrived', async () => {
    const response = await deliver('checkout.session.completed', { ...hostingSession, payment_status: 'unpaid' });
    expect(response.status).toBe(200);
    expect(mocks.retrieveSubscription).not.toHaveBeenCalled();
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it('records a failed async payment on the hosting subscription, not the store order', async () => {
    const response = await deliver('checkout.session.async_payment_failed', { ...hostingSession, payment_status: 'unpaid' });
    expect(response.status).toBe(200);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.updates).toEqual([{
      table: 'hosting_subscriptions',
      values: expect.objectContaining({ status: 'incomplete' }),
      filters: [['stripe_checkout_session_id', 'cs_1'], ['status', 'pending_checkout']],
    }]);
  });

  it('still routes a failed async payment for a store order to the order path', async () => {
    await deliver('checkout.session.async_payment_failed', { id: 'cs_2', metadata: { order_id: 'x' } });
    expect(mocks.rpc).toHaveBeenCalledWith('apply_store_order_status_event', expect.objectContaining({ p_status: 'payment_failed' }));
  });
});
