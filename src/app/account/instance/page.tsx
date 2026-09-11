"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import type { TenantHealth, TenantHealthReason } from "@/lib/control-plane";

interface CycleRun {
  id: string;
  outcome: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  error: string | null;
}

interface InstanceData {
  tenant: {
    slug: string;
    displayName: string;
    status: string;
    plan: string;
    mainWalletAddress: string | null;
    apiWalletAddress: string | null;
    createdAt: string;
  };
  health: TenantHealth;
  // Type-only import, so adding a reason to the control plane breaks this file's switch at
  // compile time rather than silently rendering an unexplained health value.
  healthReason: TenantHealthReason;
  heartbeatAgeMs: number | null;
  heartbeatAt: string | null;
  processState: string;
  lastError: string | null;
  halt: { active: boolean; reason: string | null; setBy: string | null; setAt: string | null };
  schedule: { enabled: boolean; nextRunAt: string | null; consecutiveFailures: number; backoffUntil: string | null } | null;
  running: boolean;
  cycleCount: number;
  lastCycleAt: string | null;
  recentCycles: CycleRun[];
}

// Authorized is not running. These are the states the host can actually be in relative to one
// strategy the customer has authorized, and they are reported by /api/account/instance/loadout
// from the reconciler's own audit trail — never inferred from the fact that the customer asked.
type RuntimeState =
  | "not_installed"
  | "awaiting_sync"
  | "restart_pending"
  | "workspace_stopped"
  | "running"
  | "blocked";

interface InstanceConfig {
  market?: string;
}

interface LoadoutStrategy {
  agentId: string;
  name: string;
  emoji: string;
  description: string;
  tradesMarket: boolean;
  maxInstances: number;
  entitled: boolean;
  instances: number;
  config: InstanceConfig[];
  authorizedAt: string | null;
  runtime: { state: RuntimeState; reason: string | null; confirmedAt: string | null };
}

interface LoadoutData {
  tenantStatus: string;
  capacityReady: boolean;
  plan: {
    id: string | null;
    name: string | null;
    agentLimit: number;
    executionMode: "simulated" | "live";
    source: "subscription" | "tenant" | "unresolved";
  };
  capacity: { used: number; limit: number; platformMax: number; overCap: boolean };
  nextPlan: { id: string; name: string; priceCents: number; agentLimit: number } | null;
  strategies: LoadoutStrategy[];
  orphaned: { agentId: string; name: string; installedAt: string | null }[];
  note: string;
}

/** One strategy's line while the customer is editing it, before it is saved. */
interface DraftEntry {
  instances: number;
  /** One market per instance. Kept as raw strings so a half-typed ticker is not thrown away. */
  markets: string[];
}

type Draft = Record<string, DraftEntry>;

function draftFrom(strategies: LoadoutStrategy[]): Draft {
  const draft: Draft = {};
  for (const strategy of strategies) {
    draft[strategy.agentId] = {
      instances: strategy.instances,
      markets: Array.from({ length: strategy.instances }, (_, i) => strategy.config[i]?.market ?? ""),
    };
  }
  return draft;
}

function draftTotal(draft: Draft) {
  return Object.values(draft).reduce((sum, entry) => sum + entry.instances, 0);
}

// Deliberately says "the host has not confirmed this yet" rather than showing nothing, because the
// absence of a badge reads as "fine" — and a customer whose sync has not completed needs to be
// able to see that their agent is authorized but not trading.
const RUNTIME_COPY: Record<RuntimeState, { label: string; good: boolean; detail: string }> = {
  not_installed: { label: "not authorized", good: false, detail: "Not in your loadout." },
  awaiting_sync: {
    label: "awaiting sync",
    good: false,
    detail: "Authorized. Your workspace has not confirmed it is installed yet.",
  },
  restart_pending: {
    label: "restart pending",
    good: false,
    detail: "Installed in your workspace, but it loads strategies at startup and has not restarted yet.",
  },
  workspace_stopped: {
    label: "workspace stopped",
    good: false,
    detail: "Installed, but your workspace is not running, so it is not trading.",
  },
  running: { label: "running", good: true, detail: "Confirmed running by your workspace." },
  blocked: { label: "blocked", good: false, detail: "Your workspace could not start this agent." },
};

const field: React.CSSProperties = {
  width: "100%",
  background: "var(--color-neutral-100)",
  color: "var(--color-text)",
  border: "1px solid var(--color-divider)",
  borderRadius: "var(--radius-md)",
  padding: "12px 14px",
};

function Tag({ value, good }: { value: string; good?: boolean }) {
  const isGood = good ?? ["active", "healthy", "ok", "running"].includes(value);
  return (
    <span className={isGood ? "tag tag-accent-2" : "tag tag-neutral"}>
      {value?.replaceAll("_", " ") || "unknown"}
    </span>
  );
}

function fmt(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

// Age is measured on the server at response time, so a clock-skewed browser cannot turn a stale
// heartbeat into a fresh-looking one.
function relativeAge(ms: number | null) {
  if (ms === null || !Number.isFinite(ms)) return "an unknown time ago";
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "less than a minute ago";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// "Health: DEGRADED" on its own is a support ticket waiting to happen — it tells the customer
// something is wrong and nothing about what. The reason comes from the same assessment that
// produced the health value (assessTenantHealth in src/lib/control-plane.ts), so the sentence
// below can never explain a verdict other than the one shown.
//
// Deliberately says nothing about halts: whether new trades are permitted is a separate fact with
// its own panel further down, and folding the two together is what made "degraded" ambiguous.
function healthExplanation(data: InstanceData) {
  const checkedIn = `${relativeAge(data.heartbeatAgeMs)} (${fmt(data.heartbeatAt)})`;
  switch (data.healthReason) {
    case "ok":
      return `Your workspace last checked in ${checkedIn}.`;
    case "stale_heartbeat":
      return `Your workspace last checked in ${checkedIn}. It normally reports every five minutes, so it may have stopped running. Nothing on your side causes this — contact support if it does not clear.`;
    case "no_heartbeat":
      return "Your workspace is marked as running but has not reported in yet. This usually clears within a few minutes.";
    case "process_starting":
      return "Your workspace is starting up. This usually clears within a few minutes.";
    case "process_stopping":
      return "Your workspace is shutting down.";
    case "process_stopped":
      return "Your workspace is not running right now. It stays offline until it is started again.";
    case "process_failed":
      return "Your workspace stopped unexpectedly and has not restarted. Contact support if it does not come back shortly.";
    case "no_runtime_report":
      return "We have not received a status report for your workspace yet.";
  }
  // Unreachable while every reason above is handled. Adding one to TenantHealthReason without
  // writing customer copy for it fails this assignment rather than shipping a blank explanation.
  const unhandled: never = data.healthReason;
  return unhandled;
}

export default function InstancePage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [data, setData] = useState<InstanceData | null>(null);
  const [loadout, setLoadout] = useState<LoadoutData | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [notFound, setNotFound] = useState<{ code: string; message: string } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [haltReason, setHaltReason] = useState("");
  const [showResume, setShowResume] = useState(false);
  const [resumeReason, setResumeReason] = useState("");
  const [resumeConfirm, setResumeConfirm] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/account/login?next=/account/instance");
  }, [authLoading, user, router]);

  const load = useCallback(async () => {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };
    const instanceRes = await fetch("/api/account/instance", { headers, cache: "no-store" });
    const instanceBody = await instanceRes.json();
    if (!instanceRes.ok) {
      if (instanceBody.code === "NO_TENANT" || instanceBody.code === "AMBIGUOUS_TENANT") {
        setNotFound({ code: instanceBody.code, message: instanceBody.error });
        setData(null);
        setLoadout(null);
        setDraft({});
        return;
      }
      throw new Error(instanceBody.error || "Your instance could not be loaded");
    }
    setNotFound(null);
    setData(instanceBody);

    const loadoutRes = await fetch("/api/account/instance/loadout", { headers, cache: "no-store" });
    const loadoutBody = await loadoutRes.json();
    if (loadoutRes.ok) {
      setLoadout(loadoutBody);
      // The saved set is the only thing the editor is ever seeded from, so a reload after a save
      // (or after a failed save) shows what the server actually holds, not what was typed.
      setDraft(draftFrom(loadoutBody.strategies));
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (user && session) load().catch((reason) => setError(reason.message));
  }, [user, session, load]);

  const call = useCallback(
    async (key: string, url: string, body?: Record<string, unknown>) => {
      setBusy(key);
      setError("");
      setNotice("");
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Request failed");
        setNotice("Done. Your instance status has been updated.");
        await load();
        return result;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Request failed");
        throw reason;
      } finally {
        setBusy("");
      }
    },
    [session?.access_token, load],
  );

  const openDashboard = async () => {
    setBusy("dashboard");
    setError("");
    try {
      const response = await fetch("/api/account/dashboard-link", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "The live dashboard is temporarily unavailable.");
      window.open(body.url, "_blank", "noopener,noreferrer");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request failed");
    } finally {
      setBusy("");
    }
  };

  const doHalt = async () => {
    const reason = haltReason.trim();
    if (!reason) {
      setError("Enter a reason to halt trading.");
      return;
    }
    await call("halt", "/api/account/instance/command", { command: "halt", reason });
    setHaltReason("");
  };

  const doResume = async () => {
    if (!data) return;
    const reason = resumeReason.trim();
    const confirm = resumeConfirm.trim();
    if (confirm !== data.tenant.slug) {
      setError(`Type "${data.tenant.slug}" exactly to confirm.`);
      return;
    }
    if (!reason) {
      setError("Enter a reason to resume trading.");
      return;
    }
    await call("unhalt", "/api/account/instance/command", { command: "unhalt", reason, confirm });
    setResumeReason("");
    setResumeConfirm("");
    setShowResume(false);
  };

  const setInstances = (strategy: LoadoutStrategy, instances: number) => {
    setDraft((current) => {
      const entry = current[strategy.agentId] ?? { instances: 0, markets: [] };
      const markets = Array.from({ length: instances }, (_, i) => entry.markets[i] ?? "");
      return { ...current, [strategy.agentId]: { instances, markets } };
    });
  };

  const setMarket = (agentId: string, index: number, value: string) => {
    setDraft((current) => {
      const entry = current[agentId];
      if (!entry) return current;
      const markets = [...entry.markets];
      markets[index] = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
      return { ...current, [agentId]: { ...entry, markets } };
    });
  };

  const saveLoadout = async () => {
    if (!loadout) return;
    const payload = loadout.strategies
      .filter((strategy) => (draft[strategy.agentId]?.instances ?? 0) > 0)
      .map((strategy) => {
        const entry = draft[strategy.agentId];
        return {
          agentId: strategy.agentId,
          instances: entry.instances,
          config: Array.from({ length: entry.instances }, (_, i) =>
            strategy.tradesMarket ? { market: entry.markets[i] ?? "" } : {},
          ),
        };
      });
    await call("loadout", "/api/account/instance/loadout", { loadout: payload });
  };

  if (authLoading || !user) {
    return (
      <div className="cival">
        <Navbar />
        <main style={{ minHeight: "100vh", paddingTop: 180, textAlign: "center" }}>Loading...</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: "100vh", padding: "130px 24px 90px" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "flex-start",
              marginBottom: 34,
            }}
          >
            <div>
              <span className="tag tag-accent">Live instance</span>
              <h1 style={{ fontSize: "clamp(34px,5vw,54px)", margin: "16px 0 8px" }}>Your workspace</h1>
              <p style={{ color: "var(--color-neutral-700)", margin: 0 }}>
                Status, trading control, your agent wallet and strategy-agent loadout.
              </p>
            </div>
            <Link className="btn btn-secondary" href="/account">
              Back to account
            </Link>
          </div>

          {error && (
            <div
              style={{
                padding: 16,
                border: "1px solid #783333",
                background: "#240d0d",
                borderRadius: "var(--radius-md)",
                color: "#ffb4b4",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}
          {notice && (
            <div
              style={{
                padding: 16,
                border: "1px solid var(--color-accent)",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-accent)",
                marginBottom: 16,
              }}
            >
              {notice}
            </div>
          )}

          {notFound && (
            <section
              style={{
                padding: 26,
                border: "1px solid var(--color-divider)",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-surface)",
              }}
            >
              <h2 style={{ marginTop: 0 }}>No live workspace yet</h2>
              <p style={{ color: "var(--color-neutral-700)", lineHeight: 1.6 }}>
                {notFound.code === "AMBIGUOUS_TENANT"
                  ? notFound.message
                  : "Your account is not yet linked to a live trading instance. If you have subscribed to managed hosting, your workspace appears here once it has been provisioned."}
              </p>
              <Link className="btn btn-primary" href="/account/hosting">
                Open hosting workspace
              </Link>
            </section>
          )}

          {!notFound && !data && (
            <main style={{ textAlign: "center", padding: "60px 0" }}>Loading your instance...</main>
          )}

          {data && (
            <>
              <div
                data-cv-2col
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4,minmax(0,1fr))",
                  gap: 12,
                  marginBottom: 18,
                }}
              >
                {[
                  ["Workspace", data.tenant.displayName || data.tenant.slug],
                  ["Status", <Tag key="s" value={data.tenant.status} good={data.tenant.status === "active"} />],
                  ["Health", <Tag key="h" value={data.health} good={data.health === "healthy"} />],
                  ["Trading", <Tag key="t" value={data.halt.active ? "halted" : "live"} good={!data.halt.active} />],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    style={{
                      padding: 20,
                      border: "1px solid var(--color-divider)",
                      background: "var(--color-surface)",
                      borderRadius: "var(--radius-lg)",
                    }}
                  >
                    <div style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{value}</div>
                  </div>
                ))}
              </div>

              <p
                style={{
                  margin: "0 0 18px",
                  padding: "12px 16px",
                  border: `1px solid ${data.health === "healthy" ? "var(--color-divider)" : "#8a762d"}`,
                  background: data.health === "healthy" ? "var(--color-surface)" : "#1d1909",
                  borderRadius: "var(--radius-md)",
                  color: data.health === "healthy" ? "var(--color-neutral-700)" : "#e7d991",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Health</strong> — {healthExplanation(data)}
              </p>

              <section
                style={{
                  padding: 26,
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: 18,
                  background: "var(--color-surface)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h2 style={{ margin: "0 0 6px" }}>Your dashboard</h2>
                    {/* This used to end "signed in as you", which it is not. The button mints a
                      * one-time gateway ticket (/api/account/dashboard-link) that proves to the
                      * reverse proxy which tenant you own and opens a gateway session; that is
                      * network admission, not authentication to the workspace. The dashboard
                      * behind it runs its own login and asks for it.
                      *
                      * The fix is the sentence, deliberately not SSO. Making the first step also
                      * be the second means the workspace trusting a proxy-supplied header as
                      * proof of identity — anyone who can reach the app port directly then
                      * bypasses login by setting that header. That is the owner's decision to
                      * make, not a copy fix, so the copy describes the two steps that exist. */}
                    <p style={{ color: "var(--color-neutral-700)", margin: 0 }}>
                      Opens your workspace in a new tab. The link admits you
                      through the hosting gateway; the dashboard then asks for
                      its own sign-in, which is separate from your Cival Systems
                      account.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    disabled={!!busy || data.tenant.status !== "active"}
                    onClick={openDashboard}
                  >
                    {busy === "dashboard" ? "Opening..." : "Open dashboard"}
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                    gap: 12,
                    marginTop: 18,
                  }}
                >
                  <div>
                    <div style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>Main wallet (holds funds)</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, wordBreak: "break-all" }}>
                      {data.tenant.mainWalletAddress || "not yet assigned"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>
                      Agent wallet (trades only, cannot withdraw)
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, wordBreak: "break-all" }}>
                      {data.tenant.apiWalletAddress || "not yet assigned"}
                    </div>
                  </div>
                </div>
              </section>

              <section
                style={{
                  padding: 26,
                  border: `1px solid ${data.halt.active ? "#8a762d" : "var(--color-divider)"}`,
                  background: data.halt.active ? "#1d1909" : "var(--color-surface)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: 18,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: "0 0 6px", color: data.halt.active ? "#e7d991" : undefined }}>
                      {data.halt.active ? "Trading is halted" : "Trading is live"}
                    </h2>
                    <p style={{ color: data.halt.active ? "#e7d991" : "var(--color-neutral-700)", margin: 0 }}>
                      {data.halt.active
                        ? `Halted by ${data.halt.setBy || "unknown"} on ${fmt(data.halt.setAt)}${data.halt.reason ? ` — ${data.halt.reason}` : ""}.`
                        : "New trades are permitted. Halting takes effect immediately."}
                    </p>
                  </div>
                </div>

                {!data.halt.active ? (
                  <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                    <input
                      style={{ ...field, maxWidth: 420 }}
                      placeholder="Reason for halting (required)"
                      value={haltReason}
                      onChange={(e) => setHaltReason(e.target.value)}
                    />
                    <button className="btn btn-secondary" disabled={!!busy} onClick={doHalt}>
                      {busy === "halt" ? "Halting..." : "Halt trading now"}
                    </button>
                  </div>
                ) : data.tenant.status !== "active" ? (
                  // Matches the route's own gate (src/app/api/account/instance/command/route.ts):
                  // a halt that is part of an operator's suspension is not the customer's to
                  // clear. Say so here rather than offering a button whose only outcome is a 409.
                  <p style={{ marginTop: 16, color: "var(--color-neutral-700)" }}>
                    Trading cannot be resumed while your workspace is {data.tenant.status}. Contact
                    support to have it brought back.
                  </p>
                ) : !showResume ? (
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowResume(true)}>
                    Resume trading
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: 16,
                      padding: 16,
                      border: "1px solid var(--color-divider)",
                      borderRadius: "var(--radius-md)",
                      background: "var(--color-bg)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13 }}>
                      Resuming re-arms live trading on your agent wallet. Type your workspace name{" "}
                      <strong>{data.tenant.slug}</strong> and a reason to confirm.
                    </p>
                    <input
                      style={field}
                      placeholder={`Type "${data.tenant.slug}" to confirm`}
                      value={resumeConfirm}
                      onChange={(e) => setResumeConfirm(e.target.value)}
                    />
                    <input
                      style={field}
                      placeholder="Reason for resuming (required)"
                      value={resumeReason}
                      onChange={(e) => setResumeReason(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: 10 }}>
                      <button className="btn btn-primary" disabled={!!busy} onClick={doResume}>
                        {busy === "unhalt" ? "Resuming..." : "Confirm resume trading"}
                      </button>
                      <button className="btn btn-secondary" onClick={() => setShowResume(false)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section
                style={{
                  padding: 26,
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                  marginBottom: 18,
                  background: "var(--color-surface)",
                }}
              >
                <h2 style={{ marginTop: 0 }}>Recent cycle outcomes</h2>
                {data.recentCycles.length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {data.recentCycles.map((cycle) => (
                      <div
                        key={cycle.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          borderTop: "1px solid var(--color-divider)",
                          paddingTop: 8,
                          fontSize: 13,
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{fmt(cycle.started_at)}</span>
                        <Tag value={cycle.outcome} good={cycle.outcome === "ok"} />
                        <span style={{ color: "var(--color-neutral-600)" }}>
                          {cycle.duration_ms ? `${cycle.duration_ms} ms` : "—"}
                        </span>
                        {cycle.error && <span style={{ color: "#ffb4b4" }}>{cycle.error.slice(0, 80)}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--color-neutral-700)" }}>No cycles have run yet.</p>
                )}
              </section>

              <section
                style={{
                  padding: 26,
                  border: "1px solid var(--color-divider)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-surface)",
                }}
              >
                {!loadout ? (
                  <>
                    <h2 style={{ marginTop: 0 }}>Strategy-agent loadout</h2>
                    <p style={{ color: "var(--color-neutral-700)", margin: 0 }}>Loading your loadout...</p>
                  </>
                ) : (
                  (() => {
                    const limit = loadout.capacity.limit;
                    const used = draftTotal(draft);
                    const editable =
                      loadout.capacityReady && data.tenant.status !== "archived" && !busy;
                    // Over cap is a downgrade, not a mistake to be auto-corrected: the ledger keeps
                    // what the customer authorized, and they choose what to drop. Saving is blocked
                    // until they have, so nothing is ever stopped on their behalf.
                    const overCap = used > limit;
                    const dirty = loadout.strategies.some((strategy) => {
                      const entry = draft[strategy.agentId];
                      if (!entry) return false;
                      if (entry.instances !== strategy.instances) return true;
                      return entry.markets.some(
                        (market, i) => market !== (strategy.config[i]?.market ?? ""),
                      );
                    });

                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 14,
                            flexWrap: "wrap",
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <h2 style={{ margin: "0 0 6px" }}>Strategy-agent loadout</h2>
                            <p style={{ color: "var(--color-neutral-700)", margin: 0, maxWidth: "62ch" }}>
                              Choose which strategies run in your workspace and how many of each. Two
                              instances of one strategy only add capacity if they trade different
                              markets.
                            </p>
                          </div>
                          <div
                            style={{
                              textAlign: "right",
                              padding: "10px 16px",
                              border: `1px solid ${overCap ? "#8a762d" : "var(--color-divider)"}`,
                              background: overCap ? "#1d1909" : "var(--color-bg)",
                              borderRadius: "var(--radius-md)",
                            }}
                          >
                            <div style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>Agents</div>
                            <div
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 22,
                                color: overCap ? "#e7d991" : undefined,
                              }}
                            >
                              {used} / {limit}
                            </div>
                            <div style={{ color: "var(--color-neutral-600)", fontSize: 11 }}>
                              {loadout.plan.name ? `${loadout.plan.name} plan` : "no plan linked"}
                            </div>
                          </div>
                        </div>

                        {loadout.plan.source === "unresolved" ? (
                          <p
                            style={{
                              margin: "16px 0 0",
                              padding: "12px 16px",
                              border: "1px solid #8a762d",
                              background: "#1d1909",
                              borderRadius: "var(--radius-md)",
                              color: "#e7d991",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            <strong>No hosting plan is linked to this workspace.</strong> Capacity is
                            held at {limit} agent until support links it, because an unrecognised plan
                            is not treated as permission to run more.
                          </p>
                        ) : loadout.plan.executionMode === "simulated" ? (
                          <p
                            style={{
                              margin: "16px 0 0",
                              padding: "12px 16px",
                              border: "1px solid var(--color-divider)",
                              background: "var(--color-bg)",
                              borderRadius: "var(--radius-md)",
                              color: "var(--color-neutral-700)",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            <strong>Simulated execution.</strong> On the {loadout.plan.name} plan these
                            agents place simulated orders only — nothing reaches a live venue. A paid
                            plan runs them against your own Hyperliquid account.
                          </p>
                        ) : null}

                        {overCap && (
                          <p
                            style={{
                              margin: "16px 0 0",
                              padding: "12px 16px",
                              border: "1px solid #8a762d",
                              background: "#1d1909",
                              borderRadius: "var(--radius-md)",
                              color: "#e7d991",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            <strong>
                              You have {used} agents selected and your plan allows {limit}.
                            </strong>{" "}
                            Nothing has been stopped for you — reduce the count by {used - limit} to
                            save, or move to a plan with more capacity. Your workspace will not install
                            agents beyond your plan&apos;s limit while this is unresolved.
                          </p>
                        )}

                        {!loadout.capacityReady && (
                          <p
                            style={{
                              margin: "16px 0 0",
                              padding: "12px 16px",
                              border: "1px solid var(--color-divider)",
                              background: "var(--color-bg)",
                              borderRadius: "var(--radius-md)",
                              color: "var(--color-neutral-700)",
                              fontSize: 13,
                              lineHeight: 1.6,
                            }}
                          >
                            {loadout.note}
                          </p>
                        )}

                        <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                          {loadout.strategies.map((strategy) => {
                            const entry = draft[strategy.agentId] ?? { instances: 0, markets: [] };
                            const runtime = RUNTIME_COPY[strategy.runtime.state];
                            const atStrategyMax = entry.instances >= strategy.maxInstances;
                            const atPlanCap = used >= limit;
                            const canAdd =
                              editable && strategy.entitled && !atStrategyMax && !atPlanCap;
                            return (
                              <div
                                key={strategy.agentId}
                                style={{
                                  padding: "14px 16px",
                                  border: "1px solid var(--color-divider)",
                                  borderRadius: "var(--radius-md)",
                                  background: entry.instances > 0 ? "var(--color-bg)" : "transparent",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    gap: 12,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div style={{ maxWidth: "52ch" }}>
                                    <strong>
                                      {strategy.emoji} {strategy.name}
                                    </strong>
                                    <div style={{ color: "var(--color-neutral-600)", fontSize: 12 }}>
                                      {strategy.description}
                                    </div>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: 8,
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        marginTop: 8,
                                      }}
                                    >
                                      {strategy.instances > 0 ? (
                                        <>
                                          <Tag
                                            value={`authorized ×${strategy.instances}`}
                                            good={false}
                                          />
                                          <Tag value={runtime.label} good={runtime.good} />
                                          <span
                                            style={{ color: "var(--color-neutral-600)", fontSize: 11 }}
                                          >
                                            {runtime.detail}
                                            {strategy.runtime.state === "blocked" && strategy.runtime.reason
                                              ? ` (${strategy.runtime.reason.replaceAll("_", " ")})`
                                              : ""}
                                          </span>
                                        </>
                                      ) : !strategy.entitled ? (
                                        <span
                                          style={{ color: "var(--color-neutral-600)", fontSize: 12 }}
                                        >
                                          Not included in your plan or purchases.{" "}
                                          <Link
                                            href={`/store/${strategy.agentId}`}
                                            style={{ color: "var(--color-accent)" }}
                                          >
                                            View in store
                                          </Link>
                                        </span>
                                      ) : (
                                        <span
                                          style={{ color: "var(--color-neutral-600)", fontSize: 12 }}
                                        >
                                          Available — not in your loadout.
                                        </span>
                                      )}
                                    </div>
                                    {strategy.instances > 0 && !strategy.entitled && (
                                      <div style={{ color: "#e7d991", fontSize: 12, marginTop: 6 }}>
                                        Your access to this strategy is no longer active. It stays in
                                        your loadout until you remove it, but your workspace will not
                                        install it.
                                      </div>
                                    )}
                                  </div>

                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button
                                      className="btn btn-secondary"
                                      style={{ minWidth: 44 }}
                                      disabled={!editable || entry.instances === 0}
                                      onClick={() =>
                                        setInstances(strategy, Math.max(0, entry.instances - 1))
                                      }
                                      aria-label={`Remove one ${strategy.name}`}
                                    >
                                      −
                                    </button>
                                    <span
                                      style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 18,
                                        minWidth: 22,
                                        textAlign: "center",
                                      }}
                                    >
                                      {entry.instances}
                                    </span>
                                    <button
                                      className="btn btn-primary"
                                      style={{ minWidth: 44 }}
                                      disabled={!canAdd}
                                      onClick={() => setInstances(strategy, entry.instances + 1)}
                                      aria-label={`Add one ${strategy.name}`}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                {editable && strategy.entitled && !canAdd && (
                                  <div
                                    style={{ color: "var(--color-neutral-600)", fontSize: 12, marginTop: 8 }}
                                  >
                                    {atStrategyMax
                                      ? strategy.maxInstances === 1
                                        ? "This agent coordinates the others, so only one can run."
                                        : `Limited to ${strategy.maxInstances} instances.`
                                      : loadout.nextPlan
                                        ? `You are at your plan's ${limit}-agent limit. ${loadout.nextPlan.name} runs up to ${loadout.nextPlan.agentLimit} for $${Math.round(loadout.nextPlan.priceCents / 100)} / mo.`
                                        : `You are at the platform maximum of ${loadout.capacity.platformMax} agents.`}
                                  </div>
                                )}

                                {entry.instances > 0 && strategy.tradesMarket && (
                                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                                    {entry.markets.map((market, index) => (
                                      <div
                                        key={index}
                                        style={{ display: "flex", alignItems: "center", gap: 10 }}
                                      >
                                        <span
                                          style={{
                                            color: "var(--color-neutral-600)",
                                            fontSize: 12,
                                            minWidth: 78,
                                          }}
                                        >
                                          Instance {index + 1}
                                        </span>
                                        <input
                                          style={{ ...field, maxWidth: 200 }}
                                          value={market}
                                          disabled={!editable}
                                          placeholder="Market, e.g. BTC"
                                          onChange={(e) =>
                                            setMarket(strategy.agentId, index, e.target.value)
                                          }
                                        />
                                      </div>
                                    ))}
                                    <div style={{ color: "var(--color-neutral-600)", fontSize: 11 }}>
                                      Hyperliquid perpetual ticker. Each instance of a strategy needs
                                      its own market — identical instances compete for the same signal
                                      on the same margin.
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {loadout.orphaned.length > 0 && (
                          <div style={{ marginTop: 18 }}>
                            <strong style={{ fontSize: 13 }}>No longer offered</strong>
                            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                              {loadout.orphaned.map((agent) => (
                                <div
                                  key={agent.agentId}
                                  style={{ fontSize: 13, color: "var(--color-neutral-600)" }}
                                >
                                  {agent.name} — authorized {fmt(agent.installedAt)}, no longer an
                                  installable strategy. Saving your loadout removes it.
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginTop: 18,
                            paddingTop: 16,
                            borderTop: "1px solid var(--color-divider)",
                          }}
                        >
                          <button
                            className="btn btn-primary"
                            disabled={!editable || !dirty || overCap}
                            onClick={saveLoadout}
                          >
                            {busy === "loadout" ? "Saving..." : "Save loadout"}
                          </button>
                          <button
                            className="btn btn-secondary"
                            disabled={!editable || !dirty}
                            onClick={() => setDraft(draftFrom(loadout.strategies))}
                          >
                            Discard changes
                          </button>
                          <span
                            style={{ color: "var(--color-neutral-600)", fontSize: 12, maxWidth: "56ch" }}
                          >
                            {loadout.capacityReady ? loadout.note : null}
                          </span>
                        </div>
                      </>
                    );
                  })()
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
