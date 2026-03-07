"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0F",
          color: "#F8FAFC",
          fontFamily: "Inter, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 800,
              margin: "0 0 16px",
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Something broke
          </h1>
          <p style={{ fontSize: "18px", color: "#94A3B8", margin: "0 0 32px" }}>
            We hit an unexpected error. Try again or head back to the store.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="/store"
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#F8FAFC",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                textDecoration: "none",
              }}
            >
              Back to Store
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
