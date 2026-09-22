import Link from "next/link";

export default function RequiresDashboardBanner({ includedInCore = false }: { includedInCore?: boolean }) {
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
            {includedInCore ? "Already included in Core and Trader. If you own either edition, you do not need to buy Darvas separately." : "Requires a compatible Cival dashboard installation. Trader already includes this strategy; do not buy it again if you own Trader."}
          </div>
          <Link href="/store/trading-dashboard-template" style={{ color: "var(--color-accent-2-700)", fontSize: "13.5px", fontWeight: 600 }}>
            Compare Core Edition →
          </Link>
        </div>
      </div>
    </div>
  );
}
