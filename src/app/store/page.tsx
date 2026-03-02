'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { products, categories, type ProductCategory } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? products.filter(p => p.category !== 'nfts')
    : products.filter(p => p.category === activeCategory);

  const visibleCategories = categories.filter(c => c.id !== 'nfts');

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 100, minHeight: '100vh', background: 'var(--color-void-black)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px 100px' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: 'oklch(0.98 0 0)',
              marginBottom: 16,
            }}>
              The <span className="gradient-plasma">Store</span>
            </h1>
            <p style={{ color: 'oklch(0.55 0.01 250)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
              Digital products built at the intersection of AI, design, and trading.
            </p>
          </motion.div>

          {/* Category filter */}
          <div style={{
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: 48,
          }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: activeCategory === 'all'
                  ? '1px solid oklch(0.65 0.29 295)'
                  : '1px solid oklch(0.25 0.05 270 / 0.5)',
                background: activeCategory === 'all'
                  ? 'oklch(0.65 0.29 295 / 0.15)'
                  : 'transparent',
                color: activeCategory === 'all'
                  ? 'oklch(0.85 0.20 295)'
                  : 'oklch(0.60 0.01 250)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              All
            </button>
            {visibleCategories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 999,
                  border: activeCategory === cat.id
                    ? '1px solid oklch(0.65 0.29 295)'
                    : '1px solid oklch(0.25 0.05 270 / 0.5)',
                  background: activeCategory === cat.id
                    ? 'oklch(0.65 0.29 295 / 0.15)'
                    : 'transparent',
                  color: activeCategory === cat.id
                    ? 'oklch(0.85 0.20 295)'
                    : 'oklch(0.60 0.01 250)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 28,
          }}>
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid oklch(0.65 0.29 295 / 0.15)',
                  background: 'oklch(0.10 0.01 270 / 0.8)',
                  backdropFilter: 'blur(20px)',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.25s ease',
                }}
                whileHover={{ y: -6 }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'oklch(0.65 0.29 295 / 0.4)';
                  el.style.boxShadow = '0 0 40px oklch(0.65 0.29 295 / 0.2), 0 20px 40px oklch(0 0 0 / 0.4)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = 'oklch(0.65 0.29 295 / 0.15)';
                  el.style.boxShadow = 'none';
                }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', color: 'oklch(0.50 0.01 250)', marginTop: 60 }}>
              No products in this category yet.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
