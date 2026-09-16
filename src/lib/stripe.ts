import Stripe from 'stripe';

// Two Stripe modes, two separate clients: the box's control-plane database now backs BOTH the
// live www.civalsystems.com and the test-mode pilot.civalsystems.com, so a single "current"
// Stripe key can no longer serve every hosting_subscriptions row -- some were created against the
// pilot site's TEST-mode Stripe account (see hosting_subscriptions.livemode), and a live-mode key
// cannot see a test-mode object at all: Stripe's own API returns "a similar object exists in test
// mode, but a live mode key was used" (confirmed live, 2026-09-16). Cached per mode so a warm
// serverless instance never hands back the wrong client for a later, different-mode call.
const clients = new Map<boolean, Stripe>();

function keyFor(livemode: boolean): string | undefined {
  return livemode ? process.env.STRIPE_SECRET_KEY : (process.env.STRIPE_SECRET_KEY_TEST || process.env.STRIPE_SECRET_KEY);
}

/**
 * `livemode` defaults to true (the storefront's own commerce -- physical/digital product orders,
 * and the webhook's own signature verification / default lookups) is always live-mode; only
 * hosting billing actions that already know a subscription's own `livemode` flag should pass it
 * explicitly. This keeps every existing call site's behavior byte-for-byte unchanged.
 */
export function getStripe(livemode: boolean = true): Stripe {
  const key = keyFor(livemode);
  if (!key || !/^sk_(test|live)_/.test(key)) {
    throw new Error(`STRIPE_SECRET_KEY${livemode ? '' : '_TEST'} is not configured`);
  }
  let client = clients.get(livemode);
  if (!client) {
    client = new Stripe(key);
    clients.set(livemode, client);
  }
  return client;
}

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && /^sk_(test|live)_/.test(key);
}
