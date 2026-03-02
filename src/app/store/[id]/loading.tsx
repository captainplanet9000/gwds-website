export default function ProductLoading() {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", paddingTop: 72 }}>
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>
        {/* Breadcrumb skeleton */}
        <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
          {[60, 50, 80, 120].map((w, i) => (
            <div key={i} style={{ width: w, height: 14, borderRadius: 4, background: "rgba(139,92,246,0.06)", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          {/* Image skeleton */}
          <div style={{ aspectRatio: "4/3", borderRadius: 20, background: "rgba(139,92,246,0.04)", animation: "shimmer 1.5s infinite" }} />

          {/* Details skeleton */}
          <div>
            <div style={{ width: 80, height: 24, borderRadius: 6, background: "rgba(139,92,246,0.06)", marginBottom: 16, animation: "shimmer 1.5s infinite" }} />
            <div style={{ width: "80%", height: 36, borderRadius: 8, background: "rgba(139,92,246,0.06)", marginBottom: 12, animation: "shimmer 1.5s infinite 0.1s" }} />
            <div style={{ width: 120, height: 14, borderRadius: 4, background: "rgba(139,92,246,0.04)", marginBottom: 20, animation: "shimmer 1.5s infinite 0.2s" }} />
            <div style={{ width: "100%", height: 16, borderRadius: 4, background: "rgba(139,92,246,0.04)", marginBottom: 8, animation: "shimmer 1.5s infinite 0.15s" }} />
            <div style={{ width: "90%", height: 16, borderRadius: 4, background: "rgba(139,92,246,0.04)", marginBottom: 8, animation: "shimmer 1.5s infinite 0.2s" }} />
            <div style={{ width: "70%", height: 16, borderRadius: 4, background: "rgba(139,92,246,0.04)", marginBottom: 32, animation: "shimmer 1.5s infinite 0.25s" }} />
            <div style={{ width: 160, height: 44, borderRadius: 8, background: "rgba(139,92,246,0.06)", marginBottom: 24, animation: "shimmer 1.5s infinite 0.3s" }} />
            <div style={{ width: "100%", height: 52, borderRadius: 12, background: "rgba(139,92,246,0.06)", animation: "shimmer 1.5s infinite 0.35s" }} />
          </div>
        </div>
      </section>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
