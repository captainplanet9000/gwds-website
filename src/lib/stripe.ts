import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^(sk|rk)_(test|live)_/.test(key)) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && /^(sk|rk)_(test|live)_/.test(key);
}

/** Billing records choose their Stripe mode; never take this value from a request. */
export function getBillingStripe(livemode: boolean): Stripe {
  const primary = process.env.STRIPE_SECRET_KEY;
  const pattern = livemode ? /^(sk|rk)_live_/ : /^(sk|rk)_test_/;
  const key = primary && pattern.test(primary) ? primary : !livemode ? process.env.STRIPE_SECRET_KEY_TEST : undefined;
  if (!key || !pattern.test(key)) throw new Error('Stripe billing mode is not configured');
  return new Stripe(key);
}
