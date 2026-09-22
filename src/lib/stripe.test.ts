import { afterEach, describe, expect, it, vi } from 'vitest';
import { getStripe, isStripeConfigured } from './stripe';
import { isLiveStripeKey } from './commerce';

afterEach(() => vi.unstubAllEnvs());

describe('Stripe credential modes', () => {
  it.each(['sk_live_', 'rk_live_'])('accepts %s as live server credentials', prefix => {
    vi.stubEnv('STRIPE_SECRET_KEY', `${prefix}fixture_not_a_real_key`);
    expect(isStripeConfigured()).toBe(true);
    expect(isLiveStripeKey()).toBe(true);
    expect(() => getStripe()).not.toThrow();
  });

  it.each(['sk_test_', 'rk_test_'])('accepts %s without classifying it as live', prefix => {
    vi.stubEnv('STRIPE_SECRET_KEY', `${prefix}fixture_not_a_real_key`);
    expect(isStripeConfigured()).toBe(true);
    expect(isLiveStripeKey()).toBe(false);
  });

  it.each(['pk_live_fixture', '', 'unrecognized'])('rejects invalid server credentials', key => {
    vi.stubEnv('STRIPE_SECRET_KEY', key);
    expect(isStripeConfigured()).toBe(false);
    expect(() => getStripe()).toThrow();
  });
});
