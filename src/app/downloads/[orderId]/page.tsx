"use client";
import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  email: string;
  name: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export default function DownloadsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
      })
      .catch(() => setError("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleDownload = async (productId: string) => {
    try {
      const res = await fetch(`/api/downloads/${orderId}/${productId}`, { method: "POST" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${productId}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh" }}>
        <section style={{ maxWidth: 700, margin: "0 auto", padding: "64px 24px" }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 800, color: "#F8FAFC", marginBottom: 8 }}>
            Your <span className="gradient-text">Downloads</span>
          </h1>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 40 }}>
            Order: <code style={{ color: "#A78BFA" }}>{orderId}</code>
          </p>

          {loading && (
            <div style={{ textAlign: "center", padding: 64, color: "#475569" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ fontSize: 32, display: "inline-block" }}>⟳</motion.div>
              <p style={{ marginTop: 16 }}>Loading order...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: "center", padding: 64, color: "#EF4444" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
              <p>{error}</p>
            </div>
          )}

          {order && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {order.items.map((item, i) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card"
                  style={{ borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
                >
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 16, color: "#F8FAFC", marginBottom: 4 }}>{item.productName}</h3>
                    <p style={{ color: "#64748B", fontSize: 13 }}>Qty: {item.quantity} • ${item.price}</p>
                  </div>
                  <motion.button
                    onClick={() => handleDownload(item.productId)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                  >
                    ⬇ Download
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
