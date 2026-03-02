"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function ConfettiPiece({ index }: { index: number }) {
  const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#A78BFA"];
  const color = colors[index % colors.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 2 + Math.random() * 3;
  const rotation = Math.random() * 720 - 360;
  const size = 6 + Math.random() * 8;

  return (
    <motion.div
      initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
      animate={{ y: "100vh", x: (Math.random() - 0.5) * 200, rotate: rotation, opacity: 0 }}
      transition={{ duration, delay, ease: "easeIn" }}
      style={{
        position: "fixed",
        top: 0,
        left: `${left}%`,
        width: size,
        height: size * 0.6,
        borderRadius: 2,
        background: color,
        zIndex: 400,
        pointerEvents: "none",
      }}
    />
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Navbar />
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 400 }}>
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}
      <main style={{ paddingTop: 72, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.section
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          style={{ textAlign: "center", padding: "64px 24px", maxWidth: 600 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            style={{ fontSize: 80, marginBottom: 24 }}
          >
            🎉
          </motion.div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, color: "#F8FAFC", marginBottom: 16 }}>
            Purchase <span className="gradient-text">Complete!</span>
          </h1>
          <p style={{ color: "#94A3B8", fontSize: 17, lineHeight: 1.7, marginBottom: 16 }}>
            Thank you for your purchase! Your digital products are ready to download.
          </p>
          {orderId && (
            <p style={{ color: "#475569", fontSize: 13, marginBottom: 32 }}>
              Order ID: <code style={{ color: "#A78BFA", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 4 }}>{orderId}</code>
            </p>
          )}

          {/* TODO: Email receipt */}
          {/* When email service is configured, send receipt to customer email */}

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {orderId && (
              <Link href={`/downloads/${orderId}`} style={{ textDecoration: "none" }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "16px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 0 30px rgba(139,92,246,0.3)" }}>
                  Download Files →
                </motion.button>
              </Link>
            )}
            <Link href="/store" style={{ textDecoration: "none" }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ padding: "16px 32px", borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#A78BFA", fontWeight: 600, fontSize: 16, cursor: "pointer" }}>
                Continue Shopping
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0A0F" }} />}>
      <SuccessContent />
    </Suspense>
  );
}
