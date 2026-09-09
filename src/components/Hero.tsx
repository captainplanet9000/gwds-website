'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Client-only: WebGL cannot server-render. No loading placeholder here because the hero's own
// gradient already fills the space, so there is nothing to shift when the canvas mounts.
// This is the ORIGINAL market-depth wave field from the Claude Design source (hero3d.js) - the
// animation the owner wants. It was ported into the repo but never actually mounted anywhere.
const CivalHero3D = dynamic(() => import('@/components/CivalHero3D'), { ssr: false });

export default function Hero() {
  return (
    <section className="cival hero-section" style={{ position: 'relative', minHeight: '92vh', overflow: 'hidden', borderBottom: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(60% 60% at 80% 20%, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 60%), radial-gradient(50% 50% at 100% 100%, color-mix(in srgb, var(--color-accent-2) 12%, transparent) 0%, transparent 60%)',
      }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-text) 5%, transparent) 1px, transparent 1px)', backgroundSize: '48px 48px', maskImage: 'linear-gradient(180deg, black, transparent 85%)' }} />

      {/* Market-depth wave field - occupies the empty right half of the hero, where the radial
          glow already sits. Faded toward the left with a mask so the headline keeps full contrast,
          and pointer-events:none so it can never intercept a click on the CTAs. (The component
          also listens for pointermove to ripple the field; that is given up deliberately here,
          because the CTA column overlaps this box and a click must never be swallowed - the
          full-viewport nav overlay was exactly that failure.)
          Hidden below 900px: on a phone the copy needs the whole width. */}
      <div
        className="hero-mesh"
        aria-hidden="true"
        /* NOTE: no inline geometry here on purpose. Inline styles outrank stylesheet rules, so
           putting width/top/height inline made the mobile media query a no-op - the field stayed a
           62% right-hand strip on a phone instead of the intended full-width band. All geometry now
           lives in .hero-mesh below, where breakpoints can actually reach it. */
      >
        <CivalHero3D fog="#08110f" />
      </div>

      <div className="hero-copy" style={{ position: 'relative', zIndex: 2, maxWidth: 1200, margin: '0 auto', padding: '100px 28px 60px', width: '100%' }}>
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
      <style jsx>{`
        .hero-mesh {
          position: absolute;
          inset: 0 0 0 auto;
          width: 62%;
          pointer-events: none;
          opacity: 0.9;
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, black 38%, black 100%);
          mask-image: linear-gradient(90deg, transparent 0%, black 38%, black 100%);
        }
        /* The field was previously display:none below 900px, which removed the one piece of motion
           on the page for every phone visitor. Instead of hiding it, it is re-framed:

           >= 900px  a panel on the empty right half, faded in from the left
           <  900px  a full-width band anchored to the BOTTOM of the hero, behind the copy, with a
                     top-down mask and reduced opacity so the headline keeps its contrast.

           It never receives pointer events at any width, so it can never swallow a tap on the CTAs. */
        @media (max-width: 640px) {
          .hero-section { min-height: 88vh; }
          .hero-copy { padding: 88px 20px 48px; }
        }
        @media (max-width: 900px) {
          .hero-mesh {
            inset: auto 0 0 0;
            width: 100%;
            height: 46%;
            opacity: 0.5;
            -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 55%);
            mask-image: linear-gradient(180deg, transparent 0%, black 55%);
          }
        }
        @media (max-width: 900px) and (orientation: landscape) {
          /* Short landscape phones: the copy needs the height more than the motion does. */
          .hero-mesh { height: 34%; opacity: 0.34; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-mesh { opacity: 0.35; }
        }
      `}</style>
    </section>
  );
}
