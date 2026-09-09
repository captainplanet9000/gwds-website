import { NextRequest, NextResponse } from 'next/server';
import { CommerceError, errorResponseBody, requireVerifiedUser } from '@/lib/commerce';
import { assessTenantHealth, controlClient, resolveOwnedTenant, TenantOwnershipError } from '@/lib/control-plane';

// ─────────────────────────────────────────────────────────────────────────────────────────────
// THE CUSTOMER'S OWN VIEW of their own tenant: status, halt state, agent wallet, recent cycles.
// Scoped to exactly the caller's tenant via control.tenants.owner_email (see
// resolveOwnedTenant() in src/lib/control-plane.ts) -- the same ownership check
// src/app/api/account/dashboard-link/route.ts already performs, shared here so both routes apply
// the identical "refuse to guess on an ambiguous match" rule.
//
// Deliberately narrower than the admin's tenant-detail route
// (src/app/api/admin/hosting/tenants/[slug]/route.ts): no tenant_commands history, no
// tenant_secret_refs, no tenant_env keys. None of that is something a customer needs to see their
// own instance's status, and all of it is operator surface -- see control.tenant_commands' own
// RLS posture (0013): "a tenant has no reason to see the command queue that controls its own
// process". This route runs as service_role (never the customer's browser), so that RLS policy
// does not block it either way; the restriction here is what this route CHOOSES to select and
// return, on purpose.
// ─────────────────────────────────────────────────────────────────────────────────────────────

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const user = await requireVerifiedUser(req);
    const cp = controlClient();
    // includeArchived: a retired workspace should still render (as "archived"), not 404 --
    // 404/NO_TENANT is reserved for "nothing was ever provisioned for this account".
    const owned = await resolveOwnedTenant(cp, user.email!, { includeArchived: true });

    const [tenantResult, stateResult, runtimeResult, scheduleResult, cyclesResult] = await Promise.all([
      cp.from('tenants')
        .select('slug, display_name, status, plan, main_wallet_address, api_wallet_address, created_at')
        .eq('id', owned.id)
        .single(),
      cp.from('tenant_state')
        .select('halt_new_trades, halt_reason, halt_set_by, halt_set_at, running, cycle_count, last_cycle_at, standby, standby_reason')
        .eq('tenant_id', owned.id)
        .maybeSingle(),
      cp.from('tenant_runtime').select('state, heartbeat_at, last_error').eq('tenant_id', owned.id).maybeSingle(),
      cp.from('tenant_schedule')
        .select('enabled, next_run_at, consecutive_failures, backoff_until')
        .eq('tenant_id', owned.id)
        .maybeSingle(),
      // Recent outcomes only -- the customer-facing equivalent of the admin route's cycleRuns,
      // capped at 10 rather than 20 since this page is a glance, not an ops console.
      cp.from('cycle_runs')
        .select('id, outcome, started_at, finished_at, duration_ms, error')
        .eq('tenant_id', owned.id)
        .order('started_at', { ascending: false })
        .limit(10),
    ]);
    for (const result of [tenantResult, stateResult, runtimeResult, scheduleResult, cyclesResult]) {
      if (result.error) throw result.error;
    }

    const tenant = tenantResult.data!;
    const state = stateResult.data;
    const rt = runtimeResult.data;
    const schedule = scheduleResult.data;
    // One assessment, so the reason shipped to the customer is the one that produced the verdict
    // rather than a second guess made next to it.
    const assessment = assessTenantHealth(rt);

    return NextResponse.json(
      {
        tenant: {
          slug: tenant.slug,
          displayName: tenant.display_name,
          status: tenant.status,
          plan: tenant.plan,
          // Wallet ADDRESSES only -- public on-chain identifiers, never a key. See
          // control.tenant_secret_refs / db/migrations/0001_control_plane.sql for why no column
          // anywhere in this schema can hold the private key itself.
          mainWalletAddress: tenant.main_wallet_address,
          apiWalletAddress: tenant.api_wallet_address,
          createdAt: tenant.created_at,
        },
        health: assessment.health,
        healthReason: assessment.reason,
        heartbeatAgeMs: assessment.heartbeatAgeMs,
        heartbeatAt: rt?.heartbeat_at ?? null,
        processState: rt?.state ?? 'unknown',
        lastError: rt?.last_error ?? null,
        // No row is impossible (0001's insert trigger guarantees one) but a missing row still
        // reads as halted -- the same fail-closed default the admin fleet list uses.
        halt: state
          ? { active: state.halt_new_trades, reason: state.halt_reason, setBy: state.halt_set_by, setAt: state.halt_set_at }
          : { active: true, reason: null, setBy: null, setAt: null },
        schedule: schedule
          ? {
              enabled: schedule.enabled,
              nextRunAt: schedule.next_run_at,
              consecutiveFailures: schedule.consecutive_failures,
              backoffUntil: schedule.backoff_until,
            }
          : null,
        running: state?.running ?? false,
        cycleCount: state?.cycle_count ?? 0,
        lastCycleAt: state?.last_cycle_at ?? null,
        standby: state?.standby ?? false,
        standbyReason: state?.standby_reason ?? null,
        recentCycles: cyclesResult.data || [],
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
      console.error('Customer instance status failed', { error: error instanceof Error ? error.message : 'unknown' });
    }
    const status = error instanceof CommerceError ? error.status : 500;
    return NextResponse.json(errorResponseBody(error), { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
