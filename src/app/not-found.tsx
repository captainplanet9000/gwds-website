"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="cival">
      <Navbar />
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "160px 24px 80px" }}>
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
              fontFamily: "var(--font-heading)",
              fontSize: 120,
              fontWeight: 400,
              lineHeight: 1,
              marginBottom: 16,
              color: "var(--color-accent)",
            }}
          >
            404
          </motion.div>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: "var(--color-text)", marginBottom: 12 }}>
            Page Not Found
          </h1>
          <p style={{ color: "var(--color-neutral-700)", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-primary" style={{ height: 48, padding: "0 28px", fontSize: 15 }}>
                Go Home
              </motion.button>
            </Link>
            <Link href="/store" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-secondary" style={{ height: 48, padding: "0 28px", fontSize: 15 }}>
                Browse Store
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
