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
    desc: 'GWDS is one person with AI leverage — no layers, no handoffs, no waiting. Trading systems, 3D production, web apps, content pipelines. Same hands touching every line of code and every frame of video.',
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
    name: 'GWDS Content Engine',
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
    <>
      <Navbar />
      <main
        style={{
          paddingTop: '15vh',
          minHeight: '100vh',
          background: '#000',
        }}
      >
        {/* Hero */}
        <section
          ref={(el) => {
            sectionRefs.current[0] = el;
          }}
          style={{
            padding: '80px 24px 120px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '8vw',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#E8E8E8',
                marginBottom: '3vw',
              }}
            >
              Built Solo.
              <br />
              <span style={{ color: 'oklch(0.65 0.29 295)' }}>Shipped Real.</span>
            </h1>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.4vw',
                lineHeight: 1.7,
                color: '#A8A8A8',
                maxWidth: '700px',
                margin: '0 auto 2vw',
              }}
            >
              Gamma Waves Design Studio is a one-person operation building at the intersection
              of trading systems, AI automation, and 3D production. Everything in the store
              started as an internal tool — built to solve a real problem, tested with real
              capital, then packaged as source code for other developers and traders.
            </p>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.1vw',
                lineHeight: 1.7,
                color: '#666',
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
            borderTop: '1px solid rgba(232, 232, 232, 0.1)',
          }}
        >
          <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '32px',
              }}
              className="values-grid"
            >
              {values.map((v) => (
                <div key={v.title}>
                  <div style={{ fontSize: '4vw', marginBottom: '2vw' }}>{v.emoji}</div>
                  <h3
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontSize: '2vw',
                      fontWeight: 600,
                      color: '#E8E8E8',
                      marginBottom: '1.5vw',
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '1.1vw',
                      lineHeight: 1.7,
                      color: '#A8A8A8',
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
            borderTop: '1px solid rgba(232, 232, 232, 0.1)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '4vw',
                fontWeight: 700,
                color: '#E8E8E8',
                marginBottom: '2vw',
                textAlign: 'center',
              }}
            >
              The Projects
            </h2>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.2vw',
                lineHeight: 1.7,
                color: '#666',
                textAlign: 'center',
                marginBottom: '5vh',
                maxWidth: '600px',
                margin: '0 auto 5vh',
              }}
            >
              Active systems that drive the studio — and the source of everything in the store.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="projects-list">
              {projects.map((project) => (
                <div
                  key={project.name}
                  style={{
                    padding: '40px',
                    border: '1px solid rgba(232, 232, 232, 0.08)',
                    background: '#080808',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <h3
                      style={{
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '1.8vw',
                        fontWeight: 700,
                        color: '#E8E8E8',
                      }}
                    >
                      {project.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.85vw',
                        color: 'oklch(0.65 0.29 295)',
                        border: '1px solid oklch(0.65 0.29 295 / 0.3)',
                        padding: '4px 12px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.role}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '1.05vw',
                      lineHeight: 1.7,
                      color: '#A8A8A8',
                      marginBottom: '20px',
                    }}
                  >
                    {project.desc}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'DM Sans, sans-serif',
                          fontSize: '0.75vw',
                          color: '#666',
                          border: '1px solid rgba(232, 232, 232, 0.1)',
                          padding: '3px 10px',
                        }}
                      >
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
            borderTop: '1px solid rgba(232, 232, 232, 0.1)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '4vw',
                fontWeight: 700,
                color: '#E8E8E8',
                marginBottom: '5vh',
              }}
            >
              The Stack
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid rgba(232, 232, 232, 0.15)',
                    background: tool.category === 'trading' ? 'rgba(139, 92, 246, 0.06)' :
                               tool.category === 'ai' ? 'rgba(6, 182, 212, 0.06)' :
                               tool.category === '3d' ? 'rgba(245, 158, 11, 0.06)' : '#050505',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.95vw',
                    fontWeight: 500,
                    color: '#E8E8E8',
                  }}
                >
                  {tool.name}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '3vh', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { color: 'rgba(232, 232, 232, 0.5)', label: 'Web' },
                { color: 'rgba(245, 158, 11, 0.7)', label: '3D / Video' },
                { color: 'rgba(6, 182, 212, 0.7)', label: 'AI' },
                { color: 'rgba(139, 92, 246, 0.7)', label: 'Trading' },
              ].map((legend) => (
                <div key={legend.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: legend.color }} />
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.8vw', color: '#666' }}>{legend.label}</span>
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
          h1 {
            font-size: 12vw !important;
          }
          h2 {
            font-size: 8vw !important;
          }
          h3 {
            font-size: 5.5vw !important;
          }
          p {
            font-size: 3.8vw !important;
          }
          .values-grid {
            grid-template-columns: 1fr !important;
            gap: 8vh !important;
          }
          .projects-list > div {
            padding: 24px !important;
          }
        }
      `}</style>
    </>
  );
}
