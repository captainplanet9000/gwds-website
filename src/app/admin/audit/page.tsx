"use client";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Drawer,
  Input,
  Space,
  Table,
  Tag,
  Tabs,
} from "antd";
import type { TableColumnsType } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entity_id?: string;
  meta?: unknown;
  created_at: string;
};
type StripeEvent = {
  id: string;
  type: string;
  status: string;
  livemode: boolean;
  created_at: string;
  error?: string;
};
type Email = {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
};
type Data = {
  auditLogs: AuditLog[];
  stripeEvents: StripeEvent[];
  emailOutbox: Email[];
  pagination: { total: number };
};
const date = (v?: string) =>
  v
    ? new Date(v).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const status = (v: string) => (
  <Tag
    color={
      ["completed", "sent"].includes(v)
        ? "success"
        : ["failed", "error"].includes(v)
          ? "error"
          : "default"
    }
  >
    {v.replaceAll("_", " ")}
  </Tag>
);
const initial = { action: "", entity: "", startDate: "", endDate: "" };
export default function AuditPage() {
  const [data, setData] = useState<Data | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1),
    [limit, setLimit] = useState(25),
    [draft, setDraft] = useState(initial),
    [filters, setFilters] = useState(initial),
    [refresh, setRefresh] = useState(0),
    [record, setRecord] = useState<AuditLog | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    Object.entries(filters).forEach(([k, v]) => {
      if (v)
        params.set(
          k,
          k === "endDate"
            ? v + "T23:59:59.999Z"
            : k === "startDate"
              ? v + "T00:00:00.000Z"
              : v,
        );
    });
    fetch("/api/admin/audit?" + params, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (r) => {
        const b = await r.json();
        if (!r.ok) throw Error(b.error || "Could not load audit records.");
        setData(b);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [page, limit, filters, refresh]);
  const columns: TableColumnsType<AuditLog> = [
    {
      title: "Action",
      dataIndex: "action",
      width: 240,
      render: (v) => (
        <span style={{ fontWeight: 500 }}>{v.replaceAll("_", " ")}</span>
      ),
    },
    {
      title: "Resource",
      dataIndex: "entity",
      width: 170,
      render: (v) => v?.replaceAll("_", " ") || "—",
    },
    {
      title: "Resource ID",
      dataIndex: "entity_id",
      width: 220,
      render: (v) => <span className="admin-code">{v || "—"}</span>,
    },
    { title: "Time", dataIndex: "created_at", width: 210, render: date },
    {
      title: "",
      key: "details",
      width: 85,
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() => setRecord(r)}
          aria-label={"View " + r.action + " details"}
        >
          Details
        </Button>
      ),
    },
  ];
  const stripeColumns: TableColumnsType<StripeEvent> = [
    { title: "Event", dataIndex: "type", width: 280 },
    { title: "Status", dataIndex: "status", width: 130, render: status },
    {
      title: "Mode",
      dataIndex: "livemode",
      width: 90,
      render: (v) => <Tag>{v ? "Live" : "Test"}</Tag>,
    },
    { title: "Received", dataIndex: "created_at", width: 200, render: date },
    {
      title: "Event ID",
      dataIndex: "id",
      width: 280,
      render: (v) => <span className="admin-code">{v}</span>,
    },
  ];
  const emailColumns: TableColumnsType<Email> = [
    { title: "Recipient", dataIndex: "to_email", width: 260 },
    {
      title: "Template",
      dataIndex: "subject",
      width: 210,
      render: (v) => v.replaceAll("_", " "),
    },
    { title: "Status", dataIndex: "status", width: 110, render: status },
    { title: "Sent", dataIndex: "sent_at", width: 200, render: date },
    {
      title: "Error",
      dataIndex: "error_message",
      width: 250,
      render: (v) => v || "—",
    },
  ];
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>Audit log</h1>
          <p>
            Review administrative activity, payment events and email delivery
            records.
          </p>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {setLoading(true);setError("");setRefresh((v) => v + 1);}}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          title="Records unavailable"
          description={error + " Previously loaded records may be out of date."}
          style={{ marginBottom: 20 }}
        />
      )}
      <Card styles={{ body: { padding: "0 24px 24px" } }}>
        <Tabs
          items={[
            {
              key: "activity",
              label: "Admin activity",
              children: (
                <>
                  <form
                    className="admin-filter-bar"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setLoading(true);setError("");
                      setPage(1);
                      setFilters({ ...draft });
                    }}
                  >
                    <label>
                      Action
                      <Input
                        value={draft.action}
                        placeholder="e.g. update_settings"
                        onChange={(e) =>
                          setDraft({ ...draft, action: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Resource
                      <Input
                        value={draft.entity}
                        placeholder="e.g. product"
                        onChange={(e) =>
                          setDraft({ ...draft, entity: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      From (UTC)
                      <Input
                        type="date"
                        value={draft.startDate}
                        onChange={(e) =>
                          setDraft({ ...draft, startDate: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Through (UTC)
                      <Input
                        type="date"
                        min={draft.startDate}
                        value={draft.endDate}
                        onChange={(e) =>
                          setDraft({ ...draft, endDate: e.target.value })
                        }
                      />
                    </label>
                    <Space>
                      <Button htmlType="submit" type="primary">
                        Apply
                      </Button>
                      <Button
                        onClick={() => {
                          setLoading(true);setError("");setRefresh(v=>v+1);
                            setDraft(initial);
                          setFilters(initial);
                          setPage(1);
                        }}
                      >
                        Reset
                      </Button>
                    </Space>
                  </form>
                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data?.auditLogs || []}
                    loading={loading}
                    scroll={{ x: 920 }}
                    locale={{
                      emptyText: error
                        ? "Records unavailable"
                        : "No activity matches these filters",
                    }}
                    pagination={{
                      current: page,
                      pageSize: limit,
                      total: data?.pagination.total || 0,
                      showSizeChanger: true,
                      pageSizeOptions: [25, 50, 100],
                      showTotal: (n) => `${n} records`,
                      onChange: (p, s) => {
                      if(p===page&&s===limit)return;
                      setLoading(true);setError("");
                        setPage(s !== limit ? 1 : p);
                        setLimit(s);
                      },
                    }}
                  />
                </>
              ),
            },
            {
              key: "stripe",
              label: "Stripe events",
              children: (
                <>
                  <p className="admin-muted">
                    Most recent 20 events. Live and test events are labelled
                    separately.
                  </p>
                  <Table
                    rowKey="id"
                    columns={stripeColumns}
                    dataSource={data?.stripeEvents || []}
                    loading={loading}
                    scroll={{ x: 980 }}
                    pagination={false}
                    locale={{
                      emptyText: error
                        ? "Records unavailable"
                        : "No payment events recorded",
                    }}
                  />
                </>
              ),
            },
            {
              key: "email",
              label: "Email delivery",
              children: (
                <>
                  <p className="admin-muted">
                    Most recent 50 messages. Sent indicates provider submission,
                    not confirmed inbox delivery.
                  </p>
                  <Table
                    rowKey="id"
                    columns={emailColumns}
                    dataSource={data?.emailOutbox || []}
                    loading={loading}
                    scroll={{ x: 980 }}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    locale={{
                      emptyText: error
                        ? "Records unavailable"
                        : "No outgoing messages recorded",
                    }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
      <Drawer
        title="Activity details"
        open={!!record}
        onClose={() => setRecord(null)}
        size={520}
      >
        <p>{record?.action.replaceAll("_", " ")}</p>
        <p className="admin-muted">{date(record?.created_at)}</p>
        <pre className="admin-record-details">
          {JSON.stringify(record, null, 2)}
        </pre>
      </Drawer>
    </>
  );
}
