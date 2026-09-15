import { createServerClient } from '@/lib/supabase';
import { CommerceError } from '@/lib/commerce';
import { isFundingNetwork, type FundingNetwork } from '@/lib/hyperliquid-funding';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// Shared helpers for the admin panel's view onto the hosting CONTROL PLANE (C:/GWDS/hosting).
//
// The control plane lives in the `control` schema of the same Supabase project the storefront
// already uses (see .env.local NEXT_PUBLIC_SUPABASE_URL). It holds fleet identity, halts,
// schedules, cycle leases and an append-only audit trail for tenant processes that run on the
// owner's own workstation -- NOT the storefront's own commerce data, and NOT trading data (no
// orders, no fills, no positions; those stay inside each tenant).
//
// THE ARCHITECTURE THIS CLIENT PARTICIPATES IN: Vercel cannot reach a tenant process (they bind
// 127.0.0.1 only) and cannot spawn anything on the owner's box. So these routes never touch a
// tenant directly. They write INTENT into control.tenant_commands and read OBSERVED state back
// out of control.* -- a small host-side agent polling that queue is the only thing that ever
// performs an action. See db/migrations/0013_tenant_commands.sql for the full reasoning.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export const TENANT_STATUSES = ['provisioning', 'active', 'paused', 'suspended', 'archived'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const TENANT_COMMANDS = [
  'start', 'stop', 'suspend', 'resume', 'halt', 'unhalt', 'provision', 'deprovision',
] as const;
export type TenantCommand = (typeof TENANT_COMMANDS)[number];

export const PROCESS_STATES = ['stopped', 'starting', 'running', 'stopping', 'failed', 'unknown'] as const;
export type ProcessState = (typeof PROCESS_STATES)[number];

export type TenantHealth = 'unknown' | 'healthy' | 'degraded' | 'unreachable';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export function isValidTenantSlug(value: unknown): value is string {
  return typeof value === 'string' && SLUG_PATTERN.test(value);
}

// A client scoped to the `control` schema, using the SAME service-role credential the rest of the
// admin API already uses (never the anon key -- see createServerClient()). Reached only after
// requireAdmin has already run in the calling route; there is no operator-vs-support distinction
// enforced at the database layer here because the storefront's own admin session IS the identity
// boundary for this schema (control.is_operator() gates a DIFFERENT caller: a tenant's own
// `authenticated` session, which never applies to this admin surface).
export function controlClient() {
  return createServerClient().schema('control');
}

export const HEALTHY_HEARTBEAT_WINDOW_MS = 5 * 60 * 1000;

// Why a tenant landed on the health it did. Four different situations previously collapsed into
// the single word "degraded", which told whoever read it nothing about what to do next.
export const TENANT_HEALTH_REASONS = [
  'ok',                 // running, checked in inside the heartbeat window
  'no_runtime_report',  // no tenant_runtime row, or state 'unknown' -- the host has said nothing
  'process_failed',     // supervisor recorded state 'failed'
  'process_stopped',    // supervisor recorded state 'stopped'
  'process_stopping',   // mid shutdown
  'process_starting',   // mid startup
  'no_heartbeat',       // claims 'running' but has never written a heartbeat
  'stale_heartbeat',    // claims 'running' but last heartbeat is older than the window
] as const;
export type TenantHealthReason = (typeof TENANT_HEALTH_REASONS)[number];

export interface TenantHealthAssessment {
  health: TenantHealth;
  reason: TenantHealthReason;
  // Age of the last heartbeat at assessment time; null when the row has never recorded one (or
  // recorded an unparseable one). Callers format this for their own audience rather than this
  // helper inventing prose that has to read well for both a customer and an operator.
  heartbeatAgeMs: number | null;
}

// Derives a coarse health signal purely from what the host-side supervisor already recorded in
// control.tenant_runtime. Deliberately does NOT attempt to reach the tenant itself -- Vercel
// cannot connect to a loopback-only port, and pretending otherwise is exactly the kind of "control
// plane opens a connection to the tenant" shortcut the architecture forbids.
//
// Verdict and reason are produced by this ONE function so a surface cannot show a health of
// "degraded" beside an explanation derived from a second, separately-written rule set.
export function assessTenantHealth(
  row: { state?: string | null; heartbeat_at?: string | null } | null | undefined,
): TenantHealthAssessment {
  if (!row || !row.state || row.state === 'unknown') {
    return { health: 'unknown', reason: 'no_runtime_report', heartbeatAgeMs: null };
  }
  if (row.state === 'failed') return { health: 'unreachable', reason: 'process_failed', heartbeatAgeMs: null };
  if (row.state === 'stopped') return { health: 'degraded', reason: 'process_stopped', heartbeatAgeMs: null };
  if (row.state === 'stopping') return { health: 'degraded', reason: 'process_stopping', heartbeatAgeMs: null };
  if (row.state === 'starting') return { health: 'degraded', reason: 'process_starting', heartbeatAgeMs: null };
  if (row.state === 'running') {
    if (!row.heartbeat_at) return { health: 'degraded', reason: 'no_heartbeat', heartbeatAgeMs: null };
    const ageMs = Date.now() - new Date(row.heartbeat_at).getTime();
    // An unparseable timestamp is treated as "no usable heartbeat", never as a fresh one.
    if (!Number.isFinite(ageMs)) return { health: 'degraded', reason: 'no_heartbeat', heartbeatAgeMs: null };
    return ageMs <= HEALTHY_HEARTBEAT_WINDOW_MS
      ? { health: 'healthy', reason: 'ok', heartbeatAgeMs: ageMs }
      : { health: 'degraded', reason: 'stale_heartbeat', heartbeatAgeMs: ageMs };
  }
  return { health: 'unknown', reason: 'no_runtime_report', heartbeatAgeMs: null };
}

export function healthFromRuntime(
  row: { state?: string | null; heartbeat_at?: string | null } | null | undefined,
): TenantHealth {
  return assessTenantHealth(row).health;
}

// Validates and size-caps a request-supplied `args` object before it is ever written to
// control.tenant_commands. Args are operator-facing metadata for the host agent (e.g. a stop
// reason) -- never a place for secret values, and never trusted to be well-formed.
export function cappedJsonArgs(value: unknown, maxBytes = 4096): Record<string, unknown> {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('args must be a JSON object');
  }
  const serialized = JSON.stringify(value);
  if (Buffer.byteLength(serialized, 'utf8') > maxBytes) {
    throw new Error(`args must be under ${maxBytes} bytes`);
  }
  return value as Record<string, unknown>;
}

export function isTenantCommand(value: unknown): value is TenantCommand {
  return typeof value === 'string' && (TENANT_COMMANDS as readonly string[]).includes(value);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// CUSTOMER-OWNED TENANT RESOLUTION — shared by every route where the caller is the CUSTOMER
// themselves, not an admin: src/app/api/account/dashboard-link (the original of this check),
// src/app/api/account/instance, .../instance/command, .../instance/loadout and the
// src/app/api/account/funding routes.
//
// "Ambiguous match refused, not guessed" is the load-bearing property here, restated from
// dashboard-link/route.ts: a customer whose email happens to match more than one control.tenants
// row must never have one of them picked for them by an ORDER BY they cannot see.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface OwnedTenant {
  id: string;
  slug: string;
  status: TenantStatus;
  // Set only when resolved with opts.userId, the one case the column is read.
  hostingSubscriptionId?: string | null;
}

export class TenantOwnershipError extends Error {
  constructor(
    // NOT_OWNER is produced only when opts.userId is passed.
    public readonly code: 'NO_TENANT' | 'AMBIGUOUS_TENANT' | 'NOT_OWNER',
    message: string,
  ) {
    super(message);
    this.name = 'TenantOwnershipError';
  }
}

// Billing states in which a subscription is still the customer's current one.
const OPEN_SUBSCRIPTION_STATUSES = ['trialing', 'active', 'past_due', 'paused', 'unpaid'];

type TenantCandidate = OwnedTenant & { hosting_subscription_id?: string | null };

export async function resolveOwnedTenant(
  cp: ReturnType<typeof controlClient>,
  email: string,
  opts: { includeArchived?: boolean; userId?: string; subscriptionId?: string } = {},
): Promise<OwnedTenant> {
  // .eq(), not .ilike(): owner_email is a citext column, so .eq() already does a
  // case-insensitive EXACT match for free. ILIKE treats the pattern operand's '%' and '_'
  // as wildcards — since `email` here is the CALLER'S OWN verified email, any address
  // containing one of those characters (e.g. first_last@gmail.com) would be matched as a
  // wildcard pattern against every other tenant's owner_email instead of compared for
  // equality, letting a customer's own email resolve to a stranger's tenant row and from
  // there mint a dashboard ticket, halt/unhalt trading, or approve funding on it.
  let query = cp.from('tenants')
    .select(opts.userId ? 'id, slug, status, hosting_subscription_id' : 'id, slug, status')
    .eq('owner_email', email);
  if (!opts.includeArchived) query = query.neq('status', 'archived');
  const { data, error } = await query;
  if (error) throw error;
  let candidates = (data || []) as unknown as TenantCandidate[];

  if (opts.userId && candidates.length > 0) {
    // The email match only proposes candidates; the purchase link decides. owner_email is
    // operator-editable, while control.tenants.hosting_subscription_id -> hosting_subscriptions.user_id
    // is the immutable link the host agent trusts for wallet proofs (see
    // C:/GWDS/hosting/services/host-agent/src/wallet-proof.ts). A tenant this user bought outranks
    // an operator-created one (no subscription), which outranks one somebody else bought.
    const { data: subs, error: subsError } = await createServerClient()
      .from('hosting_subscriptions').select('id, status').eq('user_id', opts.userId);
    if (subsError) throw subsError;
    const mine = new Map(((subs || []) as Array<{ id: string; status: string }>).map(s => [s.id, s.status]));
    const rank = (t: TenantCandidate) => (!t.hosting_subscription_id ? 1 : mine.has(t.hosting_subscription_id) ? 2 : 0);
    const best = Math.max(...candidates.map(rank));
    if (best === 0) {
      throw new TenantOwnershipError(
        'NOT_OWNER',
        'The workspace linked to this email belongs to a different account. Contact support.',
      );
    }
    candidates = candidates.filter(t => rank(t) === best);
    // Several tenants this user bought (e.g. an old suspended one plus a new one): the
    // subscription the caller is looking at decides, else the one whose billing is still open.
    if (candidates.length > 1 && opts.subscriptionId) {
      const exact = candidates.filter(t => t.hosting_subscription_id === opts.subscriptionId);
      if (exact.length === 1) candidates = exact;
    }
    if (candidates.length > 1 && best === 2) {
      const open = candidates.filter(t => OPEN_SUBSCRIPTION_STATUSES.includes(mine.get(t.hosting_subscription_id!) ?? ''));
      if (open.length === 1) candidates = open;
    }
  }

  if (candidates.length === 0) {
    throw new TenantOwnershipError('NO_TENANT', 'No workspace is provisioned for this account yet.');
  }
  if (candidates.length > 1) {
    throw new TenantOwnershipError(
      'AMBIGUOUS_TENANT',
      'Multiple workspaces are linked to this account. Contact support.',
    );
  }
  const [tenant] = candidates;
  if (!opts.userId) return tenant;
  return { id: tenant.id, slug: tenant.slug, status: tenant.status, hostingSubscriptionId: tenant.hosting_subscription_id ?? null };
}

// The funding routes' shared mapping of an ownership failure to an HTTP error.
export function tenantOwnershipCommerceError(err: TenantOwnershipError): CommerceError {
  if (err.code === 'NOT_OWNER') return new CommerceError('TENANT_NOT_OWNED', err.message, 403);
  return new CommerceError(err.code === 'AMBIGUOUS_TENANT' ? 'TENANT_AMBIGUOUS' : 'TENANT_NOT_PROVISIONED', err.message, 409);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// TENANT NETWORK — which Hyperliquid network (and so which chain, token, bridge and signing chain
// id) a tenant trades on. That is decided where the tenant process's env is rendered
// (tenant-runner's renderTenantEnv): control.env_key_policy.default_value first, then the
// tenant's own control.tenant_env override. This reads the same two sources with the same
// precedence, and the same strict values the dashboard accepts ('mainnet' / 'testnet' exactly;
// it refuses to boot on anything else). It never guesses: a guessed network sends a customer's
// deposit to a bridge that will not credit it, or signs for a chain their account is not on.
// ─────────────────────────────────────────────────────────────────────────────────────────────

const NETWORK_ENV_KEY = 'HYPERLIQUID_NETWORK';

export async function resolveTenantNetwork(
  cp: ReturnType<typeof controlClient>,
  tenantId: string,
): Promise<FundingNetwork> {
  const lookupFailed = () => new CommerceError('NETWORK_LOOKUP_FAILED', 'Your trading network could not be loaded.', 503);
  const { data: override, error: overrideError } = await cp.from('tenant_env')
    .select('value').eq('tenant_id', tenantId).eq('key', NETWORK_ENV_KEY).maybeSingle();
  if (overrideError) throw lookupFailed();
  let value: unknown = override?.value;
  if (value === undefined || value === null) {
    const { data: policy, error: policyError } = await cp.from('env_key_policy')
      .select('default_value').eq('key', NETWORK_ENV_KEY).maybeSingle();
    if (policyError) throw lookupFailed();
    value = policy?.default_value;
  }
  if (!isFundingNetwork(value)) {
    throw new CommerceError(
      'NETWORK_UNKNOWN',
      'We could not confirm which Hyperliquid network your workspace trades on, so nothing can be signed or deposited yet. Contact support.',
      409,
    );
  }
  return value;
}
