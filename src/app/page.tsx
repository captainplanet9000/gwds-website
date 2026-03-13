'use client';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { getFeaturedProducts } from '@/lib/products';
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
          <img src="/images/products/dashboard-overview-new.jpg" alt="AI Trading Dashboard Demo" style={{ width: '100%', display: 'block' }} />
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

function IDESection() {
  const ides = [
    { name: 'Cursor', desc: 'AI-native editing', color: '#00D4AA', letter: 'C' },
    { name: 'Windsurf', desc: 'Agentic IDE', color: '#3B82F6', letter: 'W' },
    { name: 'VS Code', desc: 'Industry standard', color: '#007ACC', letter: 'VS' },
    { name: 'Zed', desc: 'Lightning fast', color: '#F59E0B', letter: 'Z' },
    { name: 'WebStorm', desc: 'Full IntelliSense', color: '#00CDD7', letter: 'WS' },
    { name: 'Neovim', desc: 'Terminal power', color: '#57A143', letter: 'NV' },
  ];

  return (
    <section style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B5CF6', marginBottom: 12, fontFamily: 'var(--font-body)' }}>
          Full Source Code
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 800, color: '#E8E8E8',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 20,
        }}>
          Open it in your favorite IDE.<br />
          <span style={{ color: '#8B5CF6' }}>Make it yours.</span>
        </h2>
        <p style={{
          fontSize: '0.95rem', color: '#666', lineHeight: 1.7,
          fontFamily: 'var(--font-body)', maxWidth: 640, margin: '0 auto',
        }}>
          Every product ships as clean TypeScript source code. No lock-in, no black boxes, no compiled binaries.
          Open the project in Cursor, Windsurf, VS Code, or any editor and customize every strategy, every threshold, every UI element.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16, marginBottom: 64 }}>
        {ides.map(ide => (
          <motion.div
            key={ide.name}
            whileHover={{ y: -6, borderColor: ide.color + '50' }}
            style={{
              padding: '28px 20px', borderRadius: 12,
              background: '#0a0a0a', border: '1px solid #1a1a1a',
              textAlign: 'center', cursor: 'default',
              transition: 'box-shadow 0.3s',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: ide.color + '15', border: `1px solid ${ide.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              fontSize: '0.85rem', fontWeight: 800, color: ide.color,
              fontFamily: 'var(--font-mono, monospace)',
            }}>
              {ide.letter}
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.95rem', fontWeight: 700,
              color: '#E8E8E8', marginBottom: 4,
            }}>
              {ide.name}
            </h3>
            <p style={{
              fontSize: '0.7rem', color: '#555',
              fontFamily: 'var(--font-body)',
            }}>
              {ide.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24,
      }}>
        {[
          {
            icon: '\uD83E\uDD16',
            title: 'AI-Assisted Customization',
            desc: 'Open in Cursor or Windsurf and use AI to modify strategies, add indicators, or build entirely new agents. The codebase is structured for AI-assisted development.',
          },
          {
            icon: '\uD83D\uDD27',
            title: 'Full TypeScript Source',
            desc: 'Every line of code \u2014 strategies, risk management, UI components, API routes. No obfuscation, no compiled modules. Read it, modify it, own it.',
          },
          {
            icon: '\u26A1',
            title: '1-Click Setup',
            desc: 'Double-click QUICK-START and the dashboard is running. The script installs dependencies, creates your config, and opens the browser. Deploy to Vercel when ready.',
          },
        ].map(item => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              padding: 32, borderRadius: 14,
              background: '#0a0a0a', border: '1px solid #1a1a1a',
            }}
          >
            <span style={{ fontSize: '2rem' }}>{item.icon}</span>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem', fontWeight: 700,
              color: '#E8E8E8', marginTop: 16, marginBottom: 10,
              letterSpacing: '-0.01em',
            }}>
              {item.title}
            </h3>
            <p style={{
              fontSize: '0.82rem', color: '#777', lineHeight: 1.6,
              fontFamily: 'var(--font-body)',
            }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function DiscordSection() {
  return (
    <section style={{
      padding: '80px 24px',
      maxWidth: 900,
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: 'linear-gradient(135deg, rgba(88,101,242,0.08), rgba(139,92,246,0.08))',
          border: '1px solid rgba(88,101,242,0.2)',
          borderRadius: 16,
          padding: '48px 40px',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>💬</div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
          fontWeight: 800, color: '#E8E8E8',
          letterSpacing: '-0.03em', lineHeight: 1.1,
          marginBottom: 12,
        }}>
          Join the Community
        </h2>
        <p style={{
          fontSize: '0.95rem', color: '#888', lineHeight: 1.7,
          fontFamily: 'var(--font-body)', marginBottom: 32,
          maxWidth: 500, margin: '0 auto 32px',
        }}>
          Get help with setup, share your custom strategies, discuss plugins, and connect with other traders building autonomous systems.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 36px', borderRadius: 8,
                border: 'none', background: '#5865F2',
                color: '#fff', fontFamily: 'var(--font-display)',
                fontSize: '0.85rem', fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <svg width="20" height="15" viewBox="0 0 71 55" fill="none"><path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A26.4 26.4 0 0025.4.3a.2.2 0 00-.2-.1 58.4 58.4 0 00-14.7 4.6.2.2 0 00-.1.1C1.5 18.7-.9 32 .3 45.2v.1a58.7 58.7 0 0017.9 9.1.2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01.1-.4 31 31 0 001.1-.8.2.2 0 01.2 0c11.6 5.3 24.1 5.3 35.5 0a.2.2 0 01.2 0 28 28 0 001.1.9.2.2 0 01.1.3 36.3 36.3 0 01-5.5 2.6.2.2 0 00-.1.4 47.2 47.2 0 003.6 5.8.2.2 0 00.3.1A58.5 58.5 0 0070 45.3v-.1C71.6 30 67.6 16.8 60.1 5a.2.2 0 00-.1 0zM23.7 37.1c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1 6.5 3.2 6.4 7.1c0 3.9-2.8 7.1-6.4 7.1zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1 6.5 3.2 6.4 7.1c0 3.9-2.8 7.1-6.4 7.1z" fill="currentColor"/></svg>
              Join Discord
            </motion.button>
          </a>
          <a href="https://x.com/GWDSofficial" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '14px 36px', borderRadius: 8,
                border: '1px solid #333', background: 'transparent',
                color: '#E8E8E8', fontFamily: 'var(--font-display)',
                fontSize: '0.85rem', fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Follow @GWDSofficial
            </motion.button>
          </a>
        </div>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          {[
            { label: '42 channels', icon: '#' },
            { label: 'Setup support', icon: '🛠️' },
            { label: 'Plugin sharing', icon: '🔌' },
            { label: 'Strategy talk', icon: '📊' },
          ].map(item => (
            <span key={item.label} style={{ fontSize: '0.78rem', color: '#666', fontFamily: 'var(--font-body)' }}>
              {item.icon} {item.label}
            </span>
          ))}
        </div>
      </motion.div>
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
        Full TypeScript source. Open in Cursor, Windsurf, or VS Code. Customize everything.
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
        <IDESection />
        <DiscordSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}