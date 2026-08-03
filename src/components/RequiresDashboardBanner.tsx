import Link from "next/link";

export default function RequiresDashboardBanner() {
  return (
    <div
      style={{
        background: "var(--color-accent-2-100)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ fontSize: "20px", lineHeight: "1", flexShrink: 0, marginTop: "2px" }}>⚠️</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--color-accent-2-900)", fontSize: "14px", lineHeight: "1.6", marginBottom: "8px" }}>
            This add-on requires Core Edition to function. It cannot be used standalone.
          </div>
          <Link href="/store/trading-dashboard-template" style={{ color: "var(--color-accent-2-700)", fontSize: "13.5px", fontWeight: 600 }}>
            View Core Edition →
          </Link>
        </div>
      </div>
    </div>
  );
}
