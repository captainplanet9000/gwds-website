"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ZoomImage, FadeIn, ScrollReveal, MagneticHover } from "@/components/motion";
import { Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { useRef, useState } from "react";

interface Props {
  product: Product;
  category: { id: string; label: string; emoji: string; description: string } | null;
  related: Product[];
}

export default function ProductDetailClient({ product, category, related }: Props) {
  const { addItem, openCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (product.price > 0) {
      addItem(product);
      setAdded(true);
      openCart();
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -340 : 340, behavior: "smooth" });
    }
  };

  const productImage = product.image || `/images/products/${product.id}.png`;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImage,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.price === 0 ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh" }}>
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 40, fontSize: 13, color: "#64748B" }}>
            <Link href="/" style={{ color: "#475569", textDecoration: "none" }}>Home</Link>
            <span aria-hidden>›</span>
            <Link href="/store" style={{ color: "#8B5CF6", textDecoration: "none" }}>Store</Link>
            <span aria-hidden>›</span>
            <Link href={`/store?cat=${product.category}`} style={{ color: "#8B5CF6", textDecoration: "none" }}>{category?.label}</Link>
            <span aria-hidden>›</span>
            <span style={{ color: "#94A3B8" }}>{product.name}</span>
          </nav>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="product-grid">
            {/* Image with real zoom */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ZoomImage
                src={productImage}
                alt={product.name}
                style={{
                  aspectRatio: "4/3",
                  borderRadius: 20,
                  border: "1px solid rgba(139,92,246,0.1)",
                }}
              />
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              {product.badge && (
                <span style={{ display: "inline-block", background: "rgba(139,92,246,0.15)", color: "#A78BFA", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, letterSpacing: "0.05em", marginBottom: 16 }}>
                  {product.badge}
                </span>
              )}

              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, color: "#F8FAFC" }}>
                {product.name}
              </h1>
              <p style={{ color: "#64748B", fontSize: 13, marginBottom: 20 }}>{category?.label}</p>
              <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>{product.description}</p>

              {/* Price */}
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 40, fontWeight: 800, color: product.price === 0 ? "#64748B" : "#F8FAFC" }}>
                  {product.price === 0 ? "Coming Soon" : `$${product.price}`}
                </span>
                {product.price > 0 && <span style={{ color: "#64748B", fontSize: 14, marginLeft: 8 }}>one-time</span>}
              </div>

              {/* Buy / Add to Cart */}
              {product.price > 0 ? (
                <MagneticHover strength={0.15} style={{ marginBottom: 24 }}>
                  <motion.button
                    onClick={handleAddToCart}
                    whileHover={{ boxShadow: "0 0 40px rgba(139,92,246,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: "100%",
                      padding: "18px 36px",
                      borderRadius: 12,
                      border: "none",
                      background: added ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      boxShadow: "0 0 30px rgba(139,92,246,0.3)",
                      transition: "background 0.3s",
                    }}
                    aria-label={`Add ${product.name} to cart for $${product.price}`}
                  >
                    {added ? "✓ Added to Cart!" : `Add to Cart — $${product.price}`}
                  </motion.button>
                </MagneticHover>
              ) : (
                <button disabled style={{ width: "100%", padding: "18px 36px", borderRadius: 12, border: "1px solid rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.05)", color: "#64748B", fontWeight: 600, fontSize: 16, cursor: "not-allowed", marginBottom: 24 }} aria-disabled="true">
                  Coming Soon
                </button>
              )}

              {/* Features */}
              <div role="list" aria-label="Product features">
                <h3 style={{ fontWeight: 600, fontSize: 14, color: "#94A3B8", marginBottom: 16, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  What&apos;s Included
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {product.features.map((f, i) => (
                    <motion.div
                      key={f}
                      role="listitem"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span style={{ color: "#8B5CF6", fontSize: 16 }} aria-hidden>✓</span>
                      <span style={{ color: "#CBD5E1", fontSize: 14 }}>{f}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products Carousel */}
          {related.length > 0 && (
            <ScrollReveal style={{ marginTop: 100 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#F8FAFC" }}>
                  Related Products
                </h2>
                {related.length > 3 && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => scroll("left")} aria-label="Scroll left" style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.05)", color: "#A78BFA", cursor: "pointer", fontSize: 18 }}>←</button>
                    <button onClick={() => scroll("right")} aria-label="Scroll right" style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.05)", color: "#A78BFA", cursor: "pointer", fontSize: 18 }}>→</button>
                  </div>
                )}
              </div>
              <div ref={scrollRef} style={{ display: "flex", gap: 20, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 16, scrollbarWidth: "none" }}>
                {related.map((p) => (
                  <Link key={p.id} href={`/store/${p.id}`} style={{ textDecoration: "none", minWidth: 300, scrollSnapAlign: "start" }}>
                    <motion.div className="glass-card" style={{ borderRadius: 16, overflow: "hidden" }} whileHover={{ y: -4, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                      <div style={{ height: 120, overflow: "hidden" }}>
                        <img src={`/images/products/${p.id}.png`} alt={p.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "16px 20px" }}>
                        <h4 style={{ fontWeight: 600, color: "#F8FAFC", marginBottom: 4, fontSize: 15 }}>{p.name}</h4>
                        <span style={{ color: "#8B5CF6", fontWeight: 600 }}>{p.price === 0 ? "TBA" : `$${p.price}`}</span>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </ScrollReveal>
          )}
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>
    </>
  );
}
