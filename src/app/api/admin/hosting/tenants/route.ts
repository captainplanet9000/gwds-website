import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { controlClient, healthFromRuntime } from '@/lib/control-plane';

// NOTE ON PLACEMENT: /api/admin/hosting/route.ts already exists and serves the storefront's
// self-serve HOSTING PRODUCT (hosting_plans / hosting_subscriptions / hosting_instances -- a
// customer-facing SaaS billing surface). This file, and everything under tenants/, is a
// DIFFERENT, unrelated concern: the operator's control plane for the owner's own tenant
// processes (C:/GWDS/hosting). Nesting under /hosting/tenants keeps both surfaces reachable
// without one route's GET handler silently replacing the other's response shape.
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const cp = controlClient();
    const { data: tenants, error: tenantsError } = await cp
      .from('tenants')
      // Wallet ADDRESSES are selected here for the same reason the detail route selects them:
      // they are public on-chain identifiers, not key material, and "whose money is this" is a
      // question the fleet table has to answer without a round trip per tenant. No private key
      // exists anywhere in this schema; see tenant_secret_refs in the detail route.
      .select('id, slug, display_name, status, port, host, plan, owner_email, main_wallet_address, api_wallet_address, created_at, updated_at')
      .order('slug', { ascending: true });
    if (tenantsError) throw tenantsError;

    const ids = (tenants || []).map((t) => t.id);
    if (ids.length === 0) {
      return NextResponse.json({ tenants: [] }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const [stateResult, runtimeResult, cycleResult] = await Promise.all([
      cp.from('tenant_state')
        .select('tenant_id, halt_new_trades, halt_reason, halt_set_by, halt_set_at, running, cycle_count, last_cycle_at, standby, standby_reason, state_version')
        .in('tenant_id', ids),
      cp.from('tenant_runtime')
        // restart_attempts / needs_attention are the fleet reconciler's crash-loop breaker
        // (0018_fleet_reconciler.sql). An operator deciding whether to press 'start' has to see
        // that the reconciler already gave up on this tenant, otherwise the console invites a
        // hand-cranked version of the hot restart loop the breaker exists to stop.
        .select('tenant_id, state, pid, heartbeat_at, last_error, restart_attempts, needs_attention, needs_attention_reason, needs_attention_at')
        .in('tenant_id', ids),
      // Fleet-wide recent cycles, newest first. Reduced client-side to "first row seen per
      // tenant_id" below -- since the query is globally ordered by started_at desc, the first
      // occurrence of a tenant_id IS that tenant's most recent cycle, regardless of interleaving.
      // A capped limit keeps this a single bounded scan rather than one query per tenant.
      cp.from('cycle_runs')
        .select('tenant_id, outcome, started_at, finished_at')
        .in('tenant_id', ids)
        .order('started_at', { ascending: false })
        .limit(1000),
    ]);
    if (stateResult.error) throw stateResult.error;
    if (runtimeResult.error) throw runtimeResult.error;
    if (cycleResult.error) throw cycleResult.error;

    const stateByTenant = new Map((stateResult.data || []).map((row) => [row.tenant_id, row]));
    const runtimeByTenant = new Map((runtimeResult.data || []).map((row) => [row.tenant_id, row]));
    const lastCycleByTenant = new Map<string, { outcome: string; started_at: string; finished_at: string | null }>();
    for (const run of cycleResult.data || []) {
      if (!lastCycleByTenant.has(run.tenant_id)) lastCycleByTenant.set(run.tenant_id, run);
    }

    const now = Date.now();
    const rows = (tenants || []).map((tenant) => {
      const state = stateByTenant.get(tenant.id) || null;
      const rt = runtimeByTenant.get(tenant.id) || null;
      const lastCycle = lastCycleByTenant.get(tenant.id) || null;
      const startedAtMs = lastCycle ? new Date(lastCycle.started_at).getTime() : NaN;
      return {
        id: tenant.id,
        slug: tenant.slug,
        displayName: tenant.display_name,
        status: tenant.status,
        port: tenant.port,
        host: tenant.host,
        plan: tenant.plan,
        ownerEmail: tenant.owner_email,
        mainWalletAddress: tenant.main_wallet_address,
        apiWalletAddress: tenant.api_wallet_address,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at,
        halt: {
          // No row is impossible (0001's insert trigger guarantees one) but read a missing row as
          // halted anyway -- the same fail-closed reading every function in this schema uses.
          active: state ? state.halt_new_trades : true,
          reason: state?.halt_reason ?? null,
          setBy: state?.halt_set_by ?? null,
          setAt: state?.halt_set_at ?? null,
        },
        schedulerRunning: state?.running ?? false,
        cycleCount: state?.cycle_count ?? 0,
        standby: state?.standby ?? false,
        standbyReason: state?.standby_reason ?? null,
        // state_version is the optimistic-concurrency counter control.set_halt() bumps on every
        // halt change. An operator watching it move is how a queued halt/unhalt is confirmed to
        // have actually landed, rather than inferred from the command row alone.
        stateVersion: state?.state_version ?? null,
        health: healthFromRuntime(rt),
        processState: rt?.state ?? 'unknown',
        pid: rt?.pid ?? null,
        // null, not 0/false: a tenant that has never been spawned has no tenant_runtime row at
        // all, and reporting a confident "0 restarts, not flagged" for an unobserved tenant is
        // the same class of lie as a stale timestamp. The UI renders null as 'unknown'.
        restartAttempts: rt ? rt.restart_attempts : null,
        needsAttention: rt ? rt.needs_attention : null,
        needsAttentionReason: rt?.needs_attention_reason ?? null,
        needsAttentionAt: rt?.needs_attention_at ?? null,
        lastError: rt?.last_error ?? null,
        lastCycle: lastCycle
          ? {
              outcome: lastCycle.outcome,
              startedAt: lastCycle.started_at,
              finishedAt: lastCycle.finished_at,
              ageSeconds: Number.isFinite(startedAtMs) ? Math.max(0, Math.round((now - startedAtMs) / 1000)) : null,
            }
          : null,
      };
    });

    return NextResponse.json({ tenants: rows }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Control-plane tenant list failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Tenant fleet data could not be loaded.' }, { status: 503 });
  }
}
