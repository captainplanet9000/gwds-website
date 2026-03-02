"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createBrowserClient } from "@/lib/supabase";

interface OrderData {
  id: string;
  customer_email: string;
  customer_name: string | null;
  total_cents: number;
  status: string;
  created_at: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price_cents: number;
  }>;
  downloads: Array<{
    product_id: string;
    download_token: string;
  }>;
}

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
  const sessionId = searchParams.get("session_id");
  const [showConfetti, setShowConfetti] = useState(true);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const supabase = createBrowserClient();

        // Get order by stripe session ID
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_session_id", sessionId)
          .single();

        if (orderError || !orderData) {
          throw new Error("Order not found");
        }

        // Get order items
        const { data: itemsData, error: itemsError } = await supabase
          .from("order_items")
          .select("product_id, quantity, price_cents")
          .eq("order_id", orderData.id);

        if (itemsError) {
          throw new Error("Failed to fetch order items");
        }

        // Get product names
        const productIds = itemsData?.map((item) => item.product_id) || [];
        const { data: productsData } = await supabase
          .from("products")
          .select("id, name")
          .in("id", productIds);

        const productMap = new Map(productsData?.map((p) => [p.id, p.name]));

        // Get download tokens
        const { data: downloadsData } = await supabase
          .from("downloads")
          .select("product_id, download_token")
          .eq("order_id", orderData.id);

        setOrder({
          ...orderData,
          items:
            itemsData?.map((item) => ({
              ...item,
              product_name: productMap.get(item.product_id) || item.product_id,
            })) || [],
          downloads: downloadsData || [],
        });
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: 72, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 60, marginBottom: 24 }}>⏳</div>
            <p style={{ color: "#94A3B8", fontSize: 17 }}>Loading your order...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main style={{ paddingTop: 72, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 500, padding: "0 24px" }}>
            <div style={{ fontSize: 60, marginBottom: 24 }}>⚠️</div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              Order Not Found
            </h1>
            <p style={{ color: "#94A3B8", fontSize: 16, marginBottom: 32 }}>
              {error || "We couldn't find your order. Please check your email for order confirmation and download links."}
            </p>
            <Link href="/store" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: "16px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
              >
                Back to Store
              </motion.button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalDollars = (order.total_cents / 100).toFixed(2);

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
          style={{ textAlign: "center", padding: "64px 24px", maxWidth: 700 }}
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
          <p style={{ color: "#94A3B8", fontSize: 17, lineHeight: 1.7, marginBottom: 8 }}>
            Thank you{order.customer_name ? `, ${order.customer_name}` : ""}! Your order is confirmed.
          </p>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 32 }}>
            Order ID: <code style={{ color: "#A78BFA", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 4 }}>{order.id}</code>
          </p>

          {/* Order Summary */}
          <div style={{ background: "#12121A", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: 32, marginBottom: 32, textAlign: "left" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 20 }}>
              Order Summary
            </h2>
            {order.items.map((item, index) => (
              <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 12, borderBottom: index < order.items.length - 1 ? "1px solid #1E293B" : "none" }}>
                <div>
                  <p style={{ color: "#F8FAFC", fontSize: 15, fontWeight: 600, margin: 0 }}>{item.product_name}</p>
                  <p style={{ color: "#64748B", fontSize: 13, margin: "4px 0 0" }}>Quantity: {item.quantity}</p>
                </div>
                <p style={{ color: "#8B5CF6", fontSize: 16, fontWeight: 700, margin: 0 }}>
                  ${((item.price_cents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "2px solid rgba(139,92,246,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ color: "#F8FAFC", fontSize: 18, fontWeight: 700, margin: 0 }}>Total</p>
              <p style={{ color: "#8B5CF6", fontSize: 24, fontWeight: 800, margin: 0 }}>${totalDollars}</p>
            </div>
          </div>

          {/* Download Links */}
          <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 12, padding: 24, marginBottom: 32, textAlign: "left" }}>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              Your Downloads
            </h3>
            {order.items.map((item, index) => {
              const download = order.downloads.find((d) => d.product_id === item.product_id);
              const downloadUrl = download
                ? `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/downloads/${order.id}/${item.product_id}?token=${download.download_token}`
                : null;

              return (
                <div key={index} style={{ marginBottom: 12 }}>
                  <p style={{ color: "#F8FAFC", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{item.product_name}</p>
                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      style={{ display: "inline-block", padding: "10px 20px", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", textDecoration: "none", borderRadius: 8, fontSize: 14, fontWeight: 600 }}
                    >
                      Download →
                    </a>
                  ) : (
                    <p style={{ color: "#64748B", fontSize: 13 }}>Download link not available</p>
                  )}
                </div>
              );
            })}
            <p style={{ color: "#94A3B8", fontSize: 12, marginTop: 16, marginBottom: 0 }}>
              💡 Download links expire in 7 days. You can download each product up to 5 times.
            </p>
          </div>

          {/* Email Notice */}
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 32 }}>
            📧 A confirmation email with download links has been sent to <strong style={{ color: "#94A3B8" }}>{order.customer_email}</strong>
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/store" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ padding: "16px 32px", borderRadius: 12, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#A78BFA", fontWeight: 600, fontSize: 16, cursor: "pointer" }}
              >
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
