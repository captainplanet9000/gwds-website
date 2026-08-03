'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="cival" style={{ position: 'relative', minHeight: '92vh', overflow: 'hidden', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(60% 60% at 80% 20%, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 60%), radial-gradient(50% 50% at 100% 100%, color-mix(in srgb, var(--color-accent-2) 12%, transparent) 0%, transparent 60%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(180deg, black, transparent 85%)' }} />

      <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', padding: '100px 28px 60px', width: '100%' }}>
        <div style={{ maxWidth: 680 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 }}>
            <span className="tag tag-accent">Hyperliquid · autonomous</span>
            <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-neutral-700)', whiteSpace: 'nowrap' }}>v2.4 — 3 editions</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            style={{ fontSize: 'clamp(42px,5.8vw,76px)', lineHeight: 1.04, letterSpacing: '-0.018em', margin: '0 0 24px' }}>
            Your own AI agent<br />hedge fund, ready<br />to deploy.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            style={{ fontSize: 19, lineHeight: 1.5, maxWidth: 520, color: 'var(--color-neutral-800)', margin: '0 0 34px' }}>
            A complete starting point — dashboard, execution layer, risk engine and agent runtime, already built. Skip the months and the
            burned credits of building it yourself. Add your strategy and a Hyperliquid key, and your agents trade.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Link href="/store/trading-dashboard-template" className="btn btn-primary" style={{ height: 50, padding: '0 26px', fontSize: 15 }}>Start from $99</Link>
            <a href="https://ai-trading-dashboard-demo.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ height: 50, padding: '0 22px', fontSize: 15, gap: 8 }}>
              Open the live demo
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
