"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Product, categories } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem, openCart } = useCart();

  // Close on Escape key
  useEffect(() => {
    if (!product) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [product, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product && product.price > 0) {
      addItem(product);
      openCart();
      onClose();
    }
  };

  const cat = product ? categories.find((c) => c.id === product.category) : null;

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 300 }}
            aria-label="Close modal"
            role="button"
            tabIndex={0}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Quick view: ${product.name}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(700px, 90vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              background: "#12121A",
              borderRadius: 20,
              border: "1px solid rgba(139,92,246,0.15)",
              zIndex: 301,
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            }}
          >
            {/* Close button */}
            <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, background: "rgba(139,92,246,0.1)", border: "none", color: "#94A3B8", fontSize: 18, cursor: "pointer", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>✕</button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="quick-view-grid">
              {/* Image */}
              <div style={{ aspectRatio: "1", position: "relative", overflow: "hidden", borderRadius: "20px 0 0 20px", background: "#0A0A0F" }}>
                <img
                  src={`/images/products/${product.id}.png`}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Info */}
              <div style={{ padding: 32 }}>
                {product.badge && (
                  <span style={{ display: "inline-block", background: "rgba(139,92,246,0.15)", color: "#A78BFA", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em", marginBottom: 12 }}>
                    {product.badge}
                  </span>
                )}
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>{product.name}</h2>
                <p style={{ color: "#64748B", fontSize: 12, marginBottom: 12 }}>{cat?.label}</p>
                <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{product.description}</p>

                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 800, color: product.price === 0 ? "#64748B" : "#F8FAFC" }}>
                    {product.price === 0 ? "Coming Soon" : `$${product.price}`}
                  </span>
                  {product.price > 0 && <span style={{ color: "#64748B", fontSize: 13, marginLeft: 8 }}>one-time</span>}
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                  {product.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#8B5CF6", fontSize: 14 }} aria-hidden>✓</span>
                      <span style={{ color: "#CBD5E1", fontSize: 13 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  {product.price > 0 && (
                    <motion.button
                      onClick={handleAddToCart}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ flex: 1, padding: "14px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}
                    >
                      Add to Cart — ${product.price}
                    </motion.button>
                  )}
                  <Link href={`/store/${product.id}`} onClick={onClose} style={{ textDecoration: "none" }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ padding: "14px 24px", borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)", background: "transparent", color: "#A78BFA", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                    >
                      Full Details
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <style>{`
            @media (max-width: 640px) {
              .quick-view-grid { grid-template-columns: 1fr !important; }
              .quick-view-grid > div:first-child { border-radius: 20px 20px 0 0 !important; aspect-ratio: 16/9 !important; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
