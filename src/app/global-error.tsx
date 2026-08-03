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
          backgroundColor: "#f3f2ef",
          color: "#0f1219",
          fontFamily: "'Instrument Sans', -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontWeight: 400,
              fontSize: "48px",
              margin: "0 0 16px",
              color: "#1d4ed8",
            }}
          >
            Something broke
          </h1>
          <p style={{ fontSize: "18px", color: "#605d57", margin: "0 0 32px" }}>
            We hit an unexpected error. Try again or head back to the store.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontFamily: "'Instrument Sans', -apple-system, sans-serif",
                fontWeight: 600,
                color: "#fff",
                background: "#1d4ed8",
                border: "none",
                borderRadius: "999px",
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
                fontFamily: "'Instrument Sans', -apple-system, sans-serif",
                fontWeight: 600,
                color: "#0f1219",
                background: "#e6e4de",
                border: "1px solid rgba(15,18,25,0.15)",
                borderRadius: "999px",
                textDecoration: "none",
                display: "inline-block",
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
