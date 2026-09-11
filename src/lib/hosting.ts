import type Stripe from 'stripe';
import { CommerceError } from '@/lib/commerce';

export const HOSTING_SERVICE_TERMS_VERSION = '2026-08-20';

// HOSTING_PLAN_COPY used to live here: a hardcoded second copy of the four plans' names, prices,
// descriptions and features. Removed rather than corrected. Nothing rendered it (only a test read
// it), and it had already drifted into describing all four tiers as paper-only long after the paid
// ones were re-specified to run live agents. public.hosting_plans is the single source for plan
// copy and capacity; /hosted and /account/hosting read it directly.

export const HOSTING_AGENT_IDS = [
  'darvas-box',
  'elliott-wave',
  'vwap-momentum',
  'heikin-ashi',
  'mean-reversion',
  'macro-sentiment',
  'regime-coordinator',
] as const;

export type HostingExecutionMode = 'simulated' | 'live';

/**
 * Whether a hosting plan's agents place real orders or simulated ones.
 *
 * DERIVED FROM PRICE, NOT FROM THE PLAN'S NAME OR ID, because price is the actual reason: a free
 * tenant consumes the same scarce Hyperliquid egress-IP request weight as a paying one, and a
 * free account that can move real money is an abuse vector with no cost to the abuser. Keeping
 * the free tier simulated is what makes offering a free tier defensible at all.
 *
 * So this is the invariant, not a label: a plan that costs nothing executes nothing. Any future
 * free tier inherits the same rule automatically, and renaming "Paper" cannot accidentally arm it.
 */
export function planExecutionMode(priceCents: number): HostingExecutionMode {
  return priceCents > 0 ? 'live' : 'simulated';
}

export function hostingSalesEnabled() {
  return process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === 'true';
}

export function hostingLaunchMessage() {
  return 'Hosted subscriptions are paused until the runtime, tenant isolation, monitoring, and recovery launch gates pass. No payment was taken.';
}

export function normalizeHostingText(value: unknown, maxLength: number, required = false): string | null {
  if (typeof value !== 'string') {
    if (required) throw new CommerceError('INVALID_INPUT', 'A required field is missing.');
    return null;
  }
  const normalized = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
  if (required && !normalized) throw new CommerceError('INVALID_INPUT', 'A required field is missing.');
  return normalized || null;
}

export function parsePeriod(subscription: Stripe.Subscription) {
  const record = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const item = subscription.items.data[0] as Stripe.SubscriptionItem & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const start = record.current_period_start ?? item?.current_period_start;
  const end = record.current_period_end ?? item?.current_period_end;
  return {
    start: start ? new Date(start * 1000).toISOString() : null,
    end: end ? new Date(end * 1000).toISOString() : null,
    trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
  };
}

export function publicHostingConfig() {
  return {
    salesEnabled: hostingSalesEnabled(),
    serviceTermsVersion: HOSTING_SERVICE_TERMS_VERSION,
  };
}
