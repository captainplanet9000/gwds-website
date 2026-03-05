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
        <div style={{ padding: '0 40px', maxWidth: 1200, margin: '0 auto' }}>
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
        <section className="product-hero-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          padding: '0 40px 48px',
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
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
              ) : (
                <span style={{ fontSize: '6rem' }}>{product.emoji}</span>
              )}

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
                  onClick={() => { dispatch({ type: 'CLEAR_CART' }); dispatch({ type: 'ADD_ITEM', product }); }}
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

            {/* Deploy with Vercel CTA — only for trading dashboard */}
            {product.demoUrl && product.id === 'trading-dashboard-template' && (
              <a
                href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcaptainplanet9000%2Fai-trading-dashboard&env=NEXT_PUBLIC_MAIN_WALLET_ADDRESS,MAIN_WALLET_PRIVATE_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,OPENROUTER_API_KEY&envDescription=Required%20API%20keys%20for%20the%20trading%20dashboard&envLink=https%3A%2F%2Fgithub.com%2Fcaptainplanet9000%2Fai-trading-dashboard%2Fblob%2Fmain%2Fdocs%2FSETUP.md&project-name=ai-trading-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '14px 32px',
                  borderRadius: 8,
                  border: '1px solid #333',
                  background: '#000',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.03em',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginTop: 12,
                }}
              >
                <svg height="16" viewBox="0 0 76 65" fill="white"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
                Deploy with Vercel — Free
              </a>
            )}

            {/* Live Demo */}
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '18px 32px',
                  borderRadius: 8,
                  border: `1px solid ${accent}40`,
                  background: `linear-gradient(135deg, ${accent}20 0%, ${accent}05 100%)`,
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginTop: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${accent}30 0%, ${accent}15 100%)`;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${accent}20 0%, ${accent}05 100%)`;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>▶</span>
                <span>View Live Demo</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>↗</span>
              </a>
            )}

            {/* View source on GitHub */}
            {product.id === 'trading-dashboard-template' && (
              <a
                href="https://github.com/captainplanet9000/ai-trading-dashboard"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '12px 32px',
                  borderRadius: 8,
                  border: '1px solid #222',
                  background: 'transparent',
                  color: '#888',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-body)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginTop: 8,
                }}
              >
                View source on GitHub ↗
              </a>
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

        {/* Screenshot Gallery */}
        {product.images && product.images.length > 1 && (
          <section style={{ padding: '0 40px 48px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#E8E8E8',
                marginBottom: 24,
                letterSpacing: '-0.02em',
              }}>
                📸 Screenshots
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 16,
              }}>
                {product.images.map((img: string, i: number) => {
                  const label = img.split('/').pop()?.replace('dashboard-', '').replace('.jpg', '').replace(/-/g, ' ') || '';
                  return (
                    <motion.div
                      key={img}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `1px solid ${accent}20`,
                        background: '#0a0a0a',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                      whileHover={{ scale: 1.02, borderColor: accent + '50' }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${label}`}
                        style={{
                          width: '100%',
                          height: 220,
                          objectFit: 'cover',
                          objectPosition: 'top',
                          display: 'block',
                        }}
                      />
                      <div style={{
                        padding: '10px 14px',
                        fontSize: '0.72rem',
                        color: '#888',
                        fontFamily: 'var(--font-body)',
                        textTransform: 'capitalize',
                        fontWeight: 500,
                      }}>
                        {label}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Features section */}
        <section style={{ padding: '0 40px 48px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
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
          <section style={{ padding: '0 40px 48px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
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
                  // Helper function to parse inline markdown links [text](url)
                  const parseLinks = (text: string) => {
                    const parts: (string | JSX.Element)[] = [];
                    let lastIndex = 0;
                    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                    let match;
                    
                    while ((match = linkRegex.exec(text)) !== null) {
                      // Add text before the link
                      if (match.index > lastIndex) {
                        parts.push(text.substring(lastIndex, match.index));
                      }
                      // Add the link
                      parts.push(
                        <a
                          key={`link-${i}-${match.index}`}
                          href={match[2]}
                          style={{ color: accent, textDecoration: 'underline' }}
                        >
                          {match[1]}
                        </a>
                      );
                      lastIndex = match.index + match[0].length;
                    }
                    
                    // Add remaining text
                    if (lastIndex < text.length) {
                      parts.push(text.substring(lastIndex));
                    }
                    
                    return parts.length > 0 ? parts : text;
                  };

                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h3 key={i} style={{ color: '#E8E8E8', fontWeight: 700, fontSize: '1rem', margin: '24px 0 12px', fontFamily: 'var(--font-display)' }}>{line.replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}><span style={{ color: accent }}>•</span><span>{parseLinks(line.slice(2))}</span></div>;
                  }
                  if (line.trim() === '') return <br key={i} />;
                  return <p key={i} style={{ marginBottom: 8 }}>{parseLinks(line)}</p>;
                })}
              </div>
            </div>
          </section>
        )}

        {/* Theme Showcase — only for trading dashboard */}
        {product.id === 'trading-dashboard-template' && (
          <section style={{ padding: '0 40px 48px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
                🎨 44 Built-In Themes
              </h2>
              <p style={{ color: '#888', marginBottom: 24, fontSize: 16, lineHeight: 1.6 }}>
                Switch themes instantly. From dark hacker aesthetics to clean minimalist designs — make the dashboard feel like yours. Need a custom branded theme for your fund? We offer theme design as a service.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
                {[
                  { name: 'Cyberpunk', colors: ['#0a0a0a', '#f0e68c', '#ff00ff', '#00ffff'] },
                  { name: 'Cosmic Night', colors: ['#0d0d2b', '#6366f1', '#a855f7', '#818cf8'] },
                  { name: 'Northern Lights', colors: ['#0a1628', '#22d3ee', '#34d399', '#06b6d4'] },
                  { name: 'Midnight Bloom', colors: ['#0f0f23', '#ec4899', '#f43f5e', '#fb7185'] },
                  { name: 'Darkmatter', colors: ['#000000', '#22c55e', '#16a34a', '#4ade80'] },
                  { name: 'Ocean Breeze', colors: ['#0c1929', '#0ea5e9', '#38bdf8', '#7dd3fc'] },
                  { name: 'Mocha Mousse', colors: ['#1c1210', '#d4a574', '#b8860b', '#deb887'] },
                  { name: 'Retro Arcade', colors: ['#1a0a2e', '#ff6b35', '#f7c948', '#e84393'] },
                  { name: 'Neo Brutalism', colors: ['#fffef0', '#000000', '#ff5733', '#ffc300'] },
                  { name: 'Sage Garden', colors: ['#0f1a0f', '#4ade80', '#86efac', '#22c55e'] },
                  { name: 'Sunset Horizon', colors: ['#1a0a00', '#f97316', '#fb923c', '#fbbf24'] },
                  { name: 'Clean Slate', colors: ['#fafafa', '#18181b', '#71717a', '#a1a1aa'] },
                  { name: 'Amethyst Haze', colors: ['#1a0a2e', '#a855f7', '#c084fc', '#e9d5ff'] },
                  { name: 'Bold Tech', colors: ['#020617', '#3b82f6', '#60a5fa', '#93c5fd'] },
                  { name: 'Caffeine', colors: ['#1a1209', '#92400e', '#b45309', '#d97706'] },
                  { name: 'Violet Bloom', colors: ['#1a0033', '#8b5cf6', '#a78bfa', '#c4b5fd'] },
                ].map((theme) => (
                  <div key={theme.name} style={{ padding: '12px 10px', borderRadius: 8, border: '1px solid #222', background: '#0a0a0a', textAlign: 'center', cursor: 'default' }}>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 8 }}>
                      {theme.colors.map((c, i) => (
                        <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: c, border: '1px solid #333' }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>{theme.name}</div>
                  </div>
                ))}
              </div>
              <p style={{ color: '#666', fontSize: 13, textAlign: 'center' }}>
                + 28 more themes included — Catppuccin, Claude, Doom 64, Graphite, Kodama Grove, Notebook, Pastel Dreams, Quantum Rose, Starry Night, Supabase, T3 Chat, Tangerine, Twitter, Vercel, and more.
              </p>
              <div style={{ textAlign: 'center', marginTop: 20, padding: '16px 24px', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', borderRadius: 10, border: '1px solid #2a2a4a' }}>
                <p style={{ color: '#a5b4fc', fontSize: 14, fontWeight: 600, margin: 0 }}>
                  🏢 Need a custom branded theme for your fund or trading desk? <span style={{ color: '#818cf8' }}>Contact us</span> for bespoke theme design.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Plugin System Showcase — only for trading dashboard */}
        {product.id === 'trading-dashboard-template' && (
          <section style={{ padding: '0 40px 48px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>
                🧩 Modular Plugin System
              </h2>
              <p style={{ color: '#888', marginBottom: 24, fontSize: 16, lineHeight: 1.6 }}>
                Start with the base dashboard and add capabilities as you grow. Each add-on drops right in — no code changes needed.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
                {[
                  { name: 'Meme Trading System', price: '$99', emoji: '🐸', desc: 'Automated meme coin discovery, sentiment analysis, and sniper execution', href: '/store/meme-trading-template' },
                  { name: 'Elliott Wave Agent', price: '$199', emoji: '📐', desc: 'AI-powered Elliott Wave pattern detection and autonomous trading', href: '/store/elliott-wave-agent' },
                  { name: 'Darvas Box Indicator', price: '$49', emoji: '📦', desc: 'Classic breakout detection with modern volume confirmation', href: '/store/darvas-indicator' },
                  { name: 'Multi-Strategy Bundle', price: '$399', emoji: '🎯', desc: 'All strategies in one package — the complete trading arsenal', href: '/store/multi-strat-bundle' },
                ].map((addon) => (
                  <a key={addon.name} href={addon.href} style={{ padding: 20, borderRadius: 10, border: '1px solid #222', background: '#0a0a0a', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{addon.emoji}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: '#fff' }}>{addon.name}</div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 8, lineHeight: 1.4 }}>{addon.desc}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6' }}>{addon.price}</div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How to Set Up — only for templates & trading products */}
        {(product.category === 'templates' || product.category === 'trading') && product.price > 0 && (
          <section style={{ padding: '0 40px 48px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
                color: '#E8E8E8', marginBottom: 12, letterSpacing: '-0.02em',
              }}>
                How to Set Up
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#777', fontFamily: 'var(--font-body)', marginBottom: 28, lineHeight: 1.6 }}>
                Get up and running in under 10 minutes. Full documentation included in the download.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  { step: '1', title: 'Download & extract', desc: 'After purchase, download the zip file and extract it to a folder on your machine.' },
                  { step: '2', title: 'Install dependencies', desc: 'Open a terminal in the project folder and run npm install. Everything resolves automatically.' },
                  { step: '3', title: 'Add your API keys', desc: 'Copy .env.example to .env.local and fill in your keys. Each variable is documented inline.' },
                  { step: '4', title: 'Set up the database', desc: 'Create a free Supabase project and run the included SQL migration in the SQL Editor.' },
                  { step: '5', title: 'Launch', desc: 'Run npm run dev and open localhost:3000. A setup wizard walks you through final configuration.' },
                ].map((item) => (
                  <div key={item.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <span style={{
                      minWidth: 32, height: 32, borderRadius: '50%',
                      background: accent, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)',
                      flexShrink: 0,
                    }}>
                      {item.step}
                    </span>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8E8E8', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 28, padding: '16px 20px', borderRadius: 8,
                background: `${accent}08`, border: `1px solid ${accent}20`,
              }}>
                <p style={{ fontSize: '0.78rem', color: '#999', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  <strong style={{ color: '#E8E8E8' }}>What you need:</strong> Node.js 18+, a free{' '}
                  <a href="https://supabase.com" target="_blank" rel="noopener" style={{ color: accent, textDecoration: 'none' }}>Supabase</a> account, and API keys for your exchange and AI provider. Detailed setup guide included in{' '}
                  <code style={{ color: accent, fontSize: '0.72rem' }}>docs/SETUP.md</code>.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* What's inside — for prompts, wallpapers, animations */}
        {(product.category === 'prompts' || product.category === 'wallpapers' || product.category === 'animations') && product.price > 0 && (
          <section style={{ padding: '0 40px 48px', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700,
                color: '#E8E8E8', marginBottom: 12, letterSpacing: '-0.02em',
              }}>
                After Purchase
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                Download the zip file instantly after payment. Extract it and you&apos;re ready to go — all files are organized and labeled. 
                {product.category === 'prompts' && ' Copy and paste prompts directly into ChatGPT, Claude, Midjourney, or any AI tool.'}
                {product.category === 'wallpapers' && ' High-resolution images ready for desktop, mobile, or print.'}
                {product.category === 'animations' && ' Includes source files, style references, and production-ready assets.'}
              </p>
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section style={{ padding: '0 40px 64px', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '40px' }}>
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
