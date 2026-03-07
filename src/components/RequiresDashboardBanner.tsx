import Link from "next/link";

export default function RequiresDashboardBanner() {
  return (
    <div
      style={{
        backgroundColor: "#1a0a00",
        border: "2px solid #F59E0B",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "24px",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            fontSize: "24px",
            lineHeight: "1",
            flexShrink: 0,
            marginTop: "2px",
          }}
        >
          ⚠️
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#fff",
              fontSize: "15px",
              lineHeight: "1.6",
              marginBottom: "8px",
            }}
          >
            This plugin requires the AI Trading Dashboard to function. It cannot
            be used standalone.
          </div>
          <Link
            href="/store/trading-dashboard-template"
            style={{
              color: "#F59E0B",
              textDecoration: "underline",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            View AI Trading Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
