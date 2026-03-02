'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Browse the Studio',
    desc: 'Explore curated digital products built at the intersection of AI, design, and trading technology.',
    color: 'oklch(0.65 0.29 295)',
  },
  {
    num: '02',
    title: 'Download Instantly',
    desc: 'One-click purchase. Get source files, docs, and implementation guides delivered immediately.',
    color: 'oklch(0.75 0.15 195)',
  },
  {
    num: '03',
    title: 'Deploy & Scale',
    desc: 'Ship faster with production-ready assets. From AI templates to live trading dashboards.',
    color: 'oklch(0.82 0.18 85)',
  },
];

// SVG connecting wave between steps
function ConnectingWave({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0 }}>
      <svg width="80" height="24" viewBox="0 0 80 24" fill="none">
        <path
          d="M0,12 C10,4 15,20 20,12 C25,4 30,20 35,12 C40,4 45,20 50,12 C55,4 60,20 65,12 C70,4 75,20 80,12"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M0,16 C10,8 15,24 20,16 C25,8 30,24 35,16"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />
        <circle cx="80" cy="12" r="2" fill={color} opacity="0.7"/>
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        padding: '100px 24px',
        background: 'oklch(0.10 0.01 270)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background interference rings */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          radial-gradient(circle at 50% 50%, oklch(0.65 0.29 295 / 0.04) 0%, transparent 60%),
          radial-gradient(ellipse 100% 60% at 50% 50%, oklch(0.75 0.15 195 / 0.03), transparent 70%)
        `,
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 72 }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            color: 'oklch(0.82 0.18 85)',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            — How It Works —
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 700,
            color: 'oklch(0.98 0 0)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            From idea to deployed in minutes
          </h2>
        </motion.div>

        {/* Steps with connecting waves */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 0,
        }}>
          {steps.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                style={{
                  textAlign: 'center',
                  maxWidth: 260,
                  padding: '0 16px',
                }}
              >
                {/* Number badge */}
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  border: `1.5px solid ${step.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  background: `${step.color}1A`,
                  boxShadow: `0 0 20px ${step.color}33`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: step.color,
                  }}>
                    {step.num}
                  </span>
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'oklch(0.98 0 0)',
                  margin: '0 0 12px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: 'oklch(0.68 0.01 250)',
                  lineHeight: 1.7,
                  margin: 0,
                }}>
                  {step.desc}
                </p>
              </motion.div>

              {/* Connecting wave (between steps, not after last) */}
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                  style={{ paddingTop: 20 }}
                >
                  <ConnectingWave color={steps[i + 1].color} />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
