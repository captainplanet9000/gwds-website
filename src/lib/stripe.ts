import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !/^sk_(test|live)_/.test(key)) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && /^sk_(test|live)_/.test(key);
}
