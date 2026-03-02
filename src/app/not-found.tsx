"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", maxWidth: 500 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 16,
              background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </motion.div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>
            Page Not Found
          </h1>
          <p style={{ color: "#64748B", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                Go Home
              </motion.button>
            </Link>
            <Link href="/store" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#A78BFA", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                Browse Store
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    </>
  );
}
