'use client';

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { TenantCommand } from '@/lib/control-plane';

// ──────────────────────────────────────────────────────────────────────────────────────────────
// FLEET CONTROL — the operator's view of control.tenants (the control plane in C:/GWDS/hosting).
//
// TWO DIFFERENT THINGS LIVE ON THE HOSTING PAGE AND THEY MUST NEVER BE ADDED TOGETHER:
//
//   public.hosting_instances   A SERVICE RECORD per paid subscription — billing state, onboarding
//                              approval, provider/deployment references, the activation checklist.
//                              Written by the storefront's own provisioning worker, which is
//                              disabled for real tenants behind HOSTING_AUTOMATION_ENABLED (see
//                              the comment in src/app/api/webhooks/stripe/route.ts). It can be
//                              empty while real tenants are running — and it is, which is exactly
//                              why the Overview's "Active instances" tile read 0 with a live
//                              tenant on the box.
//
//   control.tenants            THE FLEET. Real processes on the owner's host, with ports, pids,
//                              halts, restart breakers and wallets. This component is the view of
//                              that, and every button below enqueues into control.tenant_commands
//                              through the routes that already exist under
//                              /api/admin/hosting/tenants/. Nothing here reaches a tenant process:
//                              tenants bind 127.0.0.1 and Vercel cannot open a connection to the
//                              owner's workstation. A host-side agent draining that queue is the
//                              only thing that ever performs an action.
//
// NOTHING IN THIS FILE IS A SAFETY BOUNDARY. Every guard that matters is enforced server-side and
// again in the database: owner-only unhalt, confirm === slug, args.confirm = 'UNHALT' written by
// the route from nothing the caller supplied, requested_by taken from the authenticated session,
// the unhalt CHECK constraint in 0013, and the host agent's own re-checks in commands.ts. What
// this file adds is the one thing a server cannot: making the operator SEE what a command is
// about to do, to whom, and how old the state they are acting on is.
// ──────────────────────────────────────────────────────────────────────────────────────────────

// Mirrors the row shape of GET /api/admin/hosting/tenants.
export interface FleetTenant {
  id: string;
  slug: string;
  displayName: string | null;
  status: string;
  port: number | null;
  host: string | null;
  plan: string | null;
  ownerEmail: string | null;
  mainWalletAddress: string | null;
  apiWalletAddress: string | null;
  createdAt: string;
  updatedAt: string;
  halt: { active: boolean; reason: string | null; setBy: string | null; setAt: string | null };
  schedulerRunning: boolean;
  cycleCount: number;
  standby: boolean;
  standbyReason: string | null;
  stateVersion: number | null;
  health: string;
  processState: string;
  pid: number | null;
  restartAttempts: number | null;
  needsAttention: boolean | null;
  needsAttentionReason: string | null;
  needsAttentionAt: string | null;
  lastError: string | null;
  lastCycle: { outcome: string; startedAt: string; finishedAt: string | null; ageSeconds: number | null } | null;
}

interface TenantDetail {
  tenant: {
    slug: string;
    displayName: string | null;
    status: string;
    mainWalletAddress: string | null;
    apiWalletAddress: string | null;
    baseUrl: string | null;
    port: number | null;
    host: string | null;
    supabaseSchema: string | null;
    plan: string | null;
    ownerEmail: string | null;
    hasHostingSubscription: boolean;
    notes: string | null;
    archivedAt: string | null;
  };
  state: {
    haltNewTrades: boolean;
    haltReason: string | null;
    haltSetBy: string | null;
    haltSetAt: string | null;
    lastSeenBalance: number | null;
    running: boolean;
    cycleCount: number;
    lastCycleAt: string | null;
    standby: boolean;
    standbyReason: string | null;
    stateVersion: number | null;
  } | null;
  runtime: {
    state: string;
    pid: number | null;
    startedAt: string | null;
    stoppedAt: string | null;
    stopReason: string | null;
    spawnCount: number | null;
    lastError: string | null;
    heartbeatAt: string | null;
    restartAttempts: number | null;
    restartWindowStartedAt: string | null;
    lastRestartAttemptAt: string | null;
    needsAttention: boolean | null;
    needsAttentionReason: string | null;
    needsAttentionAt: string | null;
  } | null;
  commands: Array<{
    id: string;
    command: string;
    requested_by: string;
    requested_at: string;
    status: string;
    finished_at: string | null;
    error: string | null;
  }>;
  events: Array<{ id: string; at: string; kind: string; actor: string | null; reason: string | null }>;
}

interface AdminIdentity {
  email: string;
  role: string;
}

// ── styles ────────────────────────────────────────────────────────────────────────────────────
// Declared locally, matching the palette of src/app/admin/hosting/page.tsx. Every admin surface in
// this repo carries its own style constants (see AdminAccessGate.tsx); there is no shared module
// to reuse.
const card: CSSProperties = { background: '#07100d', border: '1px solid #17352b', borderRadius: 12, padding: 20 };
const input: CSSProperties = { width: '100%', background: '#030806', color: '#e5f7ef', border: '1px solid #21483b', borderRadius: 8, padding: '10px 12px' };
const button: CSSProperties = { background: '#4ade9f', color: '#03110b', border: 0, borderRadius: 7, padding: '9px 12px', fontWeight: 800, cursor: 'pointer' };
const secondary: CSSProperties = { ...button, background: '#10251e', color: '#a7f3d0', border: '1px solid #245443' };
const dangerButton: CSSProperties = { ...button, background: '#2a0f12', color: '#fda4af', border: '1px solid #7f1d1d' };
const mono: CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 };
const th: CSSProperties = { textAlign: 'left', padding: 10, color: '#789488', fontSize: 11, whiteSpace: 'nowrap' };
const td: CSSProperties = { padding: 10, verticalAlign: 'top', fontSize: 13 };

function Pill({ text, tone }: { text: string; tone: 'good' | 'bad' | 'warn' | 'neutral' }) {
  const palette = {
    good: { background: '#0e3b2b', color: '#6ee7b7' },
    bad: { background: '#441b22', color: '#fda4af' },
    warn: { background: '#3a2f0c', color: '#fde68a' },
    neutral: { background: '#25291f', color: '#d9d59b' },
  }[tone];
  return (
    <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, ...palette }}>
      {text}
    </span>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div style={{ color: '#789488', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
      <div style={{ marginTop: 4, wordBreak: 'break-word' }}>{children}</div>
    </div>
  );
}

function stamp(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : '—';
}

function shortAddress(value: string | null) {
  if (!value) return '—';
  return value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
}

// ── polling ───────────────────────────────────────────────────────────────────────────────────

export interface FleetState {
  /** null until the first read resolves — never render a confident count before then. */
  tenants: FleetTenant[] | null;
  /** Set ONLY on a successful fetch, so a failed poll makes the displayed age visibly go stale
   *  instead of leaving a fresh-looking timestamp over data nobody re-read. */
  fetchedAt: number | null;
  error: string;
  reload: () => void;
}

export function useFleet(pollMs = 20_000): FleetState {
  const [tenants, setTenants] = useState<FleetTenant[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/hosting/tenants', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Fleet could not be loaded');
      setTenants(body.tenants || []);
      setFetchedAt(Date.now());
      setError('');
    } catch (reason) {
      // Deliberately keeps the last-known rows AND the last-known timestamp. Blanking the table on
      // a transient poll failure would be worse than showing old data — but only because the age
      // is shown beside it and keeps counting up.
      setError(reason instanceof Error ? reason.message : 'Fleet could not be loaded');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, pollMs);
    return () => clearInterval(timer);
  }, [load, pollMs]);

  return { tenants, fetchedAt, error, reload: load };
}

/** Renders how old the fleet data is, and keeps counting while nobody refetches. An operator must
 *  never act on a view without knowing its age — a stopped poll looks identical to a healthy one. */
export function AsOf({ fetchedAt, staleAfterMs = 60_000 }: { fetchedAt: number | null; staleAfterMs?: number }) {
  // The clock is held in state and advanced by the interval rather than read during render: a
  // render-time Date.now() would only update when something else happened to re-render, which is
  // exactly the failure this component exists to prevent -- an age that looks fresh because it
  // stopped moving.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setNow(Date.now());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!fetchedAt) return <span style={{ color: '#fda4af', fontSize: 12 }}>never loaded</span>;
  const ageMs = now === null ? null : Math.max(0, now - fetchedAt);
  const stale = ageMs !== null && ageMs > staleAfterMs;
  return (
    <span style={{ color: stale ? '#fda4af' : '#789488', fontSize: 12 }}>
      as of {new Date(fetchedAt).toLocaleTimeString()}
      {ageMs !== null ? ` · ${Math.round(ageMs / 1000)}s ago` : ''}
      {stale ? ' · STALE — refresh before acting' : ''}
    </span>
  );
}

export function fleetCounts(tenants: FleetTenant[] | null) {
  const rows = tenants || [];
  return {
    total: rows.length,
    active: rows.filter((row) => row.status === 'active').length,
    running: rows.filter((row) => row.processState === 'running').length,
    halted: rows.filter((row) => row.halt.active).length,
    needsAttention: rows.filter((row) => row.needsAttention === true).length,
  };
}

// ── command catalogue ─────────────────────────────────────────────────────────────────────────
// Keyed by TenantCommand, so a command added to TENANT_COMMANDS (src/lib/control-plane.ts) fails
// to compile here until it has been described, and its button then appears on its own — the
// console cannot silently fall behind the API. The effect text restates what the host agent
// actually does, sourced from services/tenant-runner/src/lifecycle.ts and
// services/host-agent/src/commands.ts, rather than what a button label implies.

interface CommandSpec {
  label: string;
  group: 'process' | 'lifecycle' | 'trading';
  effect: string;
  reason: 'required' | 'optional' | 'none';
  /** Operator must type the tenant slug. Never pre-filled, never defaulted. */
  typedConfirm: boolean;
  ownerOnly: boolean;
  danger: boolean;
  allowsForce: boolean;
}

const COMMANDS: Record<TenantCommand, CommandSpec> = {
  start: {
    label: 'Start process',
    group: 'process',
    effect:
      'Spawns the tenant process on its host. It does NOT clear a halt: a halted tenant that is ' +
      'started runs its cycles and its guardian sweep over open positions, and opens nothing new.',
    reason: 'none',
    typedConfirm: false,
    ownerOnly: false,
    danger: false,
    allowsForce: false,
  },
  stop: {
    label: 'Stop process',
    group: 'process',
    effect:
      'Stops the tenant process. The tenant stays active and scheduled, so the fleet reconciler is ' +
      'entitled to start it again — use Suspend to take a tenant out of service. Without force it ' +
      'will not interrupt a cycle that is still in flight.',
    reason: 'required',
    typedConfirm: false,
    ownerOnly: false,
    danger: false,
    allowsForce: true,
  },
  suspend: {
    label: 'Suspend tenant',
    group: 'lifecycle',
    effect:
      'Halts trading, disables the schedule, sets status = suspended and stops the process. If a ' +
      'cycle is still in flight after the drain timeout the process is deliberately left running ' +
      'and the command says so — trading is already halted by then, so nothing new starts.',
    reason: 'required',
    typedConfirm: false,
    ownerOnly: false,
    danger: false,
    allowsForce: true,
  },
  resume: {
    label: 'Resume tenant',
    group: 'lifecycle',
    effect:
      'Returns a suspended tenant to active with its schedule enabled — and LEAVES THE HALT EXACTLY ' +
      'WHERE IT IS. Lifting a billing suspension must never silently re-arm a desk a human halted ' +
      'for an unrelated reason. Clearing a halt is always a separate, named un-halt.',
    reason: 'optional',
    typedConfirm: false,
    ownerOnly: false,
    danger: false,
    allowsForce: false,
  },
  halt: {
    label: 'Halt trading',
    group: 'trading',
    effect:
      'Sets halt_new_trades = true. No NEW position opens. Cycles keep running and the guardian ' +
      'sweep keeps managing OPEN positions — a halt is not a stop, and must never be used as one.',
    reason: 'required',
    typedConfirm: false,
    ownerOnly: false,
    danger: false,
    allowsForce: false,
  },
  unhalt: {
    label: 'Un-halt trading',
    group: 'trading',
    effect:
      'Clears halt_new_trades. This tenant may open NEW positions with real money on its next ' +
      'cycle. It does not start the process and does not enable the schedule — those are separate ' +
      'commands. Owner role only; the server writes the required confirmation itself.',
    reason: 'optional',
    typedConfirm: true,
    ownerOnly: true,
    danger: true,
    allowsForce: false,
  },
  provision: {
    label: 'Provision / retry',
    group: 'lifecycle',
    effect:
      'Runs the provisioning sequence through the host agent. For a tenant created by self-serve ' +
      'signup the route attaches the wallet address the CUSTOMER proved ownership of and discards ' +
      'anything a request body claims. There is no field here to type an address into, by design.',
    reason: 'none',
    typedConfirm: false,
    ownerOnly: false,
    danger: false,
    allowsForce: false,
  },
  deprovision: {
    label: 'Deprovision',
    group: 'lifecycle',
    effect:
      'Suspends the tenant, then archives it. Archived tenants are never scheduled again, so no ' +
      'cycle — including the guardian sweep over any open position — runs for this tenant after ' +
      'this. It is refused outright if the process could not be stopped.',
    reason: 'required',
    typedConfirm: true,
    ownerOnly: false,
    danger: true,
    allowsForce: false,
  },
};

const GROUP_LABELS: Record<CommandSpec['group'], string> = {
  process: 'Process',
  lifecycle: 'Lifecycle',
  trading: 'Trading',
};

// Stated in the confirmation itself, not in a runbook nobody has open at the time. The retained
// list is verbatim from DeprovisionResult.retained in services/tenant-runner/src/lifecycle.ts.
const DEPROVISION_ENDS = [
  'trading is halted, the schedule is disabled and the process is stopped',
  'the tenant is archived: control.due_tenants() only sees active tenants, so no cycle ever runs for it again',
  'its port and wallet claims are released, so another tenant can take that port',
  'there is no un-archive command — bringing it back is a deliberate human act',
];

const DEPROVISION_RETAINED = [
  'wallet private keys in the secret store (they may hold funds)',
  'tenant row (status = archived) and its full event history',
  'tenant data — the per-tenant schema or the RLS rows, whichever is in force',
  'provisioning ledger and isolation-migration ledger',
];

// ── the panel ─────────────────────────────────────────────────────────────────────────────────

export default function HostingFleet({ fleet }: { fleet: FleetState }) {
  const [selectedSlug, setSelectedSlug] = useState('');
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [detailError, setDetailError] = useState('');
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);

  const [pending, setPending] = useState<TenantCommand | null>(null);
  const [reason, setReason] = useState('');
  const [typed, setTyped] = useState('');
  const [force, setForce] = useState(false);
  const [busy, setBusy] = useState(false);
  const [commandError, setCommandError] = useState('');
  const [commandResult, setCommandResult] = useState('');

  const { tenants, fetchedAt } = fleet;
  const selected = useMemo(
    () => (tenants || []).find((row) => row.slug === selectedSlug) || null,
    [tenants, selectedSlug],
  );

  // Who the audit trail will name. Read from the session the API itself authenticates with, never
  // typed or remembered client-side -- the command route ignores any actor in the body and writes
  // requested_by from its own requireAdmin() result. This is a display of that fact, not a source
  // of it, and the role only decides which buttons are worth offering.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((body) => {
        if (!cancelled && body?.ok && body.admin) setAdmin({ email: body.admin.email, role: body.admin.role });
      })
      .catch(() => {
        // A failed identity read must not imply authority: `admin` stays null and the console
        // stays read-only until it is known who is operating it.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDetail = useCallback(async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/hosting/tenants/${slug}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Tenant detail could not be loaded');
      setDetail(body);
      setDetailError('');
    } catch (failure) {
      setDetailError(failure instanceof Error ? failure.message : 'Tenant detail could not be loaded');
    }
  }, []);

  // Re-reads the selected tenant on every successful fleet poll, so what the operator is reading in
  // the detail panel -- the halt reason, the pid, the command history -- ages at exactly the rate
  // of the as-of stamp above it. Both go stale together, or neither does.
  useEffect(() => {
    if (!selectedSlug) {
      setDetail(null);
      return;
    }
    loadDetail(selectedSlug);
  }, [selectedSlug, fetchedAt, loadDetail]);

  // Never read one tenant's detail under another tenant's heading: after switching selection the
  // previous tenant's payload is still in state until the new fetch resolves, and a console about
  // live money must show nothing rather than somebody else's balance for those few hundred ms.
  const tenantDetail = detail && detail.tenant.slug === selectedSlug ? detail : null;

  const canCommand = admin?.role === 'owner' || admin?.role === 'operator';

  const select = (slug: string) => {
    setSelectedSlug((current) => (current === slug ? '' : slug));
    setPending(null);
    setCommandError('');
    setCommandResult('');
  };

  // Every open of a confirmation starts from nothing: no remembered reason, no remembered typed
  // slug, force off. A confirmation that arrives already satisfied is not a confirmation.
  const openPending = (command: TenantCommand) => {
    setPending(command);
    setReason('');
    setTyped('');
    setForce(false);
    setCommandError('');
    setCommandResult('');
  };

  const spec = pending ? COMMANDS[pending] : null;
  const reasonOk = !spec || spec.reason !== 'required' || reason.trim().length > 0;
  const typedOk = !spec || !spec.typedConfirm || typed === selectedSlug;
  const submittable = Boolean(spec && selected && canCommand && reasonOk && typedOk && !busy);

  const submit = async () => {
    if (!spec || !pending || !selected || !submittable) return;
    setBusy(true);
    setCommandError('');
    setCommandResult('');
    try {
      const args: Record<string, unknown> = {};
      if (spec.reason !== 'none' && reason.trim()) args.reason = reason.trim();
      if (spec.allowsForce && force) args.force = true;

      const payload: Record<string, unknown> = { command: pending, args };
      // Top-level `confirm`, not args.confirm: the route requires body.confirm === slug and then
      // writes args.confirm = 'UNHALT' itself, from nothing the browser sent. Sending that literal
      // from here would hollow out the database constraint that backs it.
      if (pending === 'unhalt') payload.confirm = typed;

      const response = await fetch(`/api/admin/hosting/tenants/${selected.slug}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'The command could not be enqueued');
      setCommandResult(
        `Queued ${pending} for ${selected.slug} as ${body.command?.requested_by || admin?.email || 'unknown actor'}` +
          ` · command ${String(body.command?.id || '').slice(0, 8)} · status ${body.command?.status || 'queued'}`,
      );
      setPending(null);
      setReason('');
      setTyped('');
      setForce(false);
      fleet.reload();
      await loadDetail(selected.slug);
    } catch (failure) {
      setCommandError(failure instanceof Error ? failure.message : 'The command could not be enqueued');
    } finally {
      setBusy(false);
    }
  };

  const counts = fleetCounts(tenants);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'baseline' }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 4 }}>Fleet — real tenant processes</h2>
            <p style={{ color: '#789488', margin: 0, fontSize: 13, maxWidth: 760, lineHeight: 1.5 }}>
              <code>control.tenants</code> on the owner&apos;s host. This is not the service-record list below it: a
              service record is the billing and onboarding paperwork for a subscription, while these are the
              processes that hold ports, pids and wallets. Commands are queued into{' '}
              <code>control.tenant_commands</code> and performed by the host agent — nothing on this page reaches a
              tenant process directly.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <AsOf fetchedAt={fetchedAt} />
            <button style={secondary} onClick={fleet.reload}>Refresh</button>
          </div>
        </div>

        {fleet.error && (
          <div style={{ ...card, borderColor: '#7f1d1d', color: '#fecaca', marginTop: 14 }}>
            Fleet: {fleet.error} — the rows below are the last successful read. Check the age above before acting.
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 4px' }}>
          <Pill text={`${counts.total} tenants`} tone="neutral" />
          <Pill text={`${counts.active} active`} tone={counts.active ? 'good' : 'neutral'} />
          <Pill text={`${counts.running} process running`} tone={counts.running ? 'good' : 'neutral'} />
          <Pill text={`${counts.halted} halted`} tone={counts.halted ? 'warn' : 'neutral'} />
          <Pill text={`${counts.needsAttention} need attention`} tone={counts.needsAttention ? 'bad' : 'neutral'} />
        </div>

        <div className="admin-table-wrap" style={{ marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Tenant', 'Status', 'Host / port', 'Process', 'Restarts', 'Attention', 'Halt', 'State v', 'Wallets'].map((header) => (
                  <th key={header} style={th}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(tenants || []).map((row) => (
                <tr
                  key={row.id}
                  onClick={() => select(row.slug)}
                  style={{
                    borderTop: '1px solid #17352b',
                    cursor: 'pointer',
                    background: row.slug === selectedSlug ? '#10251e' : 'transparent',
                  }}
                >
                  <td style={td}>
                    <strong>{row.slug}</strong>
                    <div style={{ color: '#789488', fontSize: 12 }}>{row.displayName || '—'}</div>
                  </td>
                  <td style={td}>
                    <Pill
                      text={row.status}
                      tone={row.status === 'active' ? 'good' : row.status === 'archived' || row.status === 'suspended' ? 'bad' : 'neutral'}
                    />
                  </td>
                  <td style={{ ...td, ...mono }}>
                    {row.host || '—'}:{row.port ?? '—'}
                  </td>
                  <td style={td}>
                    <Pill
                      text={row.processState}
                      tone={row.processState === 'running' ? 'good' : row.processState === 'failed' ? 'bad' : 'neutral'}
                    />
                    <div style={{ ...mono, color: '#789488', marginTop: 4 }}>pid {row.pid ?? '—'}</div>
                  </td>
                  <td style={td}>
                    {row.restartAttempts === null ? <span style={{ color: '#789488' }}>unknown</span> : row.restartAttempts}
                  </td>
                  <td style={td}>
                    {row.needsAttention === null ? (
                      <span style={{ color: '#789488', fontSize: 12 }}>unknown</span>
                    ) : row.needsAttention ? (
                      <Pill text="needs attention" tone="bad" />
                    ) : (
                      <Pill text="ok" tone="good" />
                    )}
                  </td>
                  <td style={td}>
                    {row.halt.active ? <Pill text="halted" tone="warn" /> : <Pill text="trading" tone="good" />}
                    <div style={{ color: '#789488', fontSize: 11, marginTop: 4 }}>{row.halt.setBy || '—'}</div>
                  </td>
                  <td style={{ ...td, ...mono }}>{row.stateVersion ?? '—'}</td>
                  <td style={{ ...td, ...mono, color: '#b6cbc2' }}>
                    <div title={row.mainWalletAddress || 'no main wallet'}>M {shortAddress(row.mainWalletAddress)}</div>
                    <div title={row.apiWalletAddress || 'no API wallet'}>A {shortAddress(row.apiWalletAddress)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tenants !== null && tenants.length === 0 && <p style={{ color: '#789488' }}>No tenants in the control plane.</p>}
        {tenants === null && !fleet.error && <p style={{ color: '#789488' }}>Loading fleet…</p>}
      </section>

      {selected && (
        <section style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
            <h2 style={{ marginTop: 0 }}>{selected.slug}</h2>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <AsOf fetchedAt={fetchedAt} />
              <button style={secondary} onClick={() => select(selected.slug)}>Close</button>
            </div>
          </div>

          {detailError && <div style={{ ...card, borderColor: '#7f1d1d', color: '#fecaca', marginBottom: 14 }}>{detailError}</div>}

          <div
            style={{
              ...card,
              borderColor: selected.halt.active ? '#806b22' : '#245443',
              background: selected.halt.active ? '#1c1808' : '#0a1a14',
              marginBottom: 16,
            }}
          >
            {selected.halt.active ? (
              <>
                <strong style={{ color: '#fde68a' }}>Trading is HALTED — no new position opens.</strong>
                <div style={{ color: '#cbbf8c', marginTop: 7, lineHeight: 1.6 }}>
                  Reason: {selected.halt.reason || <em>none recorded</em>}
                  <br />
                  Set by: <strong>{selected.halt.setBy || 'unknown'}</strong> at {stamp(selected.halt.setAt)}
                  <br />
                  state_version {selected.stateVersion ?? '—'} · cycles keep running, so open positions are still managed.
                </div>
              </>
            ) : (
              <>
                <strong style={{ color: '#6ee7b7' }}>Trading is ENABLED — this tenant may open new positions.</strong>
                <div style={{ color: '#9bb3a9', marginTop: 7 }}>
                  Last halt change by {selected.halt.setBy || 'unknown'} at {stamp(selected.halt.setAt)} · state_version{' '}
                  {selected.stateVersion ?? '—'}
                </div>
              </>
            )}
          </div>

          {selected.needsAttention === true && (
            <div style={{ ...card, borderColor: '#7f1d1d', background: '#2a0f12', marginBottom: 16 }}>
              <strong style={{ color: '#fda4af' }}>The fleet reconciler has given up on this tenant.</strong>
              <div style={{ color: '#f3b4bb', marginTop: 7, lineHeight: 1.6 }}>
                {selected.needsAttentionReason || 'No reason recorded.'} — flagged {stamp(selected.needsAttentionAt)} after{' '}
                {selected.restartAttempts ?? 0} restart attempt{selected.restartAttempts === 1 ? '' : 's'}. Nothing will
                restart it on its own while this breaker is set, and clearing the breaker is{' '}
                <code>control.clear_restart_attempts()</code> host-side — not one of the eight queue commands below, so
                starting it from here does not reset the counter.
              </div>
            </div>
          )}

          <div className="admin-stat-grid-4" style={{ gap: 14, marginBottom: 16 }}>
            <Field label="Status">
              <Pill text={selected.status} tone={selected.status === 'active' ? 'good' : 'neutral'} />
            </Field>
            <Field label="Host / port">
              <span style={mono}>
                {selected.host || '—'}:{selected.port ?? '—'}
              </span>
            </Field>
            <Field label="Runtime state">
              <Pill
                text={selected.processState}
                tone={selected.processState === 'running' ? 'good' : selected.processState === 'failed' ? 'bad' : 'neutral'}
              />
            </Field>
            <Field label="PID">
              <span style={mono}>{selected.pid ?? '—'}</span>
            </Field>
            <Field label="Restart attempts">{selected.restartAttempts === null ? 'unknown' : selected.restartAttempts}</Field>
            <Field label="Needs attention">
              {selected.needsAttention === null ? 'unknown' : selected.needsAttention ? 'YES' : 'no'}
            </Field>
            <Field label="halt_new_trades">{selected.halt.active ? 'true' : 'false'}</Field>
            <Field label="state_version">
              <span style={mono}>{selected.stateVersion ?? '—'}</span>
            </Field>
            <Field label="Owner email">{selected.ownerEmail || '—'}</Field>
            <Field label="Plan">{selected.plan || '—'}</Field>
            <Field label="Scheduler running">{selected.schedulerRunning ? 'yes' : 'no'}</Field>
            <Field label="Cycles">{selected.cycleCount}</Field>
            <Field label="Health">
              <Pill text={selected.health} tone={selected.health === 'healthy' ? 'good' : selected.health === 'unreachable' ? 'bad' : 'neutral'} />
            </Field>
            <Field label="Heartbeat">{stamp(tenantDetail?.runtime?.heartbeatAt)}</Field>
            <Field label="Last cycle">
              {selected.lastCycle ? `${selected.lastCycle.outcome} · ${selected.lastCycle.ageSeconds ?? '—'}s ago` : '—'}
            </Field>
            <Field label="Standby">{selected.standby ? selected.standbyReason || 'yes' : 'no'}</Field>
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            <Field label="Main wallet (customer funds)">
              <span style={mono}>{selected.mainWalletAddress || '— not provisioned'}</span>
            </Field>
            <Field label="API wallet (signing agent)">
              <span style={mono}>{selected.apiWalletAddress || '— not provisioned'}</span>
            </Field>
          </div>

          {selected.lastError && (
            <div style={{ ...card, borderColor: '#7f1d1d', color: '#fecaca', marginBottom: 16 }}>
              Last runtime error: {selected.lastError}
            </div>
          )}

          {/* ── command console ─────────────────────────────────────────────────────────────── */}
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Commands</h3>
          <p style={{ color: '#789488', fontSize: 12, margin: '0 0 12px', lineHeight: 1.6 }}>
            {admin ? (
              <>
                Every command below is attributed to <strong>{admin.email}</strong> ({admin.role}) — the API takes the
                actor from the authenticated session, writes it to <code>control.tenant_commands.requested_by</code> and
                records the enqueue in <code>admin_audit</code>. Nothing typed in this browser can change who it names.
              </>
            ) : (
              'Identity not established — the console stays read-only until the session is known.'
            )}
          </p>
          {admin && !canCommand && (
            <p style={{ color: '#fde68a', fontSize: 13 }}>
              Your role ({admin.role}) can read the fleet but not command it. Commands require owner or operator.
            </p>
          )}

          {canCommand && (
            <div style={{ display: 'grid', gap: 12 }}>
              {(['process', 'lifecycle', 'trading'] as const).map((group) => (
                <div key={group}>
                  <div style={{ color: '#789488', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
                    {GROUP_LABELS[group]}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(Object.keys(COMMANDS) as TenantCommand[])
                      .filter((command) => COMMANDS[command].group === group)
                      .map((command) => {
                        const entry = COMMANDS[command];
                        // Un-halting a tenant that is not halted has nothing to clear. Offering it
                        // anyway would invite someone to type a slug into the most dangerous dialog
                        // on the page for no effect, which is how a typed confirmation stops being
                        // read. (halt.active reads a missing state row as halted, so an unreadable
                        // state still offers the operator a way to act.)
                        const nothingToUnhalt = command === 'unhalt' && !selected.halt.active;
                        const blocked = (entry.ownerOnly && admin?.role !== 'owner') || nothingToUnhalt;
                        return (
                          <button
                            key={command}
                            disabled={busy || blocked}
                            title={
                              nothingToUnhalt
                                ? 'This tenant is not halted — there is nothing to clear.'
                                : blocked
                                  ? 'Owner role only — the API refuses this command for any other role.'
                                  : entry.effect
                            }
                            onClick={() => openPending(command)}
                            style={{
                              ...(entry.danger ? dangerButton : secondary),
                              opacity: busy || blocked ? 0.45 : 1,
                              cursor: busy || blocked ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {entry.label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {commandResult && <div style={{ ...card, borderColor: '#245443', color: '#a7f3d0', marginTop: 14 }}>{commandResult}</div>}
          {commandError && <div style={{ ...card, borderColor: '#7f1d1d', color: '#fecaca', marginTop: 14 }}>{commandError}</div>}

          {spec && pending && (
            <div
              style={{
                ...card,
                marginTop: 16,
                borderColor: spec.danger ? '#7f1d1d' : '#245443',
                background: spec.danger ? '#2a0f12' : '#0a1a14',
              }}
            >
              <h3 style={{ marginTop: 0, color: spec.danger ? '#fda4af' : '#a7f3d0' }}>
                {spec.label} — {selected.slug}
              </h3>
              <p style={{ color: '#cfe3da', lineHeight: 1.6, marginTop: 0 }}>{spec.effect}</p>

              {pending === 'unhalt' && (
                // "Show what is about to resume": the identity, the money and the halt this
                // clears, so the decision is never made from a button label alone.
                <div style={{ ...card, borderColor: '#806b22', background: '#1c1808', marginBottom: 14 }}>
                  <strong style={{ color: '#fde68a' }}>About to re-arm live trading for:</strong>
                  <div style={{ color: '#cbbf8c', marginTop: 8, lineHeight: 1.7 }}>
                    {selected.slug} ({selected.displayName || 'no display name'}) · owner {selected.ownerEmail || 'unknown'}
                    <br />
                    status {selected.status} · process {selected.processState} · {selected.host || '—'}:{selected.port ?? '—'}
                    <br />
                    main wallet <span style={mono}>{selected.mainWalletAddress || 'none'}</span>
                    <br />
                    {tenantDetail?.state?.lastSeenBalance != null && (
                      <>
                        last seen balance {tenantDetail.state.lastSeenBalance}
                        <br />
                      </>
                    )}
                    currently halted by <strong>{selected.halt.setBy || 'unknown'}</strong> at {stamp(selected.halt.setAt)}
                    <br />
                    because: {selected.halt.reason || <em>no reason recorded</em>}
                  </div>
                </div>
              )}

              {pending === 'deprovision' && (
                <div style={{ display: 'grid', gap: 12, marginBottom: 14 }}>
                  <div style={{ ...card, borderColor: '#7f1d1d', background: '#20090c' }}>
                    <strong style={{ color: '#fda4af' }}>This ends the customer&apos;s workspace:</strong>
                    <ul style={{ color: '#f3b4bb', margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
                      {DEPROVISION_ENDS.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ ...card, borderColor: '#245443', background: '#0a1a14' }}>
                    <strong style={{ color: '#a7f3d0' }}>Nothing is deleted. Retained:</strong>
                    <ul style={{ color: '#9bb3a9', margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.6 }}>
                      {DEPROVISION_RETAINED.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {pending === 'provision' && tenantDetail && !tenantDetail.tenant.hasHostingSubscription && (
                <div style={{ ...card, borderColor: '#806b22', background: '#1c1808', marginBottom: 14, color: '#cbbf8c', lineHeight: 1.6 }}>
                  This tenant has no linked subscription, so there is no customer-verified wallet address for the route
                  to attach. The host agent requires one and will fail the command rather than accept an address typed
                  by an operator — that refusal is the custody guard working, not something to route around from here.
                </div>
              )}

              {spec.reason !== 'none' && (
                <label style={{ display: 'block', fontSize: 12, color: '#789488', marginBottom: 12 }}>
                  Reason {spec.reason === 'required' ? '(required — it is written to the audit trail)' : '(optional)'}
                  <input
                    style={{ ...input, marginTop: 5 }}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Why this is being done"
                  />
                </label>
              )}

              {spec.allowsForce && (
                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: '#cbbf8c', marginBottom: 12 }}>
                  <input type="checkbox" checked={force} onChange={(event) => setForce(event.target.checked)} />
                  <span>
                    Force — stop the process even if a cycle is still in flight. That cycle is left unreconciled; use it
                    only when waiting for the drain is worse than losing the cycle&apos;s bookkeeping.
                  </span>
                </label>
              )}

              {spec.typedConfirm && (
                <label style={{ display: 'block', fontSize: 12, color: '#789488', marginBottom: 12 }}>
                  Type the tenant slug to confirm
                  <input
                    style={{ ...input, marginTop: 5, borderColor: typed && !typedOk ? '#7f1d1d' : '#21483b' }}
                    value={typed}
                    onChange={(event) => setTyped(event.target.value)}
                    // No default value, no slug in the placeholder, no autofill: the point is that a
                    // human types the name of the tenant they mean. For unhalt the server checks it
                    // again (confirm === slug) and only then writes the constraint's own literal.
                    placeholder="tenant slug"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  style={{
                    ...(spec.danger ? dangerButton : button),
                    opacity: submittable ? 1 : 0.45,
                    cursor: submittable ? 'pointer' : 'not-allowed',
                  }}
                  disabled={!submittable}
                  onClick={submit}
                >
                  {busy ? 'Queueing…' : `Queue ${pending}`}
                </button>
                <button style={secondary} disabled={busy} onClick={() => setPending(null)}>
                  Cancel
                </button>
                <span style={{ color: '#789488', fontSize: 12, display: 'inline-flex', gap: 6 }}>
                  Queued as {admin?.email || 'unknown actor'} · acting on state <AsOf fetchedAt={fetchedAt} />
                </span>
              </div>
            </div>
          )}

          {/* ── the trail the API already writes ────────────────────────────────────────────── */}
          <h3 style={{ fontSize: 15, marginTop: 22 }}>Recent commands</h3>
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Command', 'Requested by', 'Requested', 'Status', 'Finished', 'Error'].map((header) => (
                    <th key={header} style={th}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(tenantDetail?.commands || []).map((row) => (
                  <tr key={row.id} style={{ borderTop: '1px solid #17352b' }}>
                    <td style={td}>
                      <strong>{row.command}</strong>
                    </td>
                    <td style={td}>{row.requested_by}</td>
                    <td style={td}>{stamp(row.requested_at)}</td>
                    <td style={td}>
                      <Pill text={row.status} tone={row.status === 'done' ? 'good' : row.status === 'failed' ? 'bad' : 'neutral'} />
                    </td>
                    <td style={td}>{stamp(row.finished_at)}</td>
                    <td style={{ ...td, color: '#fda4af' }}>{row.error || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tenantDetail && tenantDetail.commands.length === 0 && <p style={{ color: '#789488' }}>No commands have been queued for this tenant.</p>}

          <h3 style={{ fontSize: 15, marginTop: 22 }}>Recent events</h3>
          {(tenantDetail?.events || []).slice(0, 15).map((event) => (
            <div
              key={event.id}
              style={{ borderTop: '1px solid #17352b', padding: '9px 0', fontSize: 12, display: 'grid', gridTemplateColumns: '170px 150px 1fr', gap: 12 }}
            >
              <span style={{ color: '#789488' }}>{stamp(event.at)}</span>
              <strong>{event.kind}</strong>
              <span style={{ color: '#b6cbc2' }}>
                {event.actor || '—'} {event.reason ? `· ${event.reason}` : ''}
              </span>
            </div>
          ))}
          {tenantDetail && tenantDetail.events.length === 0 && <p style={{ color: '#789488' }}>No events recorded.</p>}
        </section>
      )}
    </div>
  );
}
