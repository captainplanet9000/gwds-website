'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';

gsap.registerPlugin(ScrollTrigger);

const values = [
  {
    emoji: '🔨',
    title: 'We Ship What We Use',
    desc: "Nothing in the store is theoretical. Every trading agent, every dashboard component, every automation pipeline was built for our own systems first. You're buying source code that runs in production — not mockups or demos.",
  },
  {
    emoji: '📐',
    title: 'Architecture, Not Promises',
    desc: "We sell engineering. Clean source code, modular architecture, real integration patterns. What you do with it is up to you. We don't sell performance claims or guaranteed returns — we sell the building blocks.",
  },
  {
    emoji: '🔓',
    title: 'Full Source, No Lock-In',
    desc: "Every product ships as complete, readable source code. No obfuscation, no proprietary runtimes, no subscription gates. Buy it, own it, modify it, deploy it wherever you want.",
  },
  {
    emoji: '⚡',
    title: 'One Founder, Full Stack',
    desc: 'Cival Systems is one person with AI leverage — no layers, no handoffs, no waiting. Trading systems, 3D production, web apps, content pipelines. Same hands touching every line of code and every frame of video.',
  },
];

const tools = [
  { name: 'Next.js', category: 'web' },
  { name: 'TypeScript', category: 'web' },
  { name: 'React', category: 'web' },
  { name: 'Supabase', category: 'web' },
  { name: 'Vercel', category: 'web' },
  { name: 'Node.js', category: 'web' },
  { name: 'Houdini', category: '3d' },
  { name: 'DaVinci Resolve', category: '3d' },
  { name: 'ComfyUI', category: 'ai' },
  { name: 'Higgsfield', category: 'ai' },
  { name: 'Claude', category: 'ai' },
  { name: 'Hyperliquid', category: 'trading' },
  { name: 'Arbitrum', category: 'trading' },
  { name: 'Solana', category: 'trading' },
];

const projects = [
  {
    name: 'Cival Systems',
    role: 'Autonomous Trading Platform',
    desc: 'Multi-agent trading system with 6+ specialized strategies, real-time position management, and a full Next.js dashboard. Runs on Hyperliquid mainnet. The architecture behind most of our store products.',
    tags: ['Next.js', 'TypeScript', 'Supabase', 'Hyperliquid'],
  },
  {
    name: 'Cival Content Engine',
    role: 'AI-Powered Production Pipeline',
    desc: 'End-to-end content generation across 6 TikTok channels — from script generation to voice synthesis to video rendering. Automated pipelines that turn ideas into published content with minimal manual intervention.',
    tags: ['Remotion', 'ElevenLabs', 'ComfyUI', 'Higgsfield'],
  },
  {
    name: 'The 400 Club',
    role: 'NFT Collection',
    desc: '9,400-piece generative art collection on Ethereum. Custom smart contracts, trait generation systems, and community infrastructure built from scratch.',
    tags: ['Solidity', 'React', 'IPFS', 'Ethereum'],
  },
];

const legend = [
  { color: 'var(--color-neutral-600)', label: 'Web' },
  { color: 'var(--color-neutral-800)', label: '3D / Video' },
  { color: 'var(--color-accent)', label: 'AI' },
  { color: 'var(--color-accent-2)', label: 'Trading' },
];

function toolDotColor(category: string) {
  if (category === 'trading') return 'var(--color-accent-2)';
  if (category === 'ai') return 'var(--color-accent)';
  if (category === '3d') return 'var(--color-neutral-800)';
  return 'var(--color-neutral-500)';
}

export default function AboutPage() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    sectionRefs.current.forEach((section) => {
      if (!section) return;

      gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });
  }, []);

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '100vh' }}>
        {/* Hero */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          style={{
            padding: '150px 24px 100px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: 18,
              }}
            >
              About Cival Systems
            </div>
            <h1
              style={{
                fontSize: 'clamp(40px, 7vw, 84px)',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                margin: '0 0 24px',
              }}
            >
              Built Solo.
              <br />
              <span style={{ color: 'var(--color-accent)' }}>Shipped Real.</span>
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px, 1.4vw, 19px)',
                lineHeight: 1.7,
                color: 'var(--color-neutral-800)',
                maxWidth: '700px',
                margin: '0 auto 20px',
              }}
            >
              Cival Systems is a one-person operation building at the intersection
              of trading systems, AI automation, and 3D production. Everything in the store
              started as an internal tool — built to solve a real problem, tested with real
              capital, then packaged as source code for other developers and traders.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12.5,
                letterSpacing: '0.05em',
                color: 'var(--color-neutral-600)',
              }}
            >
              Founded by Anthony Lee&nbsp;&nbsp;·&nbsp;&nbsp;Los Angeles, CA&nbsp;&nbsp;·&nbsp;&nbsp;Est. 2024
            </p>
          </div>
        </section>

        {/* Values */}
        <section
          ref={(el) => {
            sectionRefs.current[1] = el;
          }}
          style={{
            padding: '80px 24px',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div
              className="values-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '28px',
              }}
            >
              {values.map((v) => (
                <div
                  key={v.title}
                  style={{
                    padding: '32px',
                    borderRadius: 'calc(var(--radius-lg) * 1.15)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <div style={{ fontSize: '34px', marginBottom: '18px' }}>{v.emoji}</div>
                  <h3
                    style={{
                      fontSize: '21px',
                      letterSpacing: '-0.01em',
                      margin: '0 0 12px',
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14.5px',
                      lineHeight: 1.7,
                      color: 'var(--color-neutral-800)',
                      margin: 0,
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
          }}
          style={{
            padding: '80px 24px',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                letterSpacing: '-0.018em',
                marginBottom: '14px',
                textAlign: 'center',
              }}
            >
              The Projects
            </h2>
            <p
              style={{
                fontSize: '15.5px',
                lineHeight: 1.6,
                color: 'var(--color-neutral-700)',
                textAlign: 'center',
                marginBottom: '48px',
                maxWidth: '560px',
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Active systems that drive the studio — and the source of everything in the store.
            </p>
            <div className="projects-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {projects.map((project) => (
                <div
                  key={project.name}
                  style={{
                    padding: '36px',
                    borderRadius: 'calc(var(--radius-lg) * 1.15)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <h3
                      style={{
                        fontSize: '22px',
                        margin: 0,
                      }}
                    >
                      {project.name}
                    </h3>
                    <span className="tag tag-accent">{project.role}</span>
                  </div>
                  <p
                    style={{
                      fontSize: '14.5px',
                      lineHeight: 1.7,
                      color: 'var(--color-neutral-800)',
                      marginBottom: '18px',
                    }}
                  >
                    {project.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {project.tags.map((tag) => (
                      <span key={tag} className="tag tag-neutral">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section
          ref={(el) => {
            sectionRefs.current[3] = el;
          }}
          style={{
            padding: '80px 24px',
            borderTop: '1px solid var(--color-divider)',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                letterSpacing: '-0.018em',
                marginBottom: '40px',
              }}
            >
              The Stack
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '999px',
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-surface)',
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: toolDotColor(tool.category) }} />
                  {tool.name}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '28px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {legend.map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-neutral-600)',
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          .values-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .projects-list > div {
            padding: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
