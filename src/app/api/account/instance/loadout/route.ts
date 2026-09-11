import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { controlClient, resolveOwnedTenant, TenantOwnershipError } from '@/lib/control-plane';
import { planExecutionMode, type HostingExecutionMode } from '@/lib/hosting';
import {
  LOADOUT_STRATEGIES,
  MAX_AGENTS_PER_TENANT,
  UNRESOLVED_PLAN_AGENT_LIMIT,
  getStrategySpec,
  normalizeSubmittedLoadout,
  readStoredEntry,
  resolveAgentLimit,
  toStoredConfig,
  totalInstances,
  type LoadoutEntry,
} from '@/lib/loadout';
import { createServerClient } from '@/lib/supabase';
import { getProduct } from '@/lib/products';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// LOADOUT MANAGEMENT: which strategy agents run on the customer's own tenant, HOW MANY of each,
// and with what per-instance configuration. See db/migrations/0015_tenant_loadout.sql and
// 0021 (C:/GWDS/hosting) for the control.tenant_loadout table this route owns -- in short: this
// route is the ONLY thing that ever writes there, and it re-derives both gates from the database
// on EVERY write, never trusting a client-supplied "I own this" or "my limit is N".
//
// THE TWO GATES, RESTATED BECAUSE CONFLATING THEM IS THE BUG THIS DESIGN AVOIDS:
//   * CAPACITY comes from the tenant's plan (hosting_plans.agent_limit) and caps SUM(instances)
//     -- not COUNT(*) of distinct strategies. Running two Darvas agents is two agents.
//   * ENTITLEMENT comes from public.entitlements plus the plan's own included_product_id, both
//     expanded through public.product_includes (migration 0019). A Fund subscriber has twelve
//     slots; that does not entitle them to a strategy they never bought.
// Passing one is never sufficient. The UI shows both, but the UI is a courtesy: this route is
// the enforcement, and the host-side reconciler checks again before it installs anything.
//
// AGENT IDENTITY: agent_id === the storefront's own product id (public.products.id / getProduct()),
// because that is the only identifier already tied to an entitlement.
//
// WHY SAVE-THE-WHOLE-SET RATHER THAN PER-AGENT TOGGLES: the cap applies to a sum, and a downgrade
// leaves a tenant over that sum. A customer in that state has to drop something, and "drop this
// one, add that one, and end up within the cap" is a single decision -- expressing it as a
// sequence of toggles would mean either rejecting a legal end state because an intermediate step
// broke the cap, or letting an intermediate step exceed it.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';

/** The reconciler's own audit kinds, from services/host-agent/src/loadout.ts in C:/GWDS/hosting. */
const RECONCILE_CHANGE_KINDS = ['fleet.reconcile.loadout_installed', 'fleet.reconcile.loadout_removed'];
const RECONCILE_PROBLEM_KINDS = ['fleet.reconcile.loadout_unsatisfied', 'fleet.reconcile.loadout_satisfied'];

/**
 * True when a PostgREST failure is "that column does not exist" -- i.e. control-plane migration
 * 0021 (instances/config on control.tenant_loadout) has not been applied to this project yet.
 *
 * Distinguished from every other database failure on purpose. Everything else is an outage and
 * should surface as one; this specific one is a known, temporary, entirely explainable state that
 * a customer should be told about in words rather than shown a 500 for.
 */
function isMissingCapacityColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42703' || error.code === 'PGRST204') return true;
  const message = error.message || '';
  return /column .*(instances|config).* does not exist/i.test(message);
}

interface ResolvedPlan {
  id: string | null;
  name: string | null;
  agentLimit: number;
  executionMode: HostingExecutionMode;
  includedProductId: string | null;
  /** Where the plan came from, so the customer can be told when it could not be determined. */
  source: 'subscription' | 'tenant' | 'unresolved';
}

/**
 * The tenant's plan and therefore its agent capacity, resolved SERVER-SIDE from the database.
 *
 * Preference order is deliberate. The paid subscription is what the customer is actually being
 * billed for, so it outranks control.tenants.plan, which is a free-text label the fleet also uses
 * for internal tenants that were never sold ('standard').
 *
 * FAILS CLOSED. A tenant whose plan cannot be resolved gets the smallest capacity any plan sells,
 * never the largest and never an unbounded one -- an unrecognised label is not a licence to run
 * twelve live strategies against a real exchange account.
 */
async function resolveTenantPlan(
  sb: ReturnType<typeof createServerClient>,
  tenant: { id: string; plan?: string | null; hosting_subscription_id?: string | null },
): Promise<ResolvedPlan> {
  const unresolved: ResolvedPlan = {
    id: null,
    name: null,
    agentLimit: UNRESOLVED_PLAN_AGENT_LIMIT,
    // An unresolved plan is not treated as live: nothing should read this as permission to
    // execute real orders.
    executionMode: 'simulated',
    includedProductId: null,
    source: 'unresolved',
  };

  let planId: string | null = null;
  let source: ResolvedPlan['source'] = 'unresolved';

  if (tenant.hosting_subscription_id) {
    const { data, error } = await sb
      .from('hosting_subscriptions')
      .select('plan_id')
      .eq('id', tenant.hosting_subscription_id)
      .maybeSingle();
    if (error) throw error;
    if (data?.plan_id) {
      planId = data.plan_id as string;
      source = 'subscription';
    }
  }
  if (!planId && tenant.plan) {
    planId = tenant.plan;
    source = 'tenant';
  }
  if (!planId) return unresolved;

  const { data: plan, error: planError } = await sb
    .from('hosting_plans')
    .select('id, name, price_cents, agent_limit, included_product_id')
    .eq('id', planId)
    .maybeSingle();
  if (planError) throw planError;
  // A plan label with no matching row (an internal tenant marked 'standard', a retired plan id)
  // is exactly the unresolved case, not a reason to guess.
  if (!plan) return unresolved;

  return {
    id: plan.id as string,
    name: plan.name as string,
    agentLimit: resolveAgentLimit(plan.agent_limit as number | null),
    executionMode: planExecutionMode(plan.price_cents as number),
    includedProductId: (plan.included_product_id as string | null) ?? null,
    source,
  };
}

/** The cheapest active plan that would raise this tenant's cap, for "which plan lifts this". */
async function nextPlanAbove(sb: ReturnType<typeof createServerClient>, agentLimit: number) {
  const { data, error } = await sb
    .from('hosting_plans')
    .select('id, name, price_cents, agent_limit')
    .eq('is_active', true)
    .gt('agent_limit', agentLimit)
    .order('agent_limit', { ascending: true })
    .limit(1);
  if (error) throw error;
  const plan = data?.[0];
  if (!plan) return null;
  return {
    id: plan.id as string,
    name: plan.name as string,
    priceCents: plan.price_cents as number,
    agentLimit: resolveAgentLimit(plan.agent_limit as number | null),
  };
}

/**
 * Every strategy the user may select, from purchases AND from what their plan includes.
 *
 * Bundle expansion goes through public.product_includes (migration 0019) rather than the
 * storefront's own EDITION_INCLUDES table, so the host and the storefront answer "what does this
 * bundle contain" from the same row set instead of two copies that can drift apart.
 *
 * The plan's own included_product_id counts while the plan is resolved, because that is what the
 * monthly price buys -- a Desk subscriber has the Everything bundle for as long as they are on
 * Desk. It is not written into public.entitlements, and deliberately not: an entitlement is a
 * permanent grant from a purchase, and a subscription inclusion ends with the subscription.
 *
 * One level of expansion only. Bundles contain agents; they do not contain other bundles.
 */
async function entitledStrategyIds(
  sb: ReturnType<typeof createServerClient>,
  userId: string,
  planIncludedProductId: string | null,
): Promise<Set<string>> {
  const { data, error } = await sb
    .from('entitlements')
    .select('product_id')
    .eq('user_id', userId)
    .eq('status', 'active');
  if (error) throw error;

  const roots = new Set<string>();
  for (const row of data || []) roots.add(row.product_id as string);
  if (planIncludedProductId) roots.add(planIncludedProductId);
  if (roots.size === 0) return new Set();

  const { data: includes, error: includesError } = await sb
    .from('product_includes')
    .select('included_product_id')
    .in('bundle_product_id', [...roots]);
  if (includesError) throw includesError;

  const owned = new Set(roots);
  for (const row of includes || []) owned.add(row.included_product_id as string);
  return new Set([...owned].filter((id) => getStrategySpec(id)));
}

type RuntimeState =
  | 'not_installed'
  | 'awaiting_sync'
  | 'restart_pending'
  | 'workspace_stopped'
  | 'running'
  | 'blocked';

interface RuntimeReport {
  state: RuntimeState;
  /** Machine reason from the reconciler when state is 'blocked'; null otherwise. */
  reason: string | null;
  /** When the host last confirmed a change for this agent. */
  confirmedAt: string | null;
}

/**
 * AUTHORIZED IS NOT RUNNING.
 *
 * control.tenant_loadout is the customer's authorisation -- what they have asked to run. Whether
 * it is actually running is a separate fact, observed by the host-side reconciler and written to
 * control.tenant_events. This function reads that observation and NEVER infers it from the
 * authorisation, because a green tick for an agent the host has not confirmed is a lie the
 * customer cannot detect: their sync may not have completed, their package may be missing, and
 * they would have no way to tell that from a screen that only ever reflects their own request.
 *
 * Derived from the reconciler's audit trail rather than a status column because there is no such
 * column -- the reconciler records changes and problems, so the current state is the latest change
 * per agent, minus anything the latest problem set still names.
 */
function assessRuntime(
  agentId: string,
  changeEvents: { kind: string; at: string; detail: Record<string, unknown> }[],
  problems: Map<string, string>,
  processState: string | null,
  startedAt: string | null,
): RuntimeReport {
  const blocked = problems.get(agentId);
  if (blocked) return { state: 'blocked', reason: blocked, confirmedAt: null };

  // changeEvents arrive newest-first, so the first match is the current one.
  const latest = changeEvents.find((event) => event.detail?.agentId === agentId);
  if (!latest || latest.kind === 'fleet.reconcile.loadout_removed') {
    return { state: 'awaiting_sync', reason: null, confirmedAt: null };
  }

  // The reconciler writes files; the tenant process loads plugins at startup. An install recorded
  // while the process was already running is on disk but not yet in memory.
  const restartRequired = latest.detail?.restartRequired === true;
  const restartedSince = Boolean(startedAt) && new Date(startedAt!).getTime() > new Date(latest.at).getTime();
  if (restartRequired && !restartedSince) {
    return { state: 'restart_pending', reason: null, confirmedAt: latest.at };
  }
  // Installed on disk, but the workspace itself is not up, so nothing in it is trading.
  if (processState !== 'running') {
    return { state: 'workspace_stopped', reason: null, confirmedAt: latest.at };
  }
  return { state: 'running', reason: null, confirmedAt: latest.at };
}

async function readRuntimeReports(
  cp: ReturnType<typeof controlClient>,
  tenantId: string,
): Promise<(agentId: string) => RuntimeReport> {
  const [eventsResult, runtimeResult] = await Promise.all([
    cp
      .from('tenant_events')
      .select('kind, at, detail')
      .eq('tenant_id', tenantId)
      .in('kind', [...RECONCILE_CHANGE_KINDS, ...RECONCILE_PROBLEM_KINDS])
      .order('at', { ascending: false })
      .order('id', { ascending: false })
      .limit(200),
    cp.from('tenant_runtime').select('state, started_at').eq('tenant_id', tenantId).maybeSingle(),
  ]);
  if (eventsResult.error) throw eventsResult.error;
  if (runtimeResult.error) throw runtimeResult.error;

  const rows = (eventsResult.data || []) as { kind: string; at: string; detail: Record<string, unknown> }[];
  const changeEvents = rows.filter((row) => RECONCILE_CHANGE_KINDS.includes(row.kind));

  // Only the most recent problem report counts: 'loadout_satisfied' is how the reconciler says a
  // previously reported problem set is now empty, so an older 'unsatisfied' must not keep an agent
  // marked blocked after it has recovered.
  const problems = new Map<string, string>();
  const latestProblemReport = rows.find((row) => RECONCILE_PROBLEM_KINDS.includes(row.kind));
  if (latestProblemReport?.kind === 'fleet.reconcile.loadout_unsatisfied') {
    const listed = latestProblemReport.detail?.problems;
    if (Array.isArray(listed)) {
      for (const entry of listed) {
        const agentId = (entry as { agentId?: unknown })?.agentId;
        const reason = (entry as { reason?: unknown })?.reason;
        if (typeof agentId === 'string') problems.set(agentId, typeof reason === 'string' ? reason : 'unknown');
      }
    }
  }

  const processState = (runtimeResult.data?.state as string | null) ?? null;
  const startedAt = (runtimeResult.data?.started_at as string | null) ?? null;
  return (agentId: string) => assessRuntime(agentId, changeEvents, problems, processState, startedAt);
}

interface TenantPlanRow {
  plan: string | null;
  hosting_subscription_id: string | null;
}

async function readTenantPlanRow(
  cp: ReturnType<typeof controlClient>,
  tenantId: string,
): Promise<TenantPlanRow> {
  const { data, error } = await cp
    .from('tenants')
    .select('plan, hosting_subscription_id')
    .eq('id', tenantId)
    .maybeSingle();
  if (error) throw error;
  return {
    plan: (data?.plan as string | null) ?? null,
    hosting_subscription_id: (data?.hosting_subscription_id as string | null) ?? null,
  };
}

/**
 * Current loadout rows. Falls back to the pre-0021 column set so an unmigrated control plane
 * degrades into a readable page with an explanation instead of a 500.
 */
async function readLoadout(
  cp: ReturnType<typeof controlClient>,
  tenantId: string,
): Promise<{ entries: LoadoutEntry[]; installedAt: Map<string, string>; capacityReady: boolean }> {
  const full = await cp
    .from('tenant_loadout')
    .select('agent_id, installed_at, instances, config')
    .eq('tenant_id', tenantId);

  const rows = full.error ? null : (full.data as Record<string, unknown>[]);
  if (full.error && !isMissingCapacityColumn(full.error)) throw full.error;

  if (rows) {
    return {
      entries: rows.map((row) =>
        readStoredEntry({
          agent_id: row.agent_id as string,
          instances: row.instances as number | null,
          config: row.config,
        }),
      ),
      installedAt: new Map(rows.map((row) => [row.agent_id as string, row.installed_at as string])),
      capacityReady: true,
    };
  }

  const legacy = await cp.from('tenant_loadout').select('agent_id, installed_at').eq('tenant_id', tenantId);
  if (legacy.error) throw legacy.error;
  const legacyRows = (legacy.data || []) as Record<string, unknown>[];
  return {
    entries: legacyRows.map((row) => readStoredEntry({ agent_id: row.agent_id as string })),
    installedAt: new Map(legacyRows.map((row) => [row.agent_id as string, row.installed_at as string])),
    capacityReady: false,
  };
}

const CAPACITY_NOT_READY =
  'Agent capacity controls are not enabled on this workspace yet. The control-plane migration ' +
  'that stores instance counts has not been applied, so your loadout is shown read-only.';

const SYNC_NOTE =
  'Saving records what you have authorized to run and is fully audited. The host installs it into ' +
  'your workspace separately -- an agent only shows as running once the host has confirmed it.';

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const cp = controlClient();
    const tenant = await resolveOwnedTenant(cp, user.email!, { includeArchived: true });
    const sb = createServerClient();

    const [planRow, loadout, runtimeFor] = await Promise.all([
      readTenantPlanRow(cp, tenant.id),
      readLoadout(cp, tenant.id),
      readRuntimeReports(cp, tenant.id),
    ]);

    const plan = await resolveTenantPlan(sb, { id: tenant.id, ...planRow });
    const [entitled, nextPlan] = await Promise.all([
      entitledStrategyIds(sb, user.id, plan.includedProductId),
      nextPlanAbove(sb, plan.agentLimit),
    ]);

    const byAgent = new Map(loadout.entries.map((entry) => [entry.agentId, entry]));
    const strategies = LOADOUT_STRATEGIES.map((spec) => {
      const product = getProduct(spec.agentId);
      const entry = byAgent.get(spec.agentId);
      return {
        agentId: spec.agentId,
        name: product?.name || spec.agentId,
        emoji: product?.emoji || '',
        description: product?.description || '',
        tradesMarket: spec.tradesMarket,
        maxInstances: spec.maxInstances,
        entitled: entitled.has(spec.agentId),
        instances: entry?.instances ?? 0,
        config: entry?.config ?? [],
        authorizedAt: loadout.installedAt.get(spec.agentId) ?? null,
        runtime: entry ? runtimeFor(spec.agentId) : { state: 'not_installed', reason: null, confirmedAt: null },
      };
    });

    // Rows for something that is no longer an installable strategy at all (a retired product).
    // Surfaced rather than dropped, so a customer sees why an agent stopped appearing.
    const orphaned = loadout.entries
      .filter((entry) => !getStrategySpec(entry.agentId))
      .map((entry) => ({
        agentId: entry.agentId,
        name: getProduct(entry.agentId)?.name || entry.agentId,
        installedAt: loadout.installedAt.get(entry.agentId) ?? null,
      }));

    const used = totalInstances(loadout.entries);
    return NextResponse.json(
      {
        tenantStatus: tenant.status,
        capacityReady: loadout.capacityReady,
        plan: {
          id: plan.id,
          name: plan.name,
          agentLimit: plan.agentLimit,
          executionMode: plan.executionMode,
          source: plan.source,
        },
        capacity: {
          used,
          limit: plan.agentLimit,
          platformMax: MAX_AGENTS_PER_TENANT,
          // A downgrade can leave a tenant here. Reported, never silently corrected: dropping an
          // agent is the customer's choice to make, not this route's.
          overCap: used > plan.agentLimit,
        },
        nextPlan,
        strategies,
        orphaned,
        note: loadout.capacityReady ? SYNC_NOTE : CAPACITY_NOT_READY,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof TenantOwnershipError) {
      const status = error.code === 'AMBIGUOUS_TENANT' ? 409 : 404;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (!(error instanceof CommerceError)) {
      console.error('Customer loadout read failed', { error: error instanceof Error ? error.message : 'unknown' });
    }
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);

    if (Number(req.headers.get('content-length') || '0') > 8_192) {
      throw new CommerceError('REQUEST_TOO_LARGE', 'Request too large.', 413);
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new CommerceError('INVALID_JSON', 'Invalid JSON body.', 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new CommerceError('INVALID_BODY', 'Request body must be an object.', 400);
    }

    // Shape, per-strategy ceilings and duplicate-instance rules. Anything the request claims
    // about ITS OWN limits is ignored -- the limit is read from the plan below.
    const submitted = normalizeSubmittedLoadout((body as Record<string, unknown>).loadout);

    const cp = controlClient();
    const tenant = await resolveOwnedTenant(cp, user.email!);
    if (tenant.status === 'archived') {
      throw new CommerceError('TENANT_ARCHIVED', 'This workspace has been retired.', 409);
    }

    const sb = createServerClient();
    const planRow = await readTenantPlanRow(cp, tenant.id);
    const plan = await resolveTenantPlan(sb, { id: tenant.id, ...planRow });

    // CAPACITY GATE. Computed here, from the plan, on every write. SUM(instances), not the number
    // of distinct strategies: two Darvas agents are two agents' worth of exchange request weight
    // and two agents' worth of margin.
    const requested = totalInstances(submitted);
    if (requested > plan.agentLimit) {
      throw new CommerceError(
        'AGENT_LIMIT_EXCEEDED',
        plan.source === 'unresolved'
          ? `This workspace is not linked to a hosting plan, so it is limited to ${plan.agentLimit} agent. Contact support to link it.`
          : `Your ${plan.name} plan runs up to ${plan.agentLimit} agents. You selected ${requested}.`,
        409,
      );
    }

    // ENTITLEMENT GATE. Re-derived from the database on every write, never inferred from what the
    // loadout already contains: a revoked purchase must stop being selectable immediately, and a
    // row already sitting in the table is not evidence of anything.
    const entitled = await entitledStrategyIds(sb, user.id, plan.includedProductId);
    for (const entry of submitted) {
      if (!entitled.has(entry.agentId)) {
        const name = getProduct(entry.agentId)?.name || entry.agentId;
        throw new CommerceError('NOT_ENTITLED', `You do not have access to ${name}.`, 403);
      }
    }

    const before = await readLoadout(cp, tenant.id);
    if (!before.capacityReady) {
      throw new CommerceError('CAPACITY_NOT_READY', CAPACITY_NOT_READY, 503);
    }
    const beforeByAgent = new Map(before.entries.map((entry) => [entry.agentId, entry]));
    const keptIds = submitted.map((entry) => entry.agentId);

    // REMOVALS FIRST, THEN WRITES. Each half is a single statement, so each is atomic on its own;
    // running them in this order means a failure between them leaves the tenant with FEWER agents
    // than requested, never more. The cap can only be under-shot by a partial save.
    const removals = before.entries.filter((entry) => !keptIds.includes(entry.agentId));
    if (removals.length) {
      const { error: deleteError } = await cp
        .from('tenant_loadout')
        .delete()
        .eq('tenant_id', tenant.id)
        .in('agent_id', removals.map((entry) => entry.agentId));
      if (deleteError) throw deleteError;
    }

    if (submitted.length) {
      const { error: upsertError } = await cp.from('tenant_loadout').upsert(
        submitted.map((entry) => ({
          tenant_id: tenant.id,
          agent_id: entry.agentId,
          instances: entry.instances,
          config: toStoredConfig(entry),
          installed_by: user.email,
        })),
        { onConflict: 'tenant_id,agent_id' },
      );
      if (upsertError) {
        if (isMissingCapacityColumn(upsertError)) {
          throw new CommerceError('CAPACITY_NOT_READY', CAPACITY_NOT_READY, 503);
        }
        throw upsertError;
      }
    }

    const events: Record<string, unknown>[] = [];
    for (const entry of removals) {
      events.push({
        tenant_id: tenant.id,
        kind: 'loadout.removed',
        actor_kind: 'tenant',
        actor: user.email,
        detail: { agentId: entry.agentId, instances: entry.instances },
      });
    }
    for (const entry of submitted) {
      const previous = beforeByAgent.get(entry.agentId);
      const changed =
        !previous ||
        previous.instances !== entry.instances ||
        JSON.stringify(previous.config) !== JSON.stringify(entry.config);
      if (!changed) continue;
      events.push({
        tenant_id: tenant.id,
        kind: previous ? 'loadout.updated' : 'loadout.installed',
        actor_kind: 'tenant',
        actor: user.email,
        detail: {
          agentId: entry.agentId,
          instances: entry.instances,
          config: entry.config,
          previousInstances: previous?.instances ?? 0,
        },
      });
    }
    if (events.length) {
      // Audit failure must not be swallowed: an unaudited change to what trades a customer's money
      // is the thing this table exists to make impossible.
      const { error: eventError } = await cp.from('tenant_events').insert(events);
      if (eventError) throw eventError;
    }

    return NextResponse.json(
      { ok: true, used: requested, limit: plan.agentLimit, changed: events.length },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof TenantOwnershipError) {
      const status = error.code === 'AMBIGUOUS_TENANT' ? 409 : 404;
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    if (!(error instanceof CommerceError)) {
      console.error('Customer loadout write failed', { error: error instanceof Error ? error.message : 'unknown' });
    }
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
