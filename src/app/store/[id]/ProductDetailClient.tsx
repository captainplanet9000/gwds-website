'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

const categoryColors: Record<string, string> = {
  templates: '#8B5CF6',
  trading: '#10B981',
  prompts: '#F59E0B',
  wallpapers: '#EC4899',
  nfts: '#6366F1',
  animations: '#EF4444',
};

export default function ProductDetailClient({ product, related, category }: { product: any; related: any[]; category: any }) {
  const { dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const accent = categoryColors[product.category] || '#8B5CF6';

  const addToCart = () => {
    dispatch({ type: 'ADD_ITEM', product });
    dispatch({ type: 'OPEN_CART' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productImage = product.image || `/images/products/${product.id}.png`;

  // GSAP SplitText on headline
  useEffect(() => {
    const init = async () => {
      if (!headlineRef.current) return;
      const { gsap } = await import('gsap');
      const { SplitText } = await import('gsap/SplitText');
      gsap.registerPlugin(SplitText);
      const split = new SplitText(headlineRef.current, { type: 'chars,words' });
      gsap.from(split.chars, {
        opacity: 0, y: 40, stagger: 0.02, duration: 0.6, ease: 'power3.out', delay: 0.2,
      });
      return () => split.revert();
    };
    init().catch(console.error);
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 100 }}>
        {/* Breadcrumb */}
        <div style={{ padding: '0 5vw', maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '0.72rem', color: '#555', fontFamily: 'var(--font-body)', marginBottom: 40, display: 'flex', gap: 8, alignItems: 'center' }}
          >
            <Link href="/store" style={{ color: '#666', textDecoration: 'none' }}>Store</Link>
            <span>→</span>
            <Link href={`/store?category=${product.category}`} style={{ color: accent, textDecoration: 'none', textTransform: 'capitalize' }}>
              {product.category}
            </Link>
            <span>→</span>
            <span style={{ color: '#888' }}>{product.name}</span>
          </motion.div>
        </div>

        {/* Hero section — split layout */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4vw',
          padding: '0 5vw 6vw',
          maxWidth: 1200,
          margin: '0 auto',
          alignItems: 'start',
        }}>
          {/* Left — product visual */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div style={{
              aspectRatio: '4/3',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${accent}10 0%, #0a0a0a 50%, ${accent}08 100%)`,
              border: `1px solid ${accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <span style={{ fontSize: '6rem' }}>{product.emoji}</span>

              {/* Decorative grid */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `linear-gradient(${accent}06 1px, transparent 1px), linear-gradient(90deg, ${accent}06 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
              }} />

              {product.badge && (
                <div style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  padding: '6px 14px',
                  borderRadius: 6,
                  background: accent,
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {product.badge}
                </div>
              )}
            </div>

            {/* Tech stack */}
            {product.techStack && product.techStack.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
                {product.techStack.map((tech: string) => (
                  <span key={tech} style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    background: '#111',
                    border: '1px solid #222',
                    color: '#888',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right — product info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: 'sticky', top: 120 }}
          >
            {/* Category */}
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 4,
              background: accent + '15',
              color: accent,
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-body)',
              marginBottom: 16,
            }}>
              {category?.emoji} {product.category}
            </div>

            {/* Title */}
            <h1
              ref={headlineRef}
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: '#E8E8E8',
                marginBottom: 20,
              }}
            >
              {product.name}
            </h1>

            {/* Price */}
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 800,
              color: product.price === 0 ? '#666' : '#E8E8E8',
              marginBottom: 24,
              letterSpacing: '-0.02em',
            }}>
              {product.price === 0 ? 'Coming Soon' : `$${product.price}.00`}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '0.9rem',
              color: '#999',
              lineHeight: 1.7,
              marginBottom: 32,
              fontFamily: 'var(--font-body)',
            }}>
              {product.description}
            </p>

            {/* Add to cart */}
            {product.price > 0 && (
              <button
                onClick={addToCart}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  borderRadius: 8,
                  border: 'none',
                  background: added ? '#10B981' : accent,
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginBottom: 12,
                }}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
            )}

            {product.price > 0 && (
              <Link href="/checkout" style={{ textDecoration: 'none' }}>
                <button
                  onClick={() => { dispatch({ type: 'ADD_ITEM', product }); }}
                  style={{
                    width: '100%',
                    padding: '16px 32px',
                    borderRadius: 8,
                    border: `1px solid ${accent}40`,
                    background: 'transparent',
                    color: '#E8E8E8',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  Buy Now
                </button>
              </Link>
            )}

            {/* Guarantee */}
            <div style={{
              marginTop: 24,
              padding: '16px',
              borderRadius: 8,
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { icon: '⚡', text: 'Instant download after purchase' },
                  { icon: '📂', text: 'Full source code included' },
                  { icon: '🔄', text: 'Free updates for 1 year' },
                  { icon: '💬', text: 'Discord community access' },
                ].map(item => (
                  <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.78rem', color: '#888', fontFamily: 'var(--font-body)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features section */}
        <section style={{ padding: '0 5vw 6vw', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '4vw' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#E8E8E8',
              marginBottom: 32,
              letterSpacing: '-0.02em',
            }}>
              What&apos;s Included
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {product.features.map((feature: string, i: number) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderRadius: 8,
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                  }}
                >
                  <span style={{ color: accent, fontSize: '0.85rem' }}>✓</span>
                  <span style={{ fontSize: '0.82rem', color: '#bbb', fontFamily: 'var(--font-body)' }}>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Long description */}
        {product.longDescription && (
          <section style={{ padding: '0 5vw 6vw', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '4vw' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#E8E8E8',
                marginBottom: 24,
                letterSpacing: '-0.02em',
              }}>
                About This Product
              </h2>
              <div style={{
                fontSize: '0.88rem',
                color: '#999',
                lineHeight: 1.8,
                fontFamily: 'var(--font-body)',
                whiteSpace: 'pre-wrap',
              }}>
                {product.longDescription.split('\n').map((line: string, i: number) => {
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} style={{ color: '#E8E8E8', fontWeight: 700, fontSize: '1rem', margin: '24px 0 12px', fontFamily: 'var(--font-display)' }}>{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span style={{ color: accent }}>•</span><span>{line.slice(2)}</span></div>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} style={{ marginBottom: 8 }}>{line}</p>;
                })}
              </div>
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section style={{ padding: '0 5vw 8vw', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '4vw' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#888',
                marginBottom: 24,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.85rem',
              }}>
                Similar Products
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {related.map(p => (
                  <Link key={p.id} href={`/store/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: 20,
                      borderRadius: 12,
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: '2rem' }}>{p.emoji}</span>
                        <div>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E8E8', marginBottom: 4 }}>{p.name}</h3>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#888' }}>
                            {p.price === 0 ? 'Free' : `$${p.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
