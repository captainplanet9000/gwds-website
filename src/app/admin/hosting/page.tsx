"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import HostingFleet, { AsOf, fleetCounts, useFleet } from "@/components/admin/HostingFleet";

// The operations endpoint intentionally aggregates several heterogeneous tables.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
type HostingData = {
  salesEnabled: boolean;
  stats: Record<string, number>;
  plans: Row[];
  subscriptions: Row[];
  onboarding: Row[];
  instances: Row[];
  tasks: Row[];
  incidents: Row[];
  usage: Row[];
  history: Row[];
  hosts: Row[];
};

// A paid-signup tenant whose provisioning failed AND will not fix itself automatically -- see
// public.hosting_provision_failures() (C:/GWDS/hosting/db/migrations/0018_hosting_provision_retry.sql).
// A failure still inside its automatic retry window never reaches this list; everything here is
// something only an operator can move forward.
type ProvisionAlert = {
  hosting_subscription_id: string;
  tenant_id: string;
  slug: string;
  command_id: string;
  error: string | null;
  error_code: string | null;
  finished_at: string | null;
  attempts: number;
  classification: "terminal" | "retries_exhausted";
  failing_step: string | null;
  failing_step_error: string | null;
};

const card: React.CSSProperties = {
  background: "#07100d",
  border: "1px solid #17352b",
  borderRadius: 12,
  padding: 20,
};
const input: React.CSSProperties = {
  width: "100%",
  background: "#030806",
  color: "#e5f7ef",
  border: "1px solid #21483b",
  borderRadius: 8,
  padding: "10px 12px",
};
const button: React.CSSProperties = {
  background: "#4ade9f",
  color: "#03110b",
  border: 0,
  borderRadius: 7,
  padding: "9px 12px",
  fontWeight: 800,
  cursor: "pointer",
};
const secondary: React.CSSProperties = {
  ...button,
  background: "#10251e",
  color: "#a7f3d0",
  border: "1px solid #245443",
};

function Badge({ value }: { value: string }) {
  const good = [
    "active",
    "healthy",
    "completed",
    "complete",
    "approved",
    "resolved",
    "trialing",
    "enabled",
  ].includes(value);
  const bad = [
    "failed",
    "unreachable",
    "critical",
    "invalid",
    "decommissioned",
    "canceled",
    "unpaid",
    "disabled",
  ].includes(value);
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        background: good ? "#0e3b2b" : bad ? "#441b22" : "#25291f",
        color: good ? "#6ee7b7" : bad ? "#fda4af" : "#d9d59b",
      }}
    >
      {value || "unknown"}
    </span>
  );
}

export default function HostingOperationsPage() {
  const [data, setData] = useState<HostingData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [tab, setTab] = useState("overview");
  const [selectedId, setSelectedId] = useState("");
  const [instanceForm, setInstanceForm] = useState<Record<string, string>>({});
  const [incident, setIncident] = useState({
    title: "",
    description: "",
    severity: "minor",
  });
  // Loaded separately from `data` -- this comes from the REAL fleet control plane
  // (C:/GWDS/hosting, control.tenant_commands) via /api/admin/hosting/provision-alerts, a
  // different data source than the /api/admin/hosting aggregate above. `null` means "not loaded
  // yet" (never render a confident "0" badge before the first fetch resolves); an empty array
  // means "loaded, and there is genuinely nothing needing attention".
  const [alerts, setAlerts] = useState<ProvisionAlert[] | null>(null);
  const [alertsError, setAlertsError] = useState("");
  // THE REAL FLEET -- control.tenants, polled on its own interval with its own as-of stamp. A
  // third data source, distinct from both `data` (the storefront's hosting product) and `alerts`.
  // Held here rather than inside <HostingFleet> so the Overview and the Instances tab read the
  // SAME poll: two independent polls of the same table would let the two tabs disagree about the
  // fleet, and an operator would have no way to tell which one was older.
  const fleet = useFleet();

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/hosting", { cache: "no-store" });
    if (response.status === 401) {
      window.location.replace("/admin");
      return;
    }
    const body = await response.json();
    if (!response.ok)
      throw new Error(body.error || "Hosting operations could not be loaded");
    setData(body);
    setSelectedId((current) => current || body.instances?.[0]?.id || "");
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/hosting/provision-alerts", { cache: "no-store" });
      if (response.status === 401) return; // the main load() above already redirects on 401
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Provisioning alerts could not be loaded");
      setAlerts(body.alerts || []);
      setAlertsError("");
    } catch (reason) {
      // Deliberately does NOT clear a previously-loaded alert count on a transient fetch error --
      // an operator should never see a real alert count silently drop to zero because one poll
      // failed. The banner below still surfaces the fetch error itself.
      setAlertsError(reason instanceof Error ? reason.message : "Provisioning alerts could not be loaded");
    }
  }, []);

  useEffect(() => {
    load().catch((reason) => setError(reason.message));
    loadAlerts();
  }, [load, loadAlerts]);

  const mutate = async (key: string, payload: Record<string, unknown>) => {
    setBusy(key);
    setError("");
    try {
      const response = await fetch("/api/admin/hosting", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Operation failed");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Operation failed");
    } finally {
      setBusy("");
    }
  };

  // Re-enqueues 'provision' right now, through the SAME control-plane command route the tenant
  // detail view already uses (src/app/api/admin/hosting/tenants/[slug]/command) -- this button is
  // not a new code path, only a shortcut into the existing one that also re-attaches the
  // customer's verified wallet address when one exists (see that route's own comment on
  // custody-6). It bypasses the automatic sweep's backoff timer entirely, which is the point of a
  // manual retry: an operator who just fixed the named cause (installed the firewall rule,
  // confirmed the wallet is verified) should not wait for the next scheduled sweep.
  const retryProvisioning = async (alert: ProvisionAlert) => {
    const key = `retry-provision-${alert.tenant_id}`;
    setBusy(key);
    setAlertsError("");
    try {
      const response = await fetch(`/api/admin/hosting/tenants/${alert.slug}/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "provision" }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Retry could not be enqueued");
      await loadAlerts();
    } catch (reason) {
      setAlertsError(reason instanceof Error ? reason.message : "Retry could not be enqueued");
    } finally {
      setBusy("");
    }
  };

  const selected = useMemo(
    () => data?.instances.find((row) => row.id === selectedId),
    [data, selectedId],
  );
  const fleetSummary = useMemo(() => fleetCounts(fleet.tenants), [fleet.tenants]);
  const subscriptionFor = (id: string) =>
    data?.subscriptions.find((row) => row.id === id);

  if (!data)
    return (
      <div style={{ color: "#789488" }}>
        {error || "Loading hosting operations..."}
      </div>
    );

  const tabs = [
    "overview",
    "customers",
    "onboarding",
    "instances",
    "tasks",
    "provisioning",
    "incidents",
    "plans",
    "audit",
  ];
  const alertCount = alerts?.length ?? 0;
  return (
    <div style={{ color: "#e5f7ef" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              color: "#4ade9f",
              fontSize: 11,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              fontWeight: 800,
            }}
          >
            Managed service control plane
          </div>
          <h1 style={{ margin: "8px 0 4px", fontSize: 30 }}>
            Hosting Operations
          </h1>
          <p style={{ color: "#789488", margin: 0 }}>
            Billing, onboarding, provisioning, runtime health,
            recovery, incidents and teardown.
          </p>
        </div>
        <Badge value={data.salesEnabled ? "sales enabled" : "sales disabled"} />
      </div>

      {alertCount > 0 && (
        // "Payment succeeded, provisioning failed" must be impossible to miss -- see the
        // component brief. A tab badge alone can be scrolled past unopened; this banner sits
        // above the fold on every tab, the same way the sales-gate banner below it does, and
        // names the count and where to act on it rather than making the operator go find out.
        <div
          role="alert"
          style={{
            ...card,
            borderColor: "#7f1d1d",
            background: "#2a0f12",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong style={{ color: "#fda4af" }}>
              {alertCount} paid customer{alertCount === 1 ? "" : "s"} charged with provisioning
              stuck.
            </strong>
            <p style={{ color: "#f3b4bb", margin: "6px 0 0", lineHeight: 1.5 }}>
              Automatic retry has either given up (config problem — needs a fix) or run out of
              attempts. Nobody is retrying these on their own any more.
            </p>
          </div>
          <button style={button} onClick={() => setTab("provisioning")}>
            Review now
          </button>
        </div>
      )}
      {alertsError && (
        <div style={{ ...card, borderColor: "#7f1d1d", color: "#fecaca", marginBottom: 18 }}>
          Provisioning alerts: {alertsError}
        </div>
      )}
      {!data.salesEnabled && (
        <div
          style={{
            ...card,
            borderColor: "#806b22",
            background: "#1c1808",
            marginBottom: 20,
          }}
        >
          <strong style={{ color: "#fde68a" }}>
            Production activation gate is closed.
          </strong>
          <p style={{ color: "#cbbf8c", margin: "7px 0 0", lineHeight: 1.5 }}>
            Plans and operations can be configured, but checkout remains blocked
            by <code>NEXT_PUBLIC_HOSTING_SALES_ENABLED=false</code>. A plan gate
            alone cannot begin charging.
          </p>
        </div>
      )}
      {error && (
        <div
          style={{
            ...card,
            borderColor: "#7f1d1d",
            color: "#fecaca",
            marginBottom: 18,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 7,
          overflowX: "auto",
          marginBottom: 20,
          paddingBottom: 4,
        }}
      >
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={tab === item ? button : secondary}
          >
            {item[0].toUpperCase() + item.slice(1)}
            {item === "provisioning" && alertCount > 0 && (
              <span
                style={{
                  display: "inline-flex",
                  marginLeft: 7,
                  padding: "1px 7px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  background: "#7f1d1d",
                  color: "#fecaca",
                }}
              >
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* THE FLEET, COUNTED SEPARATELY AND ON PURPOSE. control.tenants is the list of real
              tenant processes; public.hosting_instances (every tile in the grid below) is the
              storefront's per-subscription service record. A tenant can run with no service
              record -- the owner's own tenants never had one -- and a service record can exist
              with no tenant. Adding them would produce a number that is true of nothing. */}
          <section style={{ ...card, marginBottom: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                flexWrap: "wrap",
                alignItems: "baseline",
              }}
            >
              <div>
                <h2 style={{ fontSize: 17, margin: 0 }}>Fleet — real tenant processes</h2>
                <p
                  style={{
                    color: "#789488",
                    margin: "6px 0 0",
                    fontSize: 13,
                    lineHeight: 1.5,
                    maxWidth: 760,
                  }}
                >
                  From <code>control.tenants</code> on the owner&apos;s host. The tiles below count{" "}
                  <strong>service records</strong> instead — the billing and onboarding paperwork for a
                  subscription — which is why they can read zero while a tenant is live. Neither number
                  substitutes for the other.
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <AsOf fetchedAt={fleet.fetchedAt} />
                <button style={secondary} onClick={() => setTab("instances")}>
                  Fleet control
                </button>
              </div>
            </div>
            {fleet.error && (
              <div style={{ color: "#fecaca", fontSize: 13, marginTop: 10 }}>
                Fleet: {fleet.error} — counts below are the last successful read.
              </div>
            )}
            <div className="admin-stat-grid-4" style={{ marginTop: 14 }}>
              {[
                ["Tenants", fleetSummary.total],
                ["Active tenants", fleetSummary.active],
                ["Processes running", fleetSummary.running],
                ["Trading halted", fleetSummary.halted],
                ["Need attention", fleetSummary.needsAttention],
              ].map(([label, value]) => {
                const isAlarm =
                  label === "Need attention" && fleetSummary.needsAttention > 0;
                return (
                  <div
                    key={label as string}
                    style={
                      isAlarm
                        ? { ...card, borderColor: "#7f1d1d", background: "#2a0f12" }
                        : card
                    }
                  >
                    <div style={{ color: isAlarm ? "#f3b4bb" : "#789488", fontSize: 12 }}>
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 850,
                        marginTop: 8,
                        color: isAlarm ? "#fda4af" : undefined,
                      }}
                    >
                      {/* "…" until the first read resolves -- the same rule the provisioning
                          alerts follow. A premature 0 here reads as "nothing is running". */}
                      {fleet.tenants === null ? "…" : value}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
          <div className="admin-stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              ["Active subscriptions", data.stats.activeSubscriptions],
              [
                "Monthly recurring",
                `$${((data.stats.recurringRevenueCents || 0) / 100).toFixed(2)}`,
              ],
              // SERVICE RECORDS (public.hosting_instances), not tenants -- see the fleet panel
              // above. These read 0 whenever the storefront's own provisioning worker has not
              // written a record, which is the normal state today because that pipeline is
              // disabled behind HOSTING_AUTOMATION_ENABLED; a real tenant running on the box has
              // never been counted here and never should be.
              ["Active service records", data.stats.activeInstances],
              ["Unhealthy service records", data.stats.unhealthyInstances],
              ["Onboarding queue", data.stats.onboardingQueue],
              ["Open tasks", data.stats.openTasks],
              ["Open incidents", data.stats.openIncidents],
              ["Hosts accepting signups", data.stats.acceptingHosts],
              ["Cloud slots available", data.stats.availableHostSlots],
              // From the CONTROL PLANE (control.tenant_commands via hosting_provision_failures()),
              // not the `data.stats` aggregate above -- see the `alerts` state's own comment. `null`
              // renders as "…" rather than a premature "0" while the first fetch is still in flight.
              ["Provisioning alerts", alerts === null ? "…" : alertCount],
              [
                "Plans launch-ready",
                data.plans.filter((p) => p.launch_ready).length,
              ],
            ].map(([label, value]) => {
              const isAlertTile = label === "Provisioning alerts" && alertCount > 0;
              return (
                <div
                  key={label as string}
                  style={isAlertTile ? { ...card, borderColor: "#7f1d1d", background: "#2a0f12" } : card}
                >
                  <div style={{ color: isAlertTile ? "#f3b4bb" : "#789488", fontSize: 12 }}>{label}</div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 850,
                      marginTop: 8,
                      color: isAlertTile ? "#fda4af" : undefined,
                    }}
                  >
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
          <section style={{ ...card, marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, marginTop: 0 }}>Host admission and placement</h2>
            <p style={{ color: "#a7bdb3", fontSize: 13 }}>
              New paid tenants are placed only on a registered host with admissions enabled and a
              free slot. A disabled host can keep serving existing tenants without accepting new ones.
            </p>
            <div className="admin-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: "#789488", fontSize: 12, textAlign: "left" }}>
                    <th style={{ padding: "9px 8px" }}>Host</th>
                    <th style={{ padding: "9px 8px" }}>Admissions</th>
                    <th style={{ padding: "9px 8px" }}>Assigned</th>
                    <th style={{ padding: "9px 8px" }}>Capacity</th>
                    <th style={{ padding: "9px 8px" }}>Free slots</th>
                    <th style={{ padding: "9px 8px" }}>Operator note</th>
                  </tr>
                </thead>
                <tbody>
                  {data.hosts.map((host) => (
                    <tr key={host.host} style={{ borderTop: "1px solid #17352b" }}>
                      <td style={{ padding: "11px 8px" }}><code>{host.host}</code></td>
                      <td style={{ padding: "11px 8px" }}>
                        <Badge value={host.admissions_enabled ? "enabled" : "disabled"} />
                      </td>
                      <td style={{ padding: "11px 8px" }}>{host.active_tenants}</td>
                      <td style={{ padding: "11px 8px" }}>{host.max_tenants}</td>
                      <td style={{ padding: "11px 8px" }}>{host.available_slots}</td>
                      <td style={{ padding: "11px 8px", color: "#789488" }}>{host.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="admin-stat-grid-2">
            <section style={card}>
              <h2 style={{ fontSize: 17, marginTop: 0 }}>Launch checklist</h2>
              <p style={{ color: "#a7bdb3", fontSize: 13 }}>
                Subscription reservations: {data.stats.reservedSubscriptions} / {data.stats.subscriptionCapacity}.
                This admission limit is separate from measured worker capacity.
              </p>
              {[
                ["Global sales switch", data.salesEnabled ? "passed" : "blocked"],
                ["Subscription capacity available", data.stats.reservedSubscriptions < data.stats.subscriptionCapacity ? "passed" : "blocked"],
                ["Cloud host capacity available", data.stats.acceptingHosts > 0 && data.stats.availableHostSlots > 0 ? "passed" : "blocked"],
                [
                  "At least one ready plan",
                  data.plans.some((p) => p.launch_ready) ? "passed" : "blocked",
                ],
                [
                  "No unhealthy service records",
                  data.stats.unhealthyInstances === 0 ? "passed" : "blocked",
                ],
                [
                  // The fleet's own gate, kept apart from the service-record row above it: a clean
                  // service-record count says nothing about a real tenant sitting behind a tripped
                  // restart breaker. "unknown" until the first fleet read resolves -- an unread
                  // fleet must never render as a pass.
                  "No fleet tenant needing attention",
                  fleet.tenants === null
                    ? "unknown"
                    : fleetSummary.needsAttention === 0
                      ? "passed"
                      : "blocked",
                ],
                [
                  "No critical incidents",
                  !data.incidents.some(
                    (i) => i.severity === "critical" && i.status !== "resolved",
                  )
                    ? "passed"
                    : "blocked",
                ],
              ].map(([label, badge]) => (
                <div
                  key={label as string}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "11px 0",
                    borderTop: "1px solid #17352b",
                  }}
                >
                  <span>{label}</span>
                  <Badge value={badge as string} />
                </div>
              ))}
            </section>
            <section style={card}>
              <h2 style={{ fontSize: 17, marginTop: 0 }}>Immediate queue</h2>
              {data.tasks
                .filter((t) =>
                  ["queued", "in_progress", "blocked", "failed"].includes(
                    t.status,
                  ),
                )
                .slice(0, 8)
                .map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: "10px 0",
                      borderTop: "1px solid #17352b",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>{task.task_type}</strong>
                      <Badge value={task.status} />
                    </div>
                    <div
                      style={{ color: "#789488", fontSize: 12, marginTop: 4 }}
                    >
                      {task.instance_id}
                    </div>
                  </div>
                ))}
              {!data.tasks.length && (
                <p style={{ color: "#789488" }}>No tasks yet.</p>
              )}
            </section>
          </div>
        </>
      )}

      {tab === "customers" && (
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Hosting customers and billing</h2>
          <div className="admin-table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Customer",
                    "Plan",
                    "Status",
                    "Amount",
                    "Period ends",
                    "Canceling",
                    "Created",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: 10,
                        color: "#789488",
                        fontSize: 11,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.map((row) => (
                  <tr key={row.id} style={{ borderTop: "1px solid #17352b" }}>
                    <td style={{ padding: 10 }}>
                      <div>{row.customer_email}</div>
                      <small style={{ color: "#789488" }}>
                        {row.id.slice(0, 8)}
                      </small>
                    </td>
                    <td style={{ padding: 10 }}>{row.plan_id}</td>
                    <td style={{ padding: 10 }}>
                      <Badge value={row.status} />
                    </td>
                    <td style={{ padding: 10 }}>
                      ${(row.price_cents / 100).toFixed(2)}/mo
                    </td>
                    <td style={{ padding: 10 }}>
                      {row.current_period_end
                        ? new Date(row.current_period_end).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ padding: 10 }}>
                      {row.cancel_at_period_end ? "Yes" : "No"}
                    </td>
                    <td style={{ padding: 10 }}>
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "onboarding" && (
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Onboarding review queue</h2>
          {data.onboarding.map((row) => {
            const sub = subscriptionFor(row.subscription_id);
            return (
              <div
                key={row.id}
                style={{
                  borderTop: "1px solid #17352b",
                  padding: "16px 0",
                  display: "grid",
                  gridTemplateColumns: "minmax(220px,1fr) 2fr auto",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{row.workspace_name || "Unnamed workspace"}</strong>
                  <div style={{ color: "#789488", fontSize: 12 }}>
                    {sub?.customer_email} · {sub?.plan_id}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#b6cbc2" }}>
                  {row.environment} · {row.region} · {row.risk_profile} ·{" "}
                  {row.requested_agents?.join(", ") || "no agents"}
                  <br />
                  {/* "not set", not "paper only": the environment this row actually carries is
                    * already printed on the line above, and on a live plan awaiting an address
                    * this fallback was asserting the opposite of it. */}
                  Address: {row.account_address || "not set"} · Max drawdown:{" "}
                  {row.max_drawdown_pct || "not set"}%
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <Badge value={row.status} />
                  <button
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`approve-${row.id}`, {
                        action: "update_onboarding",
                        onboardingId: row.id,
                        status: "approved",
                      })
                    }
                    style={button}
                  >
                    Approve
                  </button>
                  <button
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`block-${row.id}`, {
                        action: "update_onboarding",
                        onboardingId: row.id,
                        status: "blocked",
                        operatorNotes: "Operator follow-up required.",
                      })
                    }
                    style={secondary}
                  >
                    Block
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "instances" && (
        <>
          <HostingFleet fleet={fleet} />
          <h2 style={{ fontSize: 17, margin: "26px 0 4px" }}>
            Storefront service records
          </h2>
          <p
            style={{
              color: "#789488",
              margin: "0 0 14px",
              fontSize: 13,
              lineHeight: 1.5,
              maxWidth: 760,
            }}
          >
            <code>public.hosting_instances</code> — the billing, onboarding and provider references
            behind a subscription, and the activation checklist that gates them. Editing a record
            here changes paperwork; it never starts, stops or halts the tenant process above.
          </p>
          <div className="admin-stat-grid-2">
            <section style={card}>
              <h2 style={{ marginTop: 0 }}>Service records</h2>
              {data.instances.map((row) => (
                <button
                  key={row.id}
                  onClick={() => {
                    setSelectedId(row.id);
                    setInstanceForm({
                      deploymentUrl: row.deployment_url || "",
                      providerProjectId: row.provider_project_id || "",
                      providerDeploymentId: row.provider_deployment_id || "",
                      databaseRef: row.database_ref || "",
                      releaseVersion: row.release_version || "",
                    });
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: selectedId === row.id ? "#10251e" : "transparent",
                    color: "#e5f7ef",
                    border: 0,
                    borderTop: "1px solid #17352b",
                    padding: "14px 10px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <strong>{row.tenant_key}</strong>
                    <Badge value={row.status} />
                  </div>
                  <div style={{ color: "#789488", fontSize: 12, marginTop: 5 }}>
                    {subscriptionFor(row.subscription_id)?.customer_email} ·{" "}
                    {row.region} · health {row.health_status}
                  </div>
                </button>
              ))}
            </section>
            {selected && (
              <section style={card}>
                <h2 style={{ marginTop: 0 }}>Operate {selected.tenant_key}</h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {[
                    ["deploymentUrl", "Deployment URL"],
                    ["providerProjectId", "Vercel project ID"],
                    ["providerDeploymentId", "Deployment ID"],
                    ["databaseRef", "Tenant database reference"],
                    ["releaseVersion", "Release version"],
                  ].map(([key, label]) => (
                    <label key={key} style={{ fontSize: 12, color: "#789488" }}>
                      {label}
                      <input
                        style={{ ...input, marginTop: 5 }}
                        value={
                          instanceForm[key] ??
                          (selected[
                            {
                              deploymentUrl: "deployment_url",
                              providerProjectId: "provider_project_id",
                              providerDeploymentId: "provider_deployment_id",
                              databaseRef: "database_ref",
                              releaseVersion: "release_version",
                            }[key] || key
                          ] ||
                            "")
                        }
                        onChange={(event) =>
                          setInstanceForm((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  <button
                    style={button}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`save-${selected.id}`, {
                        action: "update_instance",
                        instanceId: selected.id,
                        ...instanceForm,
                      })
                    }
                  >
                    Save references
                  </button>
                  <button
                    style={secondary}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`health-${selected.id}`, {
                        action: "update_instance",
                        instanceId: selected.id,
                        status: "provisioning",
                        healthStatus: "healthy",
                        markHeartbeat: true,
                      })
                    }
                  >
                    Healthy heartbeat
                  </button>
                  <button
                    style={secondary}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`backup-${selected.id}`, {
                        action: "update_instance",
                        instanceId: selected.id,
                        backupStatus: "healthy",
                        markBackup: true,
                      })
                    }
                  >
                    Backup passed
                  </button>
                  <button
                    style={secondary}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`recovery-${selected.id}`, {
                        action: "update_instance",
                        instanceId: selected.id,
                        markRecoveryTest: true,
                      })
                    }
                  >
                    Recovery passed
                  </button>
                  <button
                    style={button}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`activate-${selected.id}`, {
                        action: "update_instance",
                        instanceId: selected.id,
                        ...instanceForm,
                        status: "active",
                        healthStatus: "healthy",
                        backupStatus: "healthy",
                      })
                    }
                  >
                    Activate tenant
                  </button>
                  <button
                    style={{ ...secondary, color: "#fda4af" }}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`suspend-${selected.id}`, {
                        action: "update_instance",
                        instanceId: selected.id,
                        status: "suspended",
                      })
                    }
                  >
                    Suspend
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 16,
                    color: "#789488",
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  Activation is refused unless billing is active, onboarding is
                  approved, provider/database/release references exist, runtime
                  and backups are healthy, and a recovery test is recorded.
                </div>
              </section>
            )}
          </div>
        </>
      )}

      {tab === "tasks" && (
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Provisioning and operations queue</h2>
          {data.tasks.map((task) => (
            <div
              key={task.id}
              style={{
                borderTop: "1px solid #17352b",
                padding: "14px 0",
                display: "grid",
                gridTemplateColumns: "1fr 150px auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <strong>{task.task_type}</strong>
                <div style={{ color: "#789488", fontSize: 12 }}>
                  {task.instance_id} · priority {task.priority} · attempt{" "}
                  {task.attempts}
                </div>
                {task.last_error && (
                  <div style={{ color: "#fda4af", fontSize: 12 }}>
                    {task.last_error}
                  </div>
                )}
              </div>
              <Badge value={task.status} />
              <div style={{ display: "flex", gap: 7 }}>
                <button
                  style={secondary}
                  disabled={!!busy}
                  onClick={() =>
                    mutate(`start-${task.id}`, {
                      action: "update_task",
                      taskId: task.id,
                      status: "in_progress",
                      assignedTo: "Cival Ops",
                    })
                  }
                >
                  Start
                </button>
                <button
                  style={button}
                  disabled={!!busy}
                  onClick={() =>
                    mutate(`done-${task.id}`, {
                      action: "update_task",
                      taskId: task.id,
                      status: "completed",
                    })
                  }
                >
                  Complete
                </button>
                <button
                  style={{ ...secondary, color: "#fda4af" }}
                  disabled={!!busy}
                  onClick={() =>
                    mutate(`fail-${task.id}`, {
                      action: "update_task",
                      taskId: task.id,
                      status: "failed",
                      lastError: "Manual review required.",
                    })
                  }
                >
                  Fail
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "provisioning" && (
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Provisioning alerts</h2>
          <p style={{ color: "#789488", marginTop: -6 }}>
            Paid-signup tenants (C:/GWDS/hosting control plane) whose provisioning failed and will
            not retry itself. <strong>Terminal</strong> means the failure names a specific,
            considered cause (a config or safety refusal) that a retry cannot fix on its own —
            resolve the cause first. <strong>Retries exhausted</strong> means it looked like an
            ordinary, one-off failure and the system tried again on a backoff schedule several
            times on its own, but it kept failing anyway.
          </p>
          {alerts === null && !alertsError && (
            <p style={{ color: "#789488" }}>Loading…</p>
          )}
          {alerts !== null && alerts.length === 0 && (
            <p style={{ color: "#789488" }}>Nothing needs attention right now.</p>
          )}
          {(alerts || []).map((alert) => (
            <div
              key={alert.command_id}
              style={{
                borderTop: "1px solid #17352b",
                padding: "16px 0",
                display: "grid",
                gridTemplateColumns: "minmax(220px,1fr) 2fr auto",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <strong>{alert.slug}</strong>
                <div style={{ color: "#789488", fontSize: 12, marginTop: 4 }}>
                  {alert.attempts} attempt{alert.attempts === 1 ? "" : "s"}
                  {alert.finished_at
                    ? ` · last failed ${new Date(alert.finished_at).toLocaleString()}`
                    : ""}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#b6cbc2" }}>
                {alert.failing_step && (
                  <div style={{ marginBottom: 4 }}>
                    Failed step: <code>{alert.failing_step}</code>
                  </div>
                )}
                <div>{alert.error || alert.failing_step_error || "No error text recorded."}</div>
                {alert.error_code && (
                  <div style={{ color: "#789488", fontSize: 11, marginTop: 4 }}>
                    code: {alert.error_code}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "4px 8px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    background: "#441b22",
                    color: "#fda4af",
                  }}
                >
                  {alert.classification === "terminal" ? "terminal — needs a fix" : "retries exhausted"}
                </span>
                <button
                  style={secondary}
                  disabled={!!busy}
                  onClick={() => retryProvisioning(alert)}
                >
                  Retry now
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "incidents" && (
        <div className="admin-stat-grid-2">
          <section style={card}>
            <h2 style={{ marginTop: 0 }}>Open an incident</h2>
            <label style={{ color: "#789488", fontSize: 12 }}>
              Instance
              <select
                style={{ ...input, marginTop: 5, marginBottom: 10 }}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {data.instances.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.tenant_key}
                  </option>
                ))}
              </select>
            </label>
            <input
              style={{ ...input, marginBottom: 10 }}
              placeholder="Incident title"
              value={incident.title}
              onChange={(e) =>
                setIncident({ ...incident, title: e.target.value })
              }
            />
            <textarea
              style={{ ...input, minHeight: 110, marginBottom: 10 }}
              placeholder="Customer-safe status and operator details"
              value={incident.description}
              onChange={(e) =>
                setIncident({ ...incident, description: e.target.value })
              }
            />
            <select
              style={{ ...input, marginBottom: 12 }}
              value={incident.severity}
              onChange={(e) =>
                setIncident({ ...incident, severity: e.target.value })
              }
            >
              {["info", "minor", "major", "critical"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <button
              style={button}
              disabled={!selectedId || !!busy}
              onClick={() =>
                mutate("incident-create", {
                  action: "upsert_incident",
                  instanceId: selectedId,
                  ...incident,
                  customerVisible: true,
                })
              }
            >
              Publish incident
            </button>
          </section>
          <section style={card}>
            <h2 style={{ marginTop: 0 }}>Incident history</h2>
            {data.incidents.map((row) => (
              <div
                key={row.id}
                style={{ padding: "12px 0", borderTop: "1px solid #17352b" }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <strong>{row.title}</strong>
                  <span>
                    <Badge value={row.severity} /> <Badge value={row.status} />
                  </span>
                </div>
                <p style={{ color: "#9bb3a9", fontSize: 13 }}>
                  {row.description}
                </p>
                {row.status !== "resolved" && (
                  <button
                    style={secondary}
                    disabled={!!busy}
                    onClick={() =>
                      mutate(`resolve-${row.id}`, {
                        action: "upsert_incident",
                        incidentId: row.id,
                        instanceId: row.instance_id,
                        title: row.title,
                        description: row.description,
                        severity: row.severity,
                        status: "resolved",
                        customerVisible: row.customer_visible,
                      })
                    }
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === "plans" && (
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Plan launch gates</h2>
          <p style={{ color: "#789488" }}>
            A launch-ready plan still cannot charge while the global production
            switch is off.
          </p>
          {data.plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                padding: "14px 0",
                borderTop: "1px solid #17352b",
                display: "grid",
                gridTemplateColumns: "1fr 150px 160px auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <strong>{plan.name}</strong>
                <div style={{ color: "#789488", fontSize: 12 }}>
                  {plan.description}
                </div>
              </div>
              <div>
                ${(plan.price_cents / 100).toFixed(2)} / {plan.billing_interval}
              </div>
              <div>
                <Badge value={plan.launch_ready ? "launch ready" : "blocked"} />
              </div>
              <button
                style={plan.launch_ready ? secondary : button}
                disabled={!!busy}
                onClick={() =>
                  mutate(`plan-${plan.id}`, {
                    action: "update_plan",
                    planId: plan.id,
                    launchReady: !plan.launch_ready,
                  })
                }
              >
                {plan.launch_ready ? "Close gate" : "Open gate"}
              </button>
            </div>
          ))}
        </section>
      )}

      {tab === "audit" && (
        <section style={card}>
          <h2 style={{ marginTop: 0 }}>Immutable operations trail</h2>
          {data.history.map((row) => (
            <div
              key={row.id}
              style={{
                display: "grid",
                gridTemplateColumns: "170px 90px 1fr",
                gap: 12,
                padding: "10px 0",
                borderTop: "1px solid #17352b",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#789488" }}>
                {new Date(row.created_at).toLocaleString()}
              </span>
              <Badge value={row.actor_type} />
              <span>
                <strong>{row.action}</strong> ·{" "}
                {row.instance_id || row.subscription_id || "global"}{" "}
                {Object.keys(row.metadata || {}).length
                  ? `· ${JSON.stringify(row.metadata)}`
                  : ""}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
