import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => ({
  history: [] as { id: string }[], historyError: null as null | { message: string },
  plan: { id: 'solo', name: 'Solo', price_cents: 2900, currency: 'usd', billing_interval: 'month', stripe_price_id_test: 'price_test_solo', stripe_price_id_live: 'price_live_solo', is_active: true, launch_ready: true },
  create: vi.fn(), expire: vi.fn(), retrieve: vi.fn(), rpc: vi.fn(),
}));
vi.mock('@/lib/commerce', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/commerce')>(),
  requireVerifiedUser: vi.fn().mockResolvedValue({ id: '10000000-0000-4000-8000-000000000001', email: 'buyer@example.com' }),
  getSiteUrl: () => 'https://www.civalsystems.com',
}));
vi.mock('@/lib/stripe', () => ({ getStripe: () => ({ prices: { retrieve: state.retrieve }, checkout: { sessions: { create: state.create, expire: state.expire } } }) }));
vi.mock('@/lib/supabase', () => ({ createServerClient: () => ({
  rpc: state.rpc,
  from: (table: string) => {
    let updating = false;
    const result = () => updating ? { data: null, error: null } : table === 'hosting_plans' ? { data: state.plan, error: null } : table === 'customers' ? { data: null, error: null } : { data: state.history, error: state.historyError };
    const query: Record<string, unknown> = {};
    for (const method of ['select','eq','not','limit']) query[method] = () => query;
    query.update = () => { updating = true; return query; };
    query.maybeSingle = async () => result();
    query.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result()).then(resolve);
    return query;
  },
}) }));
import { POST } from './route';

describe('hosting checkout trial and billing boundaries', () => {
  const env = { ...process.env };
  beforeEach(() => {
    vi.clearAllMocks(); state.history = []; state.historyError = null;
    Object.assign(state.plan, { id: 'solo', price_cents: 2900, is_active: true, launch_ready: true });
    process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED = 'true'; process.env.STRIPE_SECRET_KEY = 'sk_test_fixture';
    state.retrieve.mockResolvedValue({ active: true, livemode: false, type: 'recurring', currency: 'usd', unit_amount: 2900, recurring: { interval: 'month' } });
    state.rpc.mockResolvedValue({ data: [{ subscription_id: '20000000-0000-4000-8000-000000000001' }], error: null });
    state.create.mockResolvedValue({ id: 'cs_test_fixture', url: 'https://checkout.stripe.com/test' });
    state.expire.mockResolvedValue({ status: 'expired' });
  });
  afterEach(() => { process.env = { ...env }; });
  const request = (body: Record<string,unknown> = {}) => POST(new NextRequest('https://www.civalsystems.com/api/hosting/checkout', { method:'POST', body: JSON.stringify({planId:'solo',acceptedTerms:true,...body}) }));

  it('collects a card for seven days free and cancels if the payment method is later missing', async () => {
    expect((await request()).status).toBe(200);
    expect(state.create.mock.calls[0][0]).toMatchObject({ payment_method_collection: 'always', payment_method_types:['card'], subscription_data: {trial_period_days:7,trial_settings:{end_behavior:{missing_payment_method:'cancel'}}} });
    expect(state.create.mock.calls[0][0].custom_text.submit.message).toContain('unless you cancel');
  });
  it('does not grant another trial to a returning customer or trust a client trial flag', async () => {
    state.history = [{id:'old-canceled-subscription'}];
    expect((await request({trialDays:999,trialEligible:true})).status).toBe(200);
    expect(state.create.mock.calls[0][0].subscription_data.trial_period_days).toBeUndefined();
  });
  it('does not grant a trial to another plan', async () => {
    state.plan.id = 'desk';
    expect((await request({planId:'desk'})).status).toBe(200);
    expect(state.create.mock.calls[0][0].subscription_data.trial_period_days).toBeUndefined();
  });
  it('requires affirmative recurring-billing terms acceptance', async () => {
    expect((await request({acceptedTerms:false})).status).toBe(400);
    expect(state.create).not.toHaveBeenCalled();
  });
  it('fails closed when trial history cannot be checked', async () => {
    state.historyError = {message:'database unavailable'};
    expect((await request()).status).toBe(503);
    expect(state.rpc).not.toHaveBeenCalled();
  });
  it('rejects the retired zero-price plan', async () => {
    state.plan.id = 'paper'; state.plan.price_cents = 0;
    expect((await request({planId:'paper'})).status).toBe(503);
    expect(state.create).not.toHaveBeenCalled();
  });
  it('rejects a wrong-mode Stripe price before reserving capacity', async () => {
    state.retrieve.mockResolvedValue({active:true,livemode:true,type:'recurring',currency:'usd',unit_amount:2900,recurring:{interval:'month'}});
    expect((await request()).status).toBe(503);
    expect(state.rpc).not.toHaveBeenCalled();
  });
});
