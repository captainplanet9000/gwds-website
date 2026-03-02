"use client";
import { motion } from "framer-motion";

export default function StoreError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0F", padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", maxWidth: 500 }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>
          Something went wrong
        </h2>
        <p style={{ color: "#64748B", fontSize: 15, marginBottom: 8 }}>
          {error.message || "An unexpected error occurred while loading the store."}
        </p>
        <motion.button
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ marginTop: 24, padding: "14px 32px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
        >
          Try Again
        </motion.button>
      </motion.div>
    </div>
  );
}
