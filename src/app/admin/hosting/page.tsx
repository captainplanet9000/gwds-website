"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
  ].includes(value);
  const bad = [
    "failed",
    "unreachable",
    "critical",
    "invalid",
    "decommissioned",
    "canceled",
    "unpaid",
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

  useEffect(() => {
    load().catch((reason) => setError(reason.message));
  }, [load]);

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

  const selected = useMemo(
    () => data?.instances.find((row) => row.id === selectedId),
    [data, selectedId],
  );
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
    "incidents",
    "plans",
    "audit",
  ];
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
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="admin-stat-grid-4" style={{ marginBottom: 18 }}>
            {[
              ["Active subscriptions", data.stats.activeSubscriptions],
              [
                "Monthly recurring",
                `$${((data.stats.recurringRevenueCents || 0) / 100).toFixed(2)}`,
              ],
              ["Active instances", data.stats.activeInstances],
              ["Unhealthy instances", data.stats.unhealthyInstances],
              ["Onboarding queue", data.stats.onboardingQueue],
              ["Open tasks", data.stats.openTasks],
              ["Open incidents", data.stats.openIncidents],
              [
                "Plans launch-ready",
                data.plans.filter((p) => p.launch_ready).length,
              ],
            ].map(([label, value]) => (
              <div key={label as string} style={card}>
                <div style={{ color: "#789488", fontSize: 12 }}>{label}</div>
                <div style={{ fontSize: 26, fontWeight: 850, marginTop: 8 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="admin-stat-grid-2">
            <section style={card}>
              <h2 style={{ fontSize: 17, marginTop: 0 }}>Launch checklist</h2>
              {[
                ["Global sales switch", data.salesEnabled],
                [
                  "At least one ready plan",
                  data.plans.some((p) => p.launch_ready),
                ],
                ["No unhealthy runtimes", data.stats.unhealthyInstances === 0],
                [
                  "No critical incidents",
                  !data.incidents.some(
                    (i) => i.severity === "critical" && i.status !== "resolved",
                  ),
                ],
              ].map(([label, ok]) => (
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
                  <Badge value={ok ? "passed" : "blocked"} />
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
                  Address: {row.account_address || "paper only"} · Max drawdown:{" "}
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
        <div className="admin-stat-grid-2">
          <section style={card}>
            <h2 style={{ marginTop: 0 }}>Tenant instances</h2>
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
