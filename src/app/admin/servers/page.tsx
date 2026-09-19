"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Progress,
  Space,
  Statistic,
  Table,
  Tag,
  Tabs,
} from "antd";
import { ReloadOutlined, ExportOutlined } from "@ant-design/icons";
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
    <>
      <div className="admin-page-heading">
        <div>
          <h1>Servers & recovery</h1>
          <p>Host health, services and backups. Metrics update every minute.</p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void load()}
          loading={busy}
        >
          Refresh
        </Button>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          title="Telemetry unavailable"
          description={error + " Previously loaded data may be stale."}
          style={{ marginBottom: 20 }}
        />
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <span className="admin-muted">
          Updated {asOf ? new Date(asOf).toLocaleString() : "—"}
        </span>
        <Space>
          <Link href="/admin/hosting">Hosting operations</Link>
          <Link href="/admin/audit">Audit log</Link>
        </Space>
      </div>
      {!error && asOf && !hosts.length && (
        <Alert
          type="warning"
          title="No host telemetry received"
          description="Check the host collector before accepting customers."
        />
      )}
      {hosts.map((h) => {
        const m = h.metrics,
          age = clock - Date.parse(h.observed_at),
          stale = !Number.isFinite(age) || age < -60000 || age > 180000,
          failed = Object.values(m.services).some((s) => s !== "active"),
          containerFailures = m.containers.some(
            (c) => c.state !== "running" || c.status.includes("(unhealthy)"),
          ),
          backupAt = Date.parse(m.backup.ExecMainExitTimestamp || ""),
          backupWarning =
            m.backup.Result !== "success" ||
            !Number.isFinite(backupAt) ||
            clock - backupAt > 36 * 60 * 60 * 1000;
        return (
          <div key={h.host}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <h2 style={{ margin: 0 }}>{h.host}</h2>
              <Tag
                color={
                  stale || failed || containerFailures ? "warning" : "success"
                }
              >
                {stale
                  ? "Stale telemetry"
                  : failed || containerFailures
                    ? "Needs attention"
                    : "Services active"}
              </Tag>
              <span className="admin-muted">
                Observed {new Date(h.observed_at).toLocaleTimeString()}
              </span>
            </div>
            <section className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
              <Card>
                <Statistic
                  title="Memory used"
                  value={m.memoryUsedPercent}
                  suffix="%"
                />
                <Progress
                  percent={m.memoryUsedPercent}
                  showInfo={false}
                  strokeColor={
                    m.memoryUsedPercent >= 85 ? "#b45309" : "#5676a8"
                  }
                  size="small"
                />
                <span className="admin-muted">
                  {m.memoryAvailableMb.toLocaleString()} MB available
                </span>
              </Card>
              <Card>
                <Statistic
                  title="Disk used"
                  value={m.diskUsedPercent}
                  suffix="%"
                />
                <Progress
                  percent={m.diskUsedPercent}
                  showInfo={false}
                  strokeColor={m.diskUsedPercent >= 80 ? "#b45309" : "#5676a8"}
                  size="small"
                />
                <span className="admin-muted">{m.diskFreeGb} GB available</span>
              </Card>
              <Card>
                <Statistic
                  title="CPU load · 1 minute"
                  value={m.loadAverage[0]}
                  precision={2}
                />
                <p className="admin-muted">{m.cpuCount} CPU cores</p>
              </Card>
              <Card>
                <Statistic
                  title="Load · 5 / 15 minutes"
                  value={m.loadAverage
                    .slice(1)
                    .map((v) => v.toFixed(2))
                    .join(" / ")}
                />
                <p className="admin-muted">System load averages</p>
              </Card>
            </section>
            {(m.memoryUsedPercent >= 85 || m.diskUsedPercent >= 80) && (
              <Alert
                type="warning"
                showIcon
                title="Resource pressure"
                description="Review host capacity before accepting more workspaces."
                style={{ marginBottom: 20 }}
              />
            )}
            <Card
              styles={{ body: { padding: "0 24px 24px" } }}
              style={{ marginBottom: 24 }}
            >
              <Tabs
                items={[
                  {
                    key: "services",
                    label: "Services",
                    children: (
                      <Table
                        rowKey="name"
                        pagination={false}
                        dataSource={Object.entries(m.services).map(
                          ([name, state]) => ({ name, state }),
                        )}
                        columns={[
                          {
                            title: "Service",
                            dataIndex: "name",
                            render: (v) => (
                              <span className="admin-code">{v}</span>
                            ),
                          },
                          {
                            title: "Status",
                            dataIndex: "state",
                            width: 150,
                            render: (v) => (
                              <Tag color={v === "active" ? "success" : "error"}>
                                {v}
                              </Tag>
                            ),
                          },
                        ]}
                        scroll={{ x: 520 }}
                      />
                    ),
                  },
                  {
                    key: "containers",
                    label: `Containers (${m.containers.length})`,
                    children: (
                      <Table
                        rowKey="name"
                        pagination={false}
                        dataSource={m.containers}
                        columns={[
                          {
                            title: "Container",
                            dataIndex: "name",
                            width: 480,
                            render: (v) => (
                              <span className="admin-code">{v}</span>
                            ),
                          },
                          {
                            title: "State",
                            dataIndex: "state",
                            width: 130,
                            render: (v) => (
                              <Tag
                                color={v === "running" ? "success" : "warning"}
                              >
                                {v}
                              </Tag>
                            ),
                          },
                          {
                            title: "Health & uptime",
                            dataIndex: "status",
                            width: 260,
                          },
                        ]}
                        scroll={{ x: 870 }}
                      />
                    ),
                  },
                  {
                    key: "backup",
                    label: "Backup & recovery",
                    children: (
                      <>
                        {backupWarning && (
                          <Alert
                            type="warning"
                            showIcon
                            title="Backup needs attention"
                            description="The backup failed, is older than 36 hours, or has no completion timestamp."
                            style={{ marginBottom: 20 }}
                          />
                        )}
                        <Descriptions
                          column={1}
                          items={[
                            {
                              key: "result",
                              label: "Last job result",
                              children: m.backup.Result || "Unknown",
                            },
                            {
                              key: "exit",
                              label: "Exit code",
                              children: m.backup.ExecMainStatus || "Unknown",
                            },
                            {
                              key: "time",
                              label: "Completed",
                              children:
                                m.backup.ExecMainExitTimestamp ||
                                "Not reported",
                            },
                          ]}
                        />
                        <p className="admin-muted">
                          Job completion does not verify off-host storage or
                          recovery. Confirm a usable snapshot and test
                          restoration before maintenance.
                        </p>
                      </>
                    ),
                  },
                ]}
              />
            </Card>
          </div>
        );
      })}
      <Card title="Infrastructure access" style={{ marginBottom: 24 }}>
        <div className="admin-stat-grid-2">
          {[
            [
              "AWS Lightsail",
              "Server console, browser SSH and snapshots",
              "https://lightsail.aws.amazon.com/ls/webapp/home/instances",
            ],
            [
              "Vercel",
              "Deployments and application logs",
              "https://vercel.com/civals-projects/cival-systems-store",
            ],
            [
              "CloudWatch",
              "Metrics and notification alarms",
              "https://us-east-2.console.aws.amazon.com/cloudwatch/home?region=us-east-2#alarmsV2:",
            ],
            [
              "Session Manager",
              "Requires an enrolled host and AWS permissions",
              "https://us-east-2.console.aws.amazon.com/systems-manager/session-manager?region=us-east-2",
            ],
          ].map(([title, description, url]) => (
            <a
              key={title}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: 16,
                border: "1px solid var(--admin-border)",
                borderRadius: 6,
                color: "var(--admin-text)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 500,
                }}
              >
                {title}
                <ExportOutlined />
              </span>
              <span className="admin-muted">{description}</span>
            </a>
          ))}
        </div>
      </Card>
      <p className="admin-muted">
        Use Hosting to manage tenants and incidents. Confirm command completion
        and reconcile venue positions after recovery. Stopping a process does
        not close positions.
      </p>
    </>
  );
}
