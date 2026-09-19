"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { App, Button, ConfigProvider, Drawer, Menu, Spin, Tag } from "antd";
import {
  AppstoreOutlined,
  AuditOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  CreditCardOutlined,
  CustomerServiceOutlined,
  FileZipOutlined,
  HomeOutlined,
  KeyOutlined,
  MailOutlined,
  MenuOutlined,
  SettingOutlined,
  ShoppingOutlined,
  TagOutlined,
  TeamOutlined,
  LogoutOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
const groups = [
  {
    name: "Overview",
    items: [
      ["Overview", "/admin", HomeOutlined],
      ["Analytics", "/admin/analytics", BarChartOutlined],
    ],
  },
  {
    name: "Commerce",
    items: [
      ["Orders", "/admin/orders", ShoppingOutlined],
      ["Customers", "/admin/customers", TeamOutlined],
      ["Products", "/admin/products", AppstoreOutlined],
      ["Discounts", "/admin/coupons", TagOutlined],
      ["Refunds", "/admin/refunds", CreditCardOutlined],
    ],
  },
  {
    name: "Operations",
    items: [
      ["Hosting", "/admin/hosting", CloudServerOutlined],
      ["Servers & recovery", "/admin/servers", CloudServerOutlined],
      ["Release artifacts", "/admin/artifacts", FileZipOutlined],
      ["Access & licenses", "/admin/entitlements", KeyOutlined],
      ["Audit log", "/admin/audit", AuditOutlined],
    ],
  },
  {
    name: "Business",
    items: [
      ["Support", "/admin/messages", CustomerServiceOutlined],
      ["Subscribers", "/admin/subscribers", MailOutlined],
      ["Settings", "/admin/theme", SettingOutlined],
    ],
  },
] as const;
const fontFamily =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"checking" | "guest" | "authenticated">(
    "checking",
  );
  const [admin, setAdmin] = useState<{ email: string; role: string } | null>(
    null,
  );
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/auth", { cache: "no-store", signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          setState("guest");
          setAdmin(null);
          return;
        }
        const b = await r.json();
        setAdmin(b.admin);
        setState("authenticated");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setState("guest");
      });
    return () => controller.abort();
  }, [path]);
  useEffect(() => {
    if (state === "guest" && path !== "/admin") router.replace("/admin");
  }, [state, path, router]);
  const items = groups.map((g) => ({
    type: "group" as const,
    key: g.name,
    label: g.name,
    children: g.items.map(([label, href, Icon]) => ({
      key: href,
      icon: <Icon />,
      label: (
        <Link href={href} onClick={() => setOpen(false)}>
          {label}
        </Link>
      ),
    })),
  }));
  const current =
    groups.flatMap((g) => [...g.items]).find((i) => i[1] === path)?.[0] ||
    "Administration";
  const nav = (
    <>
      <Link href="/admin" className="admin-brand">
        <span className="admin-brand-mark">C</span>
        <span>
          Cival Systems<small>Administration</small>
        </span>
      </Link>
      <nav aria-label="Administration">
        <Menu mode="inline" selectedKeys={[path]} items={items} />
      </nav>
      <div className="admin-sidebar-footer">
        <span className="admin-avatar">
          {admin?.email?.[0]?.toUpperCase() || "C"}
        </span>
        <div>
          <strong>{admin?.email}</strong>
          <small>{admin?.role}</small>
        </div>
      </div>
    </>
  );
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#365eaa",
          colorInfo: "#365eaa",
          colorSuccess: "#27745c",
          colorWarning: "#996514",
          colorError: "#ba3b42",
          colorText: "#182230",
          colorTextSecondary: "#667085",
          colorBorder: "#dce1e8",
          colorBgLayout: "#f5f6f8",
          borderRadius: 6,
          fontFamily,
          fontSize: 14,
          controlHeight: 36,
        },
        components: {
          Menu: {
            itemSelectedBg: "#edf2fa",
            itemSelectedColor: "#284b8b",
            itemHeight: 40,
            itemBorderRadius: 6,
          },
          Table: {
            headerBg: "#f8f9fb",
            headerColor: "#526071",
            cellPaddingBlock: 13,
          },
          Card: { headerFontSize: 15 },
          Button: { primaryShadow: "none" },
        },
      }}
    >
      <App className="admin-workspace">
        {state === "checking" ? (
          <div className="admin-loading">
            <Spin />
            <span>Loading administration…</span>
          </div>
        ) : state === "guest" ? (
          <div className="admin-login-surface">
            {path === "/admin" ? children : null}
          </div>
        ) : (
          <>
            <aside className="admin-desktop-nav">{nav}</aside>
            <Drawer
              title="Navigation"
              placement="left"
              open={open}
              onClose={() => setOpen(false)}
              size={264}
              className="admin-nav-drawer"
            >
              {nav}
            </Drawer>
            <div className="admin-main">
              <header className="admin-topbar">
                <div className="admin-topbar-title">
                  <Button
                    className="admin-menu-toggle"
                    type="text"
                    icon={<MenuOutlined />}
                    aria-label="Open navigation"
                    onClick={() => setOpen(true)}
                  />
                  <span>Workspace</span>
                  <span className="admin-divider">/</span>
                  <strong>{current}</strong>
                </div>
                <div className="admin-topbar-actions">
                  <Tag>Production</Tag>
                  <Link href="/" className="admin-store-link">
                    <ArrowLeftOutlined /> Store
                  </Link>
                  <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    aria-label="Sign out"
                    onClick={async () => {
                      await fetch("/api/admin/auth", { method: "DELETE" });
                      await signOut();
                      router.replace("/admin");
                      router.refresh();
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </header>
              <main className="admin-content">{children}</main>
            </div>
          </>
        )}
      </App>
    </ConfigProvider>
  );
}
