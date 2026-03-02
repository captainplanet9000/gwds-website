'use client';
import { useRef } from 'react';
import { products } from '@/lib/products';
import ProductCard from './ProductCard';
import { motion, useInView } from 'framer-motion';
import { AnimatedWaveBorder } from './WaveDivider';

export default function FeaturedProducts() {
  const featured = products.filter((p) => p.badge);
  const titleRef = useRef(null);
  const isInView = useInView(titleRef, { once: true });

  return (
    <section
      style={{
        padding: '100px 24px',
        maxWidth: 1280,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Section header */}
      <div ref={titleRef} style={{ textAlign: 'center', marginBottom: 64 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              borderRadius: 999,
              border: '1px solid oklch(0.82 0.18 85 / 0.3)',
              background: 'oklch(0.82 0.18 85 / 0.06)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'oklch(0.82 0.18 85)',
              marginBottom: 20,
            }}
          >
            Top Picks
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Featured{' '}
            <span className="gradient-text">Products</span>
          </h2>
          <p style={{ color: 'oklch(0.55 0.01 250)', fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
            Our most popular and highest-rated digital products — tested in the wild.
          </p>
        </motion.div>
      </div>

      {/* Wave accent */}
      <AnimatedWaveBorder color="oklch(0.82 0.18 85)" opacity={0.15} />

      {/* Product grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 28,
          marginTop: 40,
        }}
      >
        {featured.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.12 }}
          >
            {/* Wrapper with glow + wave texture on hover */}
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid oklch(0.65 0.29 295 / 0.15)',
                background: 'oklch(0.10 0.01 270 / 0.8)',
                backdropFilter: 'blur(20px)',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
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
              {/* Background sine wave decoration */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 200,
                  height: 100,
                  opacity: 0.08,
                  pointerEvents: 'none',
                }}
              >
                <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
                  <path
                    d="M0,50 C33,10 67,90 100,50 C133,10 167,90 200,50"
                    stroke="oklch(0.65 0.29 295)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M0,60 C33,20 67,100 100,60 C133,20 167,100 200,60"
                    stroke="oklch(0.75 0.15 195)"
                    strokeWidth="1"
                    fill="none"
                  />
                </svg>
              </div>

              <ProductCard product={product} />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
