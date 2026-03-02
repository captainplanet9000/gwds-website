"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 200,
            }}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(420px, 90vw)",
              background: "#0F0F17",
              borderLeft: "1px solid rgba(139,92,246,0.15)",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid rgba(139,92,246,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: "#F8FAFC" }}>
                Cart ({totalItems})
              </h2>
              <button onClick={closeCart} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 24, cursor: "pointer", padding: 4 }}>✕</button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {items.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 0", color: "#475569" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
                  <p style={{ fontSize: 15, marginBottom: 24 }}>Your cart is empty</p>
                  <button onClick={closeCart} style={{ padding: "12px 28px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#A78BFA", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                    Browse Store
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        style={{
                          display: "flex",
                          gap: 16,
                          padding: 16,
                          borderRadius: 12,
                          background: "rgba(139,92,246,0.04)",
                          border: "1px solid rgba(139,92,246,0.08)",
                        }}
                      >
                        <div style={{ width: 56, height: 56, borderRadius: 10, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                          {item.product.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ fontWeight: 600, fontSize: 14, color: "#F8FAFC", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product.name}</h4>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontWeight: 700, fontSize: 15, color: "#A78BFA" }}>${item.product.price}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>−</button>
                              <span style={{ fontSize: 14, color: "#CBD5E1", minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#94A3B8", cursor: "pointer", fontSize: 14 }}>+</button>
                              <button onClick={() => removeItem(item.product.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "none", background: "rgba(239,68,68,0.1)", color: "#EF4444", cursor: "pointer", fontSize: 12, marginLeft: 4 }}>✕</button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(139,92,246,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ color: "#94A3B8", fontSize: 15 }}>Total</span>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: 22, color: "#F8FAFC" }}>${totalPrice.toFixed(2)}</span>
                </div>
                <Link href="/checkout" onClick={closeCart} style={{ textDecoration: "none", display: "block" }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(139,92,246,0.3)",
                    }}
                  >
                    Checkout — ${totalPrice.toFixed(2)}
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
