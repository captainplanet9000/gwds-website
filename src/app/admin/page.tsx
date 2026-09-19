"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Statistic, Table, Tag, Progress, Empty as AntEmpty } from "antd";
import AdminAccessGate from "@/components/admin/AdminAccessGate";

interface AdminStats {
  totalRevenue: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalSubscribers: number;
  newMessages: number;
  activeCoupons: number;
  recentOrders: Array<{
    id: string;
    customer_email?: string;
    customer_name?: string;
    total_cents?: number;
    status?: string;
    created_at: string;
  }>;
  revenueByDay: Array<{ label: string; value: number }>;
  revenueByProduct: Array<{
    productId: string;
    productName: string;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState<
    "checking" | "guest" | "authenticated"
  >("checking");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((response) => {
        setAuthState(response.ok ? "authenticated" : "guest");
        return response.ok
          ? fetch("/api/admin/stats", { cache: "no-store" })
          : null;
      })
      .then(async (response) => {
        if (!response) return;
        if (!response.ok)
          throw new Error("Operations data could not be loaded.");
        setStats((await response.json()) as AdminStats);
      })
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Operations data could not be loaded.",
        ),
      );
  }, []);

  if (authState === "guest")
    return <AdminAccessGate onAuthenticated={() => window.location.reload()} />;
  if (
    authState === "checking" ||
    (authState === "authenticated" && !stats && !error)
  ) {
    return <div style={centerStyle}>Loading verified operations data…</div>;
  }
  if (error || !stats)
    return (
      <div role="alert" style={centerStyle}>
        {error || "Operations data is unavailable."}
      </div>
    );

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>Business overview</h1>
          <p>
            Store activity and paid orders. Refunded and disputed orders are
            excluded from revenue.
          </p>
        </div>
        <Link href="/admin/hosting">View hosting operations →</Link>
      </div>
      <section className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        <Card>
          <Statistic
            title="Paid order revenue"
            value={Number(stats.totalRevenue)}
            prefix="$"
            precision={2}
          />
        </Card>
        <Card>
          <Statistic title="Paid orders" value={stats.totalOrders} />
        </Card>
        <Card>
          <Statistic title="Customers" value={stats.totalCustomers} />
        </Card>
        <Card>
          <Statistic title="Products" value={stats.totalProducts} />
        </Card>
      </section>
      <section className="admin-stat-grid-3" style={{ marginBottom: 24 }}>
        {[
          ["Support messages", stats.newMessages, "/admin/messages"],
          ["Subscribers", stats.totalSubscribers, "/admin/subscribers"],
          ["Active discounts", stats.activeCoupons, "/admin/coupons"],
        ].map(([label, value, href]) => (
          <Card key={String(label)} size="small">
            <Link
              href={String(href)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "var(--admin-text)",
              }}
            >
              <span>{label}</span>
              <strong style={{ fontSize: 20, fontWeight: 600 }}>{value}</strong>
            </Link>
          </Card>
        ))}
      </section>
      <section className="admin-stat-grid-2" style={{ marginBottom: 24 }}>
        <Card
          title="Revenue by product"
          extra={<span className="admin-muted">Before discounts</span>}
        >
          {stats.revenueByProduct.length ? (
            stats.revenueByProduct.map((item) => (
              <div key={item.productId} style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    fontSize: 13,
                  }}
                >
                  <span>{item.productName}</span>
                  <strong>${item.revenue.toFixed(2)}</strong>
                </div>
                <Progress
                  percent={
                    (item.revenue /
                      Math.max(
                        1,
                        ...stats.revenueByProduct.map((p) => p.revenue),
                      )) *
                    100
                  }
                  showInfo={false}
                  strokeColor="#5676a8"
                  size="small"
                />
              </div>
            ))
          ) : (
            <AntEmpty
              description="No product revenue recorded"
              image={AntEmpty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
        <Card
          title="Revenue history"
          extra={<span className="admin-muted">Last 30 days</span>}
        >
          <div
            style={{
              height: 145,
              display: "flex",
              alignItems: "end",
              gap: 4,
              borderBottom: "1px solid var(--admin-border)",
              paddingTop: 12,
            }}
          >
            {stats.revenueByDay.map((day, i) => (
              <div
                key={i}
                title={`Day ${day.label}: $${day.value.toFixed(2)}`}
                style={{
                  flex: 1,
                  minWidth: 2,
                  height: `${Math.max(2, (day.value / Math.max(1, ...stats.revenueByDay.map((d) => d.value))) * 100)}%`,
                  background: day.value ? "#5676a8" : "#e8ecf1",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            ))}
          </div>
          <p className="admin-muted" style={{ marginBottom: 0 }}>
            Recorded paid-order revenue. Hover over a day for its amount.
          </p>
        </Card>
      </section>
      <Card
        title="Recent orders"
        extra={<Link href="/admin/orders">View all orders →</Link>}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          rowKey="id"
          dataSource={stats.recentOrders}
          pagination={false}
          scroll={{ x: 720 }}
          columns={[
            {
              title: "Customer",
              key: "customer",
              render: (_, r) =>
                r.customer_name || r.customer_email || "Customer",
            },
            {
              title: "Amount",
              dataIndex: "total_cents",
              width: 140,
              align: "right",
              render: (v) => `$${((v || 0) / 100).toFixed(2)}`,
            },
            {
              title: "Status",
              dataIndex: "status",
              width: 150,
              render: (v) => (
                <Tag color={v === "paid" ? "success" : "default"}>
                  {v || "Unknown"}
                </Tag>
              ),
            },
            {
              title: "Created",
              dataIndex: "created_at",
              width: 220,
              render: (v) => new Date(v).toLocaleString(),
            },
          ]}
        />
      </Card>
    </>
  );
}
const centerStyle: React.CSSProperties = {
  minHeight: "50vh",
  display: "grid",
  placeItems: "center",
  color: "var(--admin-text-muted)",
};
