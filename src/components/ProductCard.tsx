"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { TiltCard, Skeleton } from "./motion";
import { useCart } from "@/contexts/CartContext";
import { Card } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
  onQuickView?: () => void;
}

export default function ProductCard({ product, view = "grid", onQuickView }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.price > 0) {
      addItem(product);
      openCart();
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.();
  };

  const productImage = product.image || `/images/products/${product.id}.png`;

  if (view === "list") {
    return (
      <Link href={`/store/${product.id}`} style={{ textDecoration: "none" }}>
        <Card 
          variant="glass" 
          hoverable 
          padding="md"
          style={{ display: "flex", gap: "var(--space-5)", alignItems: "center" }}
        >
          <div style={{ 
            width: 120, 
            height: 90, 
            borderRadius: "var(--radius-md)", 
            overflow: "hidden", 
            flexShrink: 0, 
            position: "relative", 
            background: "var(--color-void-black)" 
          }}>
            <img
              src={productImage}
              alt={product.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "var(--space-3)" }}>
              <div>
                <h3 style={{ 
                  fontFamily: "var(--font-display)", 
                  fontWeight: 600, 
                  fontSize: "var(--text-base)", 
                  color: "var(--color-text-bright)", 
                  marginBottom: "var(--space-1)" 
                }}>
                  {product.name}
                </h3>
                <p style={{ 
                  color: "var(--color-text-muted)", 
                  fontSize: "var(--text-sm)", 
                  lineHeight: "var(--leading-normal)", 
                  display: "-webkit-box", 
                  WebkitLineClamp: 1, 
                  WebkitBoxOrient: "vertical", 
                  overflow: "hidden" 
                }}>
                  {product.description}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}>
                <span style={{ 
                  fontFamily: "var(--font-display)", 
                  fontWeight: 700, 
                  fontSize: "var(--text-xl)", 
                  color: product.price === 0 ? "var(--color-text-muted)" : "var(--color-text-bright)" 
                }}>
                  {product.price === 0 ? "TBA" : `$${product.price}`}
                </span>
                {product.price > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/store/${product.id}`} style={{ textDecoration: "none" }}>
      <TiltCard intensity={6} style={{ height: "100%" }}>
        <Card 
          variant="glass" 
          hoverable
          padding="none"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ 
            height: "100%", 
            position: "relative",
            overflow: "hidden",
            cursor: "pointer"
          }}
        >
          {/* Product image */}
          <div style={{ height: 200, position: "relative", overflow: "hidden", background: "#0A0A0F" }}>
            {!imgLoaded && <Skeleton width="100%" height="100%" borderRadius={0} />}
            <motion.img
              src={productImage}
              alt={product.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              animate={{ scale: hovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imgLoaded ? 1 : 0,
                transition: "opacity 0.3s",
              }}
            />
            {product.badge && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                }}
              >
                <Badge 
                  variant={
                    product.badge === "FLAGSHIP" || product.badge === "PREMIUM" ? "primary" :
                    product.badge === "BEST VALUE" ? "success" :
                    product.badge === "COMING SOON" ? "neutral" :
                    "primary"
                  }
                >
                  {product.badge}
                </Badge>
              </motion.div>
            )}
            {/* Quick View button - visible on hover */}
            {onQuickView && (
              <motion.button
                onClick={handleQuickView}
                animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  pointerEvents: hovered ? "auto" : "none",
                }}
                aria-label={`Quick view ${product.name}`}
              >
                Quick View
              </motion.button>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: "var(--space-5) var(--space-6) var(--space-6)" }}>
            <h3 style={{ 
              fontFamily: "var(--font-display)", 
              fontWeight: 600, 
              fontSize: "var(--text-lg)", 
              color: "var(--color-text-bright)", 
              marginBottom: "var(--space-2)" 
            }}>
              {product.name}
            </h3>
            <p style={{ 
              color: "var(--color-text-muted)", 
              fontSize: "var(--text-sm)", 
              lineHeight: "var(--leading-relaxed)", 
              marginBottom: "var(--space-4)", 
              display: "-webkit-box", 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: "vertical", 
              overflow: "hidden" 
            }}>
              {product.description}
            </p>

            {/* Features */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1_5)", marginBottom: "var(--space-4)" }}>
              {product.features.slice(0, 3).map((f) => (
                <span 
                  key={f} 
                  style={{ 
                    fontSize: "var(--text-xs)", 
                    color: "var(--color-text-muted)", 
                    background: "rgba(139, 92, 246, 0.06)", 
                    border: "1px solid rgba(139, 92, 246, 0.1)", 
                    padding: "var(--space-1) var(--space-2_5)", 
                    borderRadius: "var(--radius-full)" 
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Price row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)" }}>
              <span style={{ 
                fontFamily: "var(--font-display)", 
                fontWeight: 700, 
                fontSize: "var(--text-2xl)", 
                color: product.price === 0 ? "var(--color-text-muted)" : "var(--color-text-bright)" 
              }}>
                {product.price === 0 ? "TBA" : `$${product.price}`}
              </span>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                {product.price > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddToCart}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add
                  </Button>
                )}
                <motion.span 
                  style={{ 
                    fontSize: "var(--text-sm)", 
                    fontWeight: 500, 
                    color: "var(--color-electric-purple)",
                    whiteSpace: "nowrap"
                  }} 
                  whileHover={{ x: 4 }}
                >
                  Details →
                </motion.span>
              </div>
            </div>
          </div>
        </Card>
      </TiltCard>
    </Link>
  );
}
