'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import WaveCanvas from './WaveCanvas';

const panels = [
  {
    id: 'ai',
    label: '01 / AI TEMPLATES',
    headline: 'Prompt Engineering\nat Scale',
    sub: 'Ready-to-deploy AI workflow blueprints, system prompt libraries, and LLM integration kits for production apps.',
    accent: 'oklch(0.75 0.15 195)',
    bg: 'oklch(0.09 0.015 230)',
    waves: [
      { freq: 0.006, amp: 70, speed: 0.015, color: 'oklch(0.75 0.15 195 / 0.4)', phase: 0 },
      { freq: 0.011, amp: 40, speed: 0.025, color: 'oklch(0.65 0.29 295 / 0.3)', phase: 2 },
    ],
  },
  {
    id: 'trading',
    label: '02 / TRADING TOOLS',
    headline: 'Algorithmic\nEdge, Delivered',
    sub: 'Autonomous agent dashboards, strategy kits, and live execution tools built on Hyperliquid, Binance, and Arbitrum.',
    accent: 'oklch(0.70 0.18 145)',
    bg: 'oklch(0.09 0.01 160)',
    waves: [
      { freq: 0.014, amp: 30, speed: 0.04, color: 'oklch(0.70 0.18 145 / 0.5)', phase: 0 },
      { freq: 0.007, amp: 55, speed: 0.02, color: 'oklch(0.82 0.18 85 / 0.25)', phase: 3 },
    ],
  },
  {
    id: 'animations',
    label: '03 / ANIMATIONS & 3D',
    headline: 'Motion Design\nUnleashed',
    sub: 'Claymation loops, 3D renders, Houdini VEX packs, and animated content ready for TikTok, ads, and creative projects.',
    accent: 'oklch(0.82 0.18 85)',
    bg: 'oklch(0.09 0.015 300)',
    waves: [
      { freq: 0.008, amp: 65, speed: 0.018, color: 'oklch(0.82 0.18 85 / 0.4)', phase: 1 },
      { freq: 0.015, amp: 35, speed: 0.03, color: 'oklch(0.65 0.29 295 / 0.3)', phase: 4 },
    ],
  },
];

function StickyPanel({ panel, progress }: { panel: typeof panels[0]; progress: any }) {
  const opacity = useTransform(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(progress, [0, 0.2, 0.8, 1], [60, 0, 0, -60]);
  const scale = useTransform(progress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: panel.bg,
    }}>
      {/* Animated wave bg */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
        <WaveCanvas waves={panel.waves as any} centerY={0.5} />
      </div>

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${panel.accent}1A, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <motion.div
        style={{ opacity, y, scale, textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1, maxWidth: 800 }}
      >
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: panel.accent,
          textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          {panel.label}
        </p>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem, 7vw, 6rem)',
          fontWeight: 800,
          color: 'oklch(0.98 0 0)',
          margin: '0 0 28px',
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          whiteSpace: 'pre-line',
        }}>
          {panel.headline}
        </h2>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
          color: 'oklch(0.68 0.01 250)',
          lineHeight: 1.7,
          maxWidth: 560,
          margin: '0 auto 40px',
        }}>
          {panel.sub}
        </p>

        <a href={`/${panel.id}`} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 32px',
          border: `1px solid ${panel.accent}`,
          borderRadius: 8,
          color: panel.accent,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          letterSpacing: '0.1em',
          textDecoration: 'none',
          background: `${panel.accent}0D`,
          transition: 'background 0.2s, box-shadow 0.2s',
          textTransform: 'uppercase',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = `${panel.accent}1A`;
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 24px ${panel.accent}33`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = `${panel.accent}0D`;
          (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
        }}
        >
          Explore →
        </a>
      </motion.div>
    </div>
  );
}

export default function StickySections() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const panel0 = useTransform(scrollYProgress, [0, 0.33], [0, 1]);
  const panel1 = useTransform(scrollYProgress, [0.25, 0.66], [0, 1]);
  const panel2 = useTransform(scrollYProgress, [0.55, 1], [0, 1]);

  const progresses = [panel0, panel1, panel2];

  return (
    <div ref={containerRef} style={{ height: `${panels.length * 200}vh`, position: 'relative' }}>
      {panels.map((panel, i) => (
        <StickyPanel key={panel.id} panel={panel} progress={progresses[i]} />
      ))}
    </div>
  );
}
