'use client';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { getFeaturedProducts, categories, products } from '@/lib/products';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Link from 'next/link';

const ProductOrb3D = dynamic(() => import('@/components/ProductOrb3D'), { ssr: false });

function FeaturedSection() {
  const featured = getFeaturedProducts();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      if (!sectionRef.current) return;
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      const cards = sectionRef.current.querySelectorAll('.featured-card');
      gsap.fromTo(cards, { opacity: 0, y: 80 }, {
        opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      });
    };
    init().catch(console.error);
  }, []);

  const colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <section style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          Flagship Products
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          color: '#E8E8E8',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Built from real systems.<br />
          <span style={{ color: '#555' }}>Not templates from templates.</span>
        </h2>
      </div>

      <div ref={sectionRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {featured.map((product, i) => (
          <Link key={product.id} href={`/store/${product.id}`} style={{ textDecoration: 'none' }} className="featured-card">
            <div style={{
              background: '#0a0a0a',
              border: `1px solid ${colors[i % colors.length]}15`,
              borderRadius: 16,
              overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
              (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px ${colors[i % colors.length]}15`;
              (e.currentTarget as HTMLElement).style.borderColor = `${colors[i % colors.length]}30`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.borderColor = `${colors[i % colors.length]}15`;
            }}
            >
              {/* Product Image or 3D Orb fallback */}
              <div style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                ) : (
                  <ProductOrb3D color={colors[i % colors.length]} height={240} />
                )}
                {product.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: 16,
                    padding: '4px 10px', borderRadius: 4,
                    background: colors[i], color: '#fff',
                    fontSize: '0.58rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {product.badge}
                  </div>
                )}
              </div>

              <div style={{ padding: '24px 24px 28px' }}>
                <span style={{ fontSize: '1.8rem' }}>{product.emoji}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.2rem', fontWeight: 700,
                  color: '#E8E8E8', marginTop: 12, marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}>
                  {product.name}
                </h3>
                <p style={{
                  fontSize: '0.8rem', color: '#777', lineHeight: 1.5,
                  fontFamily: 'var(--font-body)', marginBottom: 20,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                }}>
                  {product.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem', fontWeight: 800, color: '#E8E8E8',
                  }}>
                    ${product.price}
                  </span>
                  <span style={{
                    fontSize: '0.7rem', color: colors[i],
                    fontWeight: 600, letterSpacing: '0.05em',
                    fontFamily: 'var(--font-body)',
                  }}>
                    View Details →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
      <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: 12 }}>
        See It Running
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.03em', marginBottom: 16 }}>
        Don't take our word for it.
      </h2>
      <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
        Click through the full dashboard. 6 agents, 7 farms, real-time analytics. No signup required.
      </p>
      <a href="https://ai-trading-dashboard-demo.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: '1px solid #8B5CF620', cursor: 'pointer', transition: 'all 0.3s' }}>
          <img src="/images/products/focused/dashboard-hero-overview.jpg" alt="AI Trading Dashboard Demo" style={{ width: '100%', display: 'block' }} />
        </div>
      </a>
      <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="https://ai-trading-dashboard-demo.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '16px 40px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Try Live Demo →
          </button>
        </a>
        <a href="/store/trading-dashboard-template" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '16px 40px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#E8E8E8', fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer' }}>
            Get Full Source — $149
          </button>
        </a>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: '$184K', label: 'Demo Portfolio Value', color: '#10B981' },
    { value: '6', label: 'Autonomous AI Agents', color: '#8B5CF6' },
    { value: '2,847', label: 'Trades Executed', color: '#F59E0B' },
    { value: '68%', label: 'Win Rate', color: '#EC4899' },
  ];

  return (
    <section style={{
      padding: '60px 24px',
      maxWidth: 1400,
      margin: '0 auto',
      borderTop: '1px solid #111',
      borderBottom: '1px solid #111',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
        {stats.map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 800, color: s.color,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: 8,
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: '0.72rem', color: '#555',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              fontFamily: 'var(--font-body)',
            }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CategoriesSection() {
  return (
    <section style={{ padding: '80px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          Browse by Category
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
          fontWeight: 800, color: '#E8E8E8',
          letterSpacing: '-0.03em',
        }}>
          What are you building?
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {categories.map(cat => {
          const count = products.filter(p => p.category === cat.id).length;
          return (
            <Link key={cat.id} href={`/store?category=${cat.id}`} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ y: -4, borderColor: cat.color + '40' }}
                style={{
                  padding: '28px 24px',
                  borderRadius: 12,
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.3s',
                }}
              >
                <span style={{ fontSize: '2rem' }}>{cat.emoji}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.05rem', fontWeight: 700,
                  color: '#E8E8E8', marginTop: 12, marginBottom: 6,
                }}>
                  {cat.label}
                </h3>
                <p style={{
                  fontSize: '0.78rem', color: '#666', lineHeight: 1.4,
                  fontFamily: 'var(--font-body)', marginBottom: 12,
                }}>
                  {cat.description}
                </p>
                <span style={{
                  fontSize: '0.68rem', color: cat.color,
                  fontWeight: 600, fontFamily: 'var(--font-body)',
                }}>
                  {count} products →
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section style={{
      padding: '80px 24px 100px',
      maxWidth: 900,
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 800, color: '#E8E8E8',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 20,
        }}
      >
        Your trading system
        <br />
        <span style={{ color: '#8B5CF6' }}>is one deploy away.</span>
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '0.95rem', color: '#666', lineHeight: 1.6,
          fontFamily: 'var(--font-body)', marginBottom: 40,
        }}
      >
        Every template ships with full source code, documentation, and setup wizard.
      </motion.p>
      <Link href="/store" style={{ textDecoration: 'none' }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '18px 48px', borderRadius: 8,
            border: 'none', background: '#8B5CF6',
            color: '#fff', fontFamily: 'var(--font-display)',
            fontSize: '0.88rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Explore the Store
        </motion.button>
      </Link>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#000' }}>
        <Hero />
        <FeaturedSection />
        <DemoSection />
        <StatsSection />
        <CategoriesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
