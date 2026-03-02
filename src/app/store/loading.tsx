export default function StoreLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", paddingTop: 72 }}>
      <section style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}>
        {/* Header skeleton */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ width: 200, height: 40, borderRadius: 8, background: "rgba(139,92,246,0.08)", margin: "0 auto 16px", animation: "shimmer 1.5s infinite" }} />
          <div style={{ width: 300, height: 20, borderRadius: 6, background: "rgba(139,92,246,0.05)", margin: "0 auto" }} />
        </div>
        {/* Filter skeleton */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} style={{ width: 100 + i * 10, height: 40, borderRadius: 100, background: "rgba(139,92,246,0.05)", animation: `shimmer 1.5s infinite ${i * 0.1}s` }} />
          ))}
        </div>
        {/* Grid skeleton */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: "hidden", background: "rgba(18,18,26,0.8)", border: "1px solid rgba(139,92,246,0.05)" }}>
              <div style={{ height: 200, background: "rgba(139,92,246,0.04)", animation: `shimmer 1.5s infinite ${i * 0.15}s` }} />
              <div style={{ padding: 24 }}>
                <div style={{ width: "70%", height: 20, borderRadius: 6, background: "rgba(139,92,246,0.06)", marginBottom: 12 }} />
                <div style={{ width: "100%", height: 14, borderRadius: 4, background: "rgba(139,92,246,0.04)", marginBottom: 8 }} />
                <div style={{ width: "60%", height: 14, borderRadius: 4, background: "rgba(139,92,246,0.04)" }} />
              </div>
            </div>
          ))}
        </div>
      </section>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
