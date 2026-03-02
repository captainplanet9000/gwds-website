export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0F" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8B5CF6", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#64748B", fontSize: 14 }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
