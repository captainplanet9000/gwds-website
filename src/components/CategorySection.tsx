'use client';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { AnimatedWaveBorder } from './WaveDivider';

const categories = [
  {
    id: 'ai-templates',
    label: 'AI Templates',
    desc: 'Prompt packs, workflow blueprints, and LLM-ready assets',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4,16 Q8,8 16,16 Q24,24 28,16" stroke="oklch(0.75 0.15 195)" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="16" cy="16" r="3" fill="oklch(0.65 0.29 295)" opacity="0.8"/>
        <circle cx="4" cy="16" r="1.5" fill="oklch(0.75 0.15 195)" opacity="0.6"/>
        <circle cx="28" cy="16" r="1.5" fill="oklch(0.75 0.15 195)" opacity="0.6"/>
      </svg>
    ),
    color: 'oklch(0.75 0.15 195)',
    href: '/templates',
  },
  {
    id: 'trading-tools',
    label: 'Trading Tools',
    desc: 'Dashboards, agents, and algorithmic strategy kits',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <polyline points="2,24 8,14 14,18 20,8 28,12" stroke="oklch(0.70 0.18 145)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="28" cy="12" r="2" fill="oklch(0.70 0.18 145)"/>
        <line x1="2" y1="28" x2="30" y2="28" stroke="oklch(0.35 0.05 270)" strokeWidth="1"/>
      </svg>
    ),
    color: 'oklch(0.70 0.18 145)',
    href: '/trading',
  },
  {
    id: 'animations',
    label: 'Animations',
    desc: 'Motion graphics, Houdini VEX, and 3D render packs',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="oklch(0.82 0.18 85)" strokeWidth="1.5" fill="none"/>
        <path d="M4,16 C4,9.37 9.37,4 16,4" stroke="oklch(0.82 0.18 85)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16,28 C22.63,28 28,22.63 28,16" stroke="oklch(0.82 0.18 85)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <polygon points="13,12 21,16 13,20" fill="oklch(0.82 0.18 85)"/>
      </svg>
    ),
    color: 'oklch(0.82 0.18 85)',
    href: '/animations',
  },
  {
    id: '3d-assets',
    label: '3D Assets',
    desc: 'Blender files, ComfyUI nodes, and rendered texture packs',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16,3 L28,9 L28,23 L16,29 L4,23 L4,9 Z" stroke="oklch(0.75 0.15 195)" strokeWidth="1.5" fill="none"/>
        <path d="M16,3 L16,16 M16,16 L28,9 M16,16 L4,9" stroke="oklch(0.65 0.29 295)" strokeWidth="1" opacity="0.6"/>
        <path d="M16,16 L28,23 M16,16 L4,23 M16,16 L16,29" stroke="oklch(0.65 0.29 295)" strokeWidth="1" opacity="0.3"/>
      </svg>
    ),
    color: 'oklch(0.75 0.15 195)',
    href: '/3d',
  },
  {
    id: 'creative-kits',
    label: 'Creative Kits',
    desc: 'Brand packs, UI component libraries, and design systems',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="3" width="11" height="11" rx="2" stroke="oklch(0.65 0.29 295)" strokeWidth="1.5" fill="oklch(0.65 0.29 295 / 0.15)"/>
        <rect x="18" y="3" width="11" height="11" rx="2" stroke="oklch(0.70 0.25 340)" strokeWidth="1.5" fill="oklch(0.70 0.25 340 / 0.15)"/>
        <rect x="3" y="18" width="11" height="11" rx="2" stroke="oklch(0.82 0.18 85)" strokeWidth="1.5" fill="oklch(0.82 0.18 85 / 0.15)"/>
        <rect x="18" y="18" width="11" height="11" rx="2" stroke="oklch(0.75 0.15 195)" strokeWidth="1.5" fill="oklch(0.75 0.15 195 / 0.15)"/>
      </svg>
    ),
    color: 'oklch(0.65 0.29 295)',
    href: '/kits',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function CategorySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} style={{ padding: '100px 24px', background: 'oklch(0.08 0 0)', position: 'relative' }}>
      <AnimatedWaveBorder color="oklch(0.65 0.29 295)" opacity={0.2} />

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            color: 'oklch(0.75 0.15 195)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            — Product Categories —
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'oklch(0.98 0 0)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Everything you need to ship
          </h2>
        </motion.div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 20,
        }}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <Link href={cat.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div
                  style={{
                    background: 'oklch(0.11 0.01 270 / 0.9)',
                    border: `1px solid oklch(0.25 0.05 270 / 0.5)`,
                    borderRadius: 16,
                    padding: 28,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = `1px solid ${cat.color}4D`;
                    el.style.boxShadow = `0 0 30px ${cat.color}26, 0 8px 32px oklch(0 0 0 / 0.4)`;
                    el.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.border = '1px solid oklch(0.25 0.05 270 / 0.5)';
                    el.style.boxShadow = 'none';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Subtle corner glow */}
                  <div style={{
                    position: 'absolute',
                    top: -40,
                    right: -40,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${cat.color}1A, transparent 70%)`,
                    pointerEvents: 'none',
                  }} />

                  <div style={{ marginBottom: 20 }}>{cat.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'oklch(0.98 0 0)',
                    margin: '0 0 10px',
                  }}>
                    {cat.label}
                  </h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: 'oklch(0.68 0.01 250)',
                    margin: 0,
                    lineHeight: 1.6,
                  }}>
                    {cat.desc}
                  </p>

                  <div style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: cat.color,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}>
                    Explore →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
