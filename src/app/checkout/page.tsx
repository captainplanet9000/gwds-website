"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          email,
          name,
        }),
      });
      const data = await res.json();
      if (data.orderId) {
        clearCart();
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid rgba(139,92,246,0.12)",
    background: "rgba(10,10,15,0.6)",
    color: "#F8FAFC",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh" }}>
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px" }}>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 48, textAlign: "center" }}>
            <span className="gradient-text">Checkout</span>
          </h1>

          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: 64, color: "#475569" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <p style={{ fontSize: 18, marginBottom: 24 }}>Your cart is empty</p>
              <motion.a href="/store" whileHover={{ scale: 1.05 }} style={{ display: "inline-block", padding: "14px 32px", borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 600, textDecoration: "none" }}>
                Browse Store
              </motion.a>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 48, alignItems: "start" }} className="checkout-grid">
              {/* Form */}
              <form onSubmit={handleCheckout} className="glass-card" style={{ borderRadius: 20, padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: "#F8FAFC", marginBottom: 8 }}>Your Information</h2>

                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>Email Address</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
                </div>

                <div style={{ borderTop: "1px solid rgba(139,92,246,0.08)", paddingTop: 20, marginTop: 8 }}>
                  <h3 style={{ fontWeight: 600, fontSize: 14, color: "#94A3B8", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Details</h3>
                  <p style={{ color: "#475569", fontSize: 13, marginBottom: 16 }}>💳 Payment integration coming soon. Orders are processed as demo transactions.</p>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" style={inputStyle} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>Expiry</label>
                      <input type="text" placeholder="MM/YY" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>CVC</label>
                      <input type="text" placeholder="123" style={inputStyle} />
                    </div>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    width: "100%",
                    padding: "18px",
                    borderRadius: 12,
                    border: "none",
                    background: loading ? "#475569" : "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: loading ? "wait" : "pointer",
                    boxShadow: "0 0 30px rgba(139,92,246,0.3)",
                    marginTop: 8,
                  }}
                >
                  {loading ? "Processing..." : `Complete Purchase — $${totalPrice.toFixed(2)}`}
                </motion.button>
              </form>

              {/* Order Summary */}
              <div className="glass-card" style={{ borderRadius: 20, padding: 32, position: "sticky", top: 96 }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#F8FAFC", marginBottom: 24 }}>Order Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                  {items.map((item) => (
                    <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span style={{ fontSize: 24 }}>{item.product.emoji}</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#F8FAFC" }}>{item.product.name}</p>
                          <p style={{ fontSize: 12, color: "#64748B" }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, color: "#CBD5E1" }}>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid rgba(139,92,246,0.1)", paddingTop: 16, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 600, color: "#94A3B8" }}>Total</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 24, color: "#F8FAFC" }}>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
