import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { controlClient, isValidTenantSlug } from '@/lib/control-plane';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  try {
    const { slug } = await params;
    if (!isValidTenantSlug(slug)) return NextResponse.json({ error: 'Invalid tenant slug' }, { status: 400 });

    const cp = controlClient();
    const { data: tenant, error: tenantError } = await cp
      .from('tenants')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (tenantError) throw tenantError;
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const [stateResult, runtimeResult, scheduleResult, cycleRunsResult, eventsResult, commandsResult, secretRefsResult, envResult] =
      await Promise.all([
        cp.from('tenant_state').select('*').eq('tenant_id', tenant.id).maybeSingle(),
        cp.from('tenant_runtime').select('*').eq('tenant_id', tenant.id).maybeSingle(),
        cp.from('tenant_schedule').select('*').eq('tenant_id', tenant.id).maybeSingle(),
        cp.from('cycle_runs')
          .select('id, outcome, started_at, finished_at, duration_ms, http_status, farms_count, executions_count, errors_count, guardian_fixed, fills_reconciled, snapshot_hit, error')
          .eq('tenant_id', tenant.id)
          .order('started_at', { ascending: false })
          .limit(20),
        cp.from('tenant_events')
          .select('id, at, kind, actor_kind, actor, reason, detail')
          .eq('tenant_id', tenant.id)
          .order('at', { ascending: false })
          .limit(50),
        cp.from('tenant_commands')
          .select('id, command, args, requested_by, requested_at, status, claimed_at, claimed_by, finished_at, result, error')
          .eq('tenant_id', tenant.id)
          .order('requested_at', { ascending: false })
          .limit(20),
        // Fingerprint and rotation timestamp ONLY. secret_ref (the vault pointer) is never
        // selected here -- an admin API response must never be a way to learn where a tenant's
        // signing key lives, let alone the key itself.
        cp.from('tenant_secret_refs').select('name, fingerprint, rotated_at').eq('tenant_id', tenant.id),
        // Key names only. tenant_env.value is never selected, matching the task's instruction:
        // "env keys (names only)".
        cp.from('tenant_env').select('key, updated_at').eq('tenant_id', tenant.id),
      ]);

    for (const result of [stateResult, runtimeResult, scheduleResult, cycleRunsResult, eventsResult, commandsResult, secretRefsResult, envResult]) {
      if (result.error) throw result.error;
    }

    const state = stateResult.data;
    const rt = runtimeResult.data;
    const schedule = scheduleResult.data;

    return NextResponse.json(
      {
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          displayName: tenant.display_name,
          status: tenant.status,
          // Wallet ADDRESSES, not secrets -- these are public on-chain identifiers an operator
          // needs to answer "whose money is this". No private key ever appears in this schema at
          // all; see the `secrets` field below for the one place key material is referenced.
          mainWalletAddress: tenant.main_wallet_address,
          apiWalletAddress: tenant.api_wallet_address,
          baseUrl: tenant.base_url,
          port: tenant.port,
          host: tenant.host,
          supabaseSchema: tenant.supabase_schema,
          plan: tenant.plan,
          ownerEmail: tenant.owner_email,
          // The FACT of a linked subscription, never the billing id itself -- it is the only
          // thing a caller needs from that column, and it is what decides which provisioning
          // path applies: a subscription-linked tenant provisions with the address the CUSTOMER
          // proved ownership of (attached server-side by the command route, custody-6), while a
          // tenant with no subscription has no such address to attach and the host agent will
          // refuse the command rather than let one be typed in fresh.
          hasHostingSubscription: Boolean(tenant.hosting_subscription_id),
          notes: tenant.notes,
          createdAt: tenant.created_at,
          updatedAt: tenant.updated_at,
          archivedAt: tenant.archived_at,
        },
        state: state
          ? {
              haltNewTrades: state.halt_new_trades,
              haltReason: state.halt_reason,
              haltSetBy: state.halt_set_by,
              haltSetAt: state.halt_set_at,
              peakAgentEquity: state.peak_agent_equity,
              peakBalance: state.peak_balance,
              lastSeenBalance: state.last_seen_balance,
              running: state.running,
              cycleCount: state.cycle_count,
              lastCycleAt: state.last_cycle_at,
              standby: state.standby,
              standbyReason: state.standby_reason,
              stateVersion: state.state_version,
            }
          : null,
        runtime: rt
          ? {
              state: rt.state,
              pid: rt.pid,
              startedAt: rt.started_at,
              stoppedAt: rt.stopped_at,
              stopReason: rt.stop_reason,
              spawnCount: rt.spawn_count,
              lastError: rt.last_error,
              heartbeatAt: rt.heartbeat_at,
              // The fleet reconciler's crash-loop breaker (0018_fleet_reconciler.sql). Surfaced
              // because 'why is this tenant down' must be answerable here: needs_attention means
              // the reconciler has deliberately stopped restarting it, and nothing will bring it
              // back on its own until control.clear_restart_attempts() runs host-side.
              restartAttempts: rt.restart_attempts,
              restartWindowStartedAt: rt.restart_window_started_at,
              lastRestartAttemptAt: rt.last_restart_attempt_at,
              needsAttention: rt.needs_attention,
              needsAttentionReason: rt.needs_attention_reason,
              needsAttentionAt: rt.needs_attention_at,
            }
          : null,
        schedule: schedule
          ? {
              enabled: schedule.enabled,
              intervalSeconds: schedule.interval_seconds,
              nextRunAt: schedule.next_run_at,
              lastStartedAt: schedule.last_started_at,
              lastFinishedAt: schedule.last_finished_at,
              consecutiveFailures: schedule.consecutive_failures,
              backoffUntil: schedule.backoff_until,
            }
          : null,
        cycleRuns: cycleRunsResult.data || [],
        events: eventsResult.data || [],
        commands: commandsResult.data || [],
        secrets: (secretRefsResult.data || []).map((row) => ({
          name: row.name,
          fingerprint: row.fingerprint,
          rotatedAt: row.rotated_at,
        })),
        envKeys: (envResult.data || []).map((row) => row.key),
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Control-plane tenant detail failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Tenant detail could not be loaded.' }, { status: 503 });
  }
}
