"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
type Host = {
  host: string;
  observed_at: string;
  metrics: {
    cpuCount: number;
    loadAverage: number[];
    memoryTotalMb: number;
    memoryAvailableMb: number;
    memoryUsedPercent: number;
    diskTotalGb: number;
    diskFreeGb: number;
    diskUsedPercent: number;
    services: Record<string, string>;
    containers: { name: string; state: string; status: string }[];
    backup: Record<string, string>;
  };
};
const panel = {
  padding: 22,
  border: "1px solid var(--admin-border)",
  borderRadius: 12,
  background: "var(--admin-surface)",
  marginBottom: 20,
};
export default function ServersPage() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [error, setError] = useState("");
  const [asOf, setAsOf] = useState("");
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(0);
  const load = useCallback(async () => {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/servers", { cache: "no-store" });
      const b = await r.json();
      if (!r.ok) throw Error(b.error || "Server data unavailable");
      setHosts(b.hosts);
      setAsOf(b.asOf);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Server data unavailable");
    } finally {
      setBusy(false);
      setClock(Date.now());
    }
  }, []);
  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 30000);
    return () => clearInterval(timer);
  }, [load]);
  return (
    <div>
      <h1 style={{ fontSize: 30 }}>Servers &amp; recovery</h1>
      <p>
        Measured AWS host status, collected every minute. This page refreshes
        every 30 seconds. Stale or failed collection is never shown as healthy.
      </p>
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0" }}
      >
        <button
          onClick={() => void load()}
          disabled={busy}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid var(--admin-border)",
            background: "var(--admin-surface)",
            color: "var(--admin-text)",
            cursor: "pointer",
          }}
        >
          {busy ? "Refreshing…" : "Refresh telemetry"}
        </button>
        <Link href="/admin/hosting">Tenant controls &amp; incidents</Link>
        <Link href="/admin/audit">Business audit log</Link>
      </div>
      {error && (
        <p role="alert" style={{ color: "#fda4af" }}>
          {error} Previously loaded data may be stale.
        </p>
      )}
      <p style={{ fontSize: 13 }}>
        Last successful fetch:{" "}
        {asOf ? new Date(asOf).toLocaleString() : "Not yet loaded"}
      </p>
      {!error && asOf && !hosts.length && (
        <p role="status">
          No host has reported telemetry. Install the collector before accepting
          customers.
        </p>
      )}
      {hosts.map((h) => {
        const age = clock - Date.parse(h.observed_at);
        const stale = !Number.isFinite(age) || age < -60000 || age > 180000;
        const m = h.metrics;
        const failed = Object.entries(m.services).filter(
          ([, v]) => v !== "active",
        );
        const containerFailures = m.containers.filter(
          (c) => c.state !== "running" || c.status.includes("(unhealthy)"),
        );
        const backupAt = Date.parse(m.backup.ExecMainExitTimestamp || "");
        const backupWarning =
          m.backup.Result !== "success" ||
          !Number.isFinite(backupAt) ||
          clock - backupAt > 36 * 60 * 60 * 1000;
        return (
          <section key={h.host} style={panel}>
            <h2 style={{ fontSize: 22 }}>{h.host}</h2>
            <p
              style={{ color: stale || failed.length ? "#fda4af" : "#6ee7b7" }}
            >
              {stale
                ? "Telemetry stale — investigate collector"
                : failed.length
                  ? "Service attention required"
                  : "Services reporting active"}{" "}
              · observed {new Date(h.observed_at).toLocaleString()}
            </p>
            <div className="admin-stat-grid-4">
              {[
                ["Memory used", m.memoryUsedPercent + "%"],
                ["Memory available", m.memoryAvailableMb + " MB"],
                ["Disk used", m.diskUsedPercent + "%"],
                ["Disk free", m.diskFreeGb + " GB"],
              ].map(([k, v]) => (
                <div key={k} style={panel}>
                  <div>{k}</div>
                  <strong style={{ fontSize: 24 }}>{v}</strong>
                </div>
              ))}
            </div>
            {(m.memoryUsedPercent >= 85 || m.diskUsedPercent >= 80) && (
              <p role="alert" style={{ color: "#fda4af" }}>
                Resource pressure: review capacity before accepting more
                tenants.
              </p>
            )}
            {containerFailures.length > 0 && (
              <p role="alert" style={{ color: "#fda4af" }}>
                Containers need attention:{" "}
                {containerFailures.map((c) => c.name).join(", ")}.
              </p>
            )}
            {backupWarning && (
              <p role="alert" style={{ color: "#fda4af" }}>
                Backup failed, is older than 36 hours, or has no verified
                completion timestamp.
              </p>
            )}
            <p>
              CPU cores: {m.cpuCount} · Load averages (1 / 5 / 15 minutes):{" "}
              {m.loadAverage.map((v) => v.toFixed(2)).join(" / ")}
            </p>
            <div className="admin-stat-grid-2">
              <div>
                <h3 style={{ fontSize: 18 }}>Services</h3>
                {Object.entries(m.services).map(([name, state]) => (
                  <p key={name} style={{ overflowWrap: "anywhere" }}>
                    <code>{name}</code>: <strong>{state}</strong>
                  </p>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 18 }}>Backup job</h3>
                <p>
                  Last result: {m.backup.Result || "Unknown"} · exit code:{" "}
                  {m.backup.ExecMainStatus || "Unknown"}
                </p>
                <p>
                  Last completion:{" "}
                  {m.backup.ExecMainExitTimestamp || "Not reported"}
                </p>
                <p>
                  A successful backup job does not verify off-host storage or a
                  successful restore. Review the recovery runbook before a
                  release.
                </p>
              </div>
            </div>
            <h3 style={{ fontSize: 18 }}>Containers</h3>
            <div className="admin-table-wrap">
              <table style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>State</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {m.containers.map((c) => (
                    <tr key={c.name}>
                      <td style={{ padding: 10 }}>{c.name}</td>
                      <td>{c.state}</td>
                      <td>{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      <section style={panel}>
        <h2 style={{ fontSize: 22 }}>Infrastructure consoles</h2>
        <p>
          Open the provider console using your AWS or Vercel account. Server
          shell access and infrastructure changes require the provider’s
          permissions; credentials are never embedded in this page.
        </p>
        <div className="admin-link-grid">
          {[
            [
              "AWS Lightsail: server, browser SSH and snapshots",
              "https://lightsail.aws.amazon.com/ls/webapp/home/instances",
            ],
            [
              "AWS Session Manager: managed shell sessions",
              "https://us-east-2.console.aws.amazon.com/systems-manager/session-manager?region=us-east-2",
            ],
            [
              "CloudWatch: metrics and alarms",
              "https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#alarmsV2:",
            ],
            [
              "Vercel: deployments and application logs",
              "https://vercel.com/civals-projects/cival-systems-store",
            ],
          ].map(([title, url]) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...panel, color: "var(--admin-text)" }}
            >
              {title} ↗
            </a>
          ))}
        </div>
      </section>
      <section style={panel}>
        <h2 style={{ fontSize: 22 }}>Operator workflow</h2>
        <ol style={{ lineHeight: 1.9 }}>
          <li>
            Check telemetry freshness, services, containers and available host
            slots before accepting new customers.
          </li>
          <li>
            Use Hosting Ops for tenant commands and inspect their recorded
            completion. Queued is not completed.
          </li>
          <li>
            Open a customer-visible incident when service is impaired. Use AWS
            alarms for out-of-band notification.
          </li>
          <li>
            Before maintenance, preserve backups and record open positions. A
            process stop is not a position close.
          </li>
          <li>
            After recovery, reconcile venue state, verify the tenant heartbeat
            and review the audit log.
          </li>
        </ol>
      </section>
    </div>
  );
}
