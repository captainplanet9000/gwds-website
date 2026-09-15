import type Stripe from 'stripe';
import { CommerceError } from '@/lib/commerce';
import { resolveAgentLimit } from '@/lib/loadout';
import { getProduct } from '@/lib/products';

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

/**
 * Onboarding agent id -> the storefront product id control.tenant_loadout stores.
 *
 * MIRRORS the CASE in control.sync_tenant_loadout_from_onboarding (the live control-plane
 * definition), which is what actually installs an approved request. 'regime-coordinator' has no
 * product there, so it is deliberately absent here and a request naming it is never auto-approved.
 */
export const ONBOARDING_AGENT_PRODUCTS: Readonly<Record<string, string>> = {
  'darvas-box': 'darvas-indicator',
  'elliott-wave': 'elliott-wave-agent',
  'vwap-momentum': 'vwap-momentum-agent',
  'heikin-ashi': 'heikin-ashi-agent',
  'mean-reversion': 'mean-reversion-agent',
  'macro-sentiment': 'macro-sentiment-agent',
};

export type OnboardingDecision =
  | { approved: true; mappedAgents: string[] }
  | { approved: false; reason: string; mappedAgents: string[] };

/**
 * Whether a submitted onboarding request can be approved without an operator.
 *
 * Every condition must hold: billing is active or trialing, every requested agent maps to a
 * product, the mapped count fits the plan's agent_limit, and the customer is entitled to every
 * mapped product. Anything else is held for operator review WITH the reason, never silently
 * dropped. Risk limits are validated by the route before this runs. The host agent re-checks
 * entitlement and the cap before installing, so this is a gate on review, not the last line.
 */
export function decideOnboardingApproval(input: {
  subscriptionStatus: string;
  requestedAgents: readonly string[];
  agentLimit: number | null | undefined;
  entitledProductIds: ReadonlySet<string>;
}): OnboardingDecision {
  const mappedAgents: string[] = [];
  const unmapped: string[] = [];
  for (const agent of input.requestedAgents) {
    const product = ONBOARDING_AGENT_PRODUCTS[agent];
    if (product) mappedAgents.push(product);
    else unmapped.push(agent);
  }
  const hold = (reason: string): OnboardingDecision => ({ approved: false, reason, mappedAgents });

  if (!['active', 'trialing'].includes(input.subscriptionStatus)) {
    return hold('Your subscription is not active, so an operator reviews these settings.');
  }
  if (unmapped.length) {
    return hold(`${unmapped.join(', ')} is not available as a hosted agent yet, so an operator reviews this request.`);
  }
  // A NULL agent_limit is exactly what the loadout sync refuses to install against, so it cannot
  // be approved automatically either.
  if (typeof input.agentLimit !== 'number' || !Number.isFinite(input.agentLimit) || input.agentLimit < 1) {
    return hold('Your plan has no agent capacity set yet, so an operator reviews this request.');
  }
  const limit = resolveAgentLimit(input.agentLimit);
  if (mappedAgents.length > limit) {
    return hold(`Your plan runs up to ${limit} agent${limit === 1 ? '' : 's'} and ${mappedAgents.length} were requested, so an operator reviews this request.`);
  }
  const notEntitled = mappedAgents.filter((id) => !input.entitledProductIds.has(id));
  if (notEntitled.length) {
    const names = notEntitled.map((id) => getProduct(id)?.name || id).join(', ');
    return hold(`Your account does not include ${names}, so an operator reviews this request.`);
  }
  return { approved: true, mappedAgents };
}

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
