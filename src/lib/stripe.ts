import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_REPLACE_ME') return null;
  if (!_stripe) _stripe = new Stripe(key, { apiVersion: '2024-12-18.acacia' as any });
  return _stripe;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && key !== 'sk_test_REPLACE_ME';
}
