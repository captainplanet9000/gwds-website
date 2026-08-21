'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CivalHero3D from './CivalHero3D';

export default function Hero() {
  return (
    <section className="cival" style={{ position: 'relative', minHeight: '92vh', overflow: 'hidden', background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center' }}>
      {/* Market-depth wave field from the design source. Kept as a sibling of the
          copy (not a parent) so it owns the pointer-parallax on open hero space. */}
      <div data-hero-bg style={{ position: 'absolute', inset: 0, opacity: 0.95, willChange: 'transform' }}>
        <CivalHero3D />
      </div>

      {/* Legibility scrims. The field peaks bright on the right while the copy sits
          left, so fade the plate horizontally and settle it into the next section. */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(90deg, var(--color-bg) 0%, color-mix(in srgb, var(--color-bg) 80%, transparent) 36%, transparent 74%)',
      }} />
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-bg) 60%, transparent) 0%, transparent 24%, transparent 66%, var(--color-bg) 100%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '100px 28px 60px', width: '100%' }}>
        <div style={{ maxWidth: 680 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
            <span className="tag tag-accent">Hyperliquid · source template</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }}>v2 · verified paper release</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(42px,5.8vw,76px)', lineHeight: 1.04, letterSpacing: '-0.018em', margin: '0 0 24px' }}>
            Your paper-trading<br />command center.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            style={{ fontSize: 19, lineHeight: 1.55, maxWidth: 560, color: 'var(--color-neutral-800)', margin: '0 0 18px' }}>
            A polished operations dashboard for simulated orders, agent workspaces, goals, risk review, audit history, and portable backups — shipped as readable TypeScript you own.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: 16.5, lineHeight: 1.55, maxWidth: 560, color: 'var(--color-neutral-700)', margin: '0 0 34px' }}>
            The supported release is deliberately paper-only: no exchange connector, wallet-secret form, withdrawal flow, or live-order endpoint.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/store/trading-dashboard-template" className="btn btn-primary" style={{ height: 50, padding: '0 26px', fontSize: 15 }}>Start from $99</Link>
            <a href="https://cival-core-v2-template.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ height: 50, padding: '0 22px', fontSize: 15, gap: 8 }}>
              Open the interactive demo
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
