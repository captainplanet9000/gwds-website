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
    title: 'Build First, Sell Second',
    desc: "We don't make products to sell. We build tools for ourselves, battle-test them with real money and real workflows, then package the best ones for you.",
  },
  {
    emoji: '🤖',
    title: 'AI-Native',
    desc: "Every product leverages AI — not as a gimmick, but as a core capability. We use the latest models and workflows because that's genuinely how we work.",
  },
  {
    emoji: '💎',
    title: 'Quality Over Quantity',
    desc: "We'd rather ship 5 exceptional products than 50 mediocre ones. Every template has full source code. Every asset is production-ready.",
  },
  {
    emoji: '⚡',
    title: 'One-Person Speed',
    desc: 'No committees, no approvals, no bureaucracy. One founder with AI leverage moves faster than teams of 20. That speed shows up in everything we ship.',
  },
];

const tools = [
  'Next.js',
  'TypeScript',
  'Tailwind',
  'Supabase',
  'Vercel',
  'Houdini',
  'DaVinci',
  'ComfyUI',
  'Higgsfield',
  'Claude',
  'Midjourney',
  'Hyperliquid',
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
              One Studio.
              <br />
              <span style={{ color: 'oklch(0.65 0.29 295)' }}>Infinite Output.</span>
            </h1>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.4vw',
                lineHeight: 1.7,
                color: '#A8A8A8',
              }}
            >
              Gamma Waves Design Studio is a one-person digital products company that punches way
              above its weight. We combine AI, real trading experience, 3D production skills, and
              relentless shipping speed to create products that work — because we use them every day.
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

        {/* Tech Stack */}
        <section
          ref={(el) => {
            sectionRefs.current[2] = el;
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
              Our Stack
            </h2>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2vw',
                justifyContent: 'center',
              }}
            >
              {tools.map((tool) => (
                <div
                  key={tool}
                  style={{
                    padding: '1vw 2vw',
                    border: '1px solid rgba(232, 232, 232, 0.2)',
                    background: '#050505',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '1vw',
                    fontWeight: 500,
                    color: '#E8E8E8',
                  }}
                >
                  {tool}
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
            font-size: 14vw !important;
          }
          h2 {
            font-size: 10vw !important;
          }
          h3 {
            font-size: 6vw !important;
          }
          p {
            font-size: 4vw !important;
          }
          .values-grid {
            grid-template-columns: 1fr !important;
            gap: 8vh !important;
          }
        }
      `}</style>
    </>
  );
}
