// ─────────────────────────────────────────────────────────────────────────────────────────────
// PAID-CUSTOMER LIFECYCLE RULES shared by /account/hosting (a "use client" page) and the hosting
// API routes. Pure and CLIENT-SAFE on purpose: this file must never import anything that reaches
// @/lib/supabase (which reads the service-role key), so it can sit in the browser bundle.
// ─────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Subscription statuses that are still "the customer's subscription". This is the same set
 * public.create_hosting_checkout refuses a second checkout for (OPEN_SUBSCRIPTION_EXISTS), so the
 * page never shows a plan picker the server would then refuse. 'incomplete' is included for that
 * reason: showing the picker while one exists would only produce an error.
 */
export const OPEN_SUBSCRIPTION_STATUSES = [
  'trialing',
  'active',
  'past_due',
  'paused',
  'unpaid',
  'incomplete',
  'pending_checkout',
] as const;

export function isOpenSubscriptionStatus(status: unknown): boolean {
  return typeof status === 'string' && (OPEN_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
}

/**
 * Picks the subscription the account page is about, from rows ordered NEWEST FIRST (the order
 * GET /api/hosting/account returns). A closed row (canceled, incomplete_expired) is never the
 * current subscription: it only becomes the one-line history shown above the plan picker, so a
 * customer who canceled or abandoned a checkout can subscribe again.
 */
export function selectCurrentSubscription<T extends { status?: unknown }>(
  rows: readonly T[] | null | undefined,
): { current: T | null; lastClosed: T | null } {
  const list = rows || [];
  const current = list.find((row) => isOpenSubscriptionStatus(row.status)) || null;
  const lastClosed = current ? null : list.find((row) => !isOpenSubscriptionStatus(row.status)) || null;
  return { current, lastClosed };
}

/** The host agent's refusal for a paid signup whose funding wallet is not proven yet. */
export const WALLET_UNVERIFIED_ERROR_CODE = 'host-agent.wallet_unverified';

export type ProvisionState =
  | 'checkout_pending' // no payment confirmed yet
  | 'setting_up' // paid, no tenant row yet
  | 'wallet_needed' // waiting on the customer's signed wallet proof
  | 'in_progress' // a provision command is queued, claimed or just finished
  | 'failed' // the latest provision failed for a reason other than the wallet
  | 'ready' // tenant active
  | 'inactive'; // billing not in good standing, or tenant suspended/paused/archived

/**
 * What the provisioning section should say, from the subscription status and the
 * /api/hosting/provision-status payload.
 *
 * A provisioning tenant with NO provision command means provision_hosting_tenant stopped at
 * 'awaiting_wallet': it creates the tenant but will not queue work until the customer's wallet is
 * proven. That, and a provision refused with host-agent.wallet_unverified, are the customer's next
 * step, not a failure, and must never be shown as one.
 */
export function deriveProvisionState(input: {
  subscriptionStatus: string | null | undefined;
  tenant: { status?: unknown } | null | undefined;
  command: { status?: unknown; errorCode?: unknown } | null | undefined;
}): ProvisionState {
  const { subscriptionStatus, tenant, command } = input;
  if (subscriptionStatus === 'pending_checkout' || subscriptionStatus === 'incomplete') return 'checkout_pending';
  if (!tenant) {
    // provision_hosting_tenant only ever runs for an active or trialing subscription.
    return subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? 'setting_up' : 'inactive';
  }
  if (tenant.status === 'active') return 'ready';
  if (tenant.status !== 'provisioning') return 'inactive';
  if (!command) return 'wallet_needed';
  if (command.status === 'failed') {
    return command.errorCode === WALLET_UNVERIFIED_ERROR_CODE ? 'wallet_needed' : 'failed';
  }
  return 'in_progress';
}

/**
 * How long to wait before polling provision-status again; null stops polling. Fast while the
 * system itself is working, slow while it waits on a person (the customer's wallet, or the
 * automatic retry backoff that starts at five minutes), and stopped once there is nothing left
 * that can change on its own.
 */
export function provisionPollDelayMs(state: ProvisionState): number | null {
  switch (state) {
    case 'setting_up':
    case 'in_progress':
      return 6_000;
    case 'wallet_needed':
    case 'failed':
      return 20_000;
    default:
      return null;
  }
}
