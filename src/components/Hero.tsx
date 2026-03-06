'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const GWDSLogo3D = dynamic(() => import('./GWDSLogo3D'), { ssr: false });
const WaveTerrain3D = dynamic(() => import('./WaveTerrain3D'), { ssr: false });

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const logo3dOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const waveOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {/* 3D Wave terrain — FULL BLEED background, covers entire section */}
      <motion.div style={{ position: 'absolute', inset: 0, opacity: waveOpacity }}>
        <WaveTerrain3D height="100%" opacity={0.9} />
      </motion.div>

      {/* Radial glow — purple center wash */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(139,92,246,0.1) 0%, rgba(124,58,237,0.03) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Top vignette */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 120,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* 3D Logo */}
      <motion.div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 900,
        opacity: logo3dOpacity,
        marginTop: '-2vh',
      }}>
        <GWDSLogo3D height="42vh" />
      </motion.div>

      {/* Text content */}
      <motion.div style={{
        position: 'relative',
        zIndex: 3,
        textAlign: 'center',
        maxWidth: 700,
        padding: '0 24px',
        opacity: textOpacity,
        y: textY,
        marginTop: -32,
      }}>
        {/* Tagline pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 999,
            border: '1px solid rgba(139,92,246,0.3)',
            background: 'rgba(139,92,246,0.08)',
            marginBottom: 24,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#8B5CF6',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#A78BFA',
            fontFamily: 'var(--font-body)',
          }}>
            Digital Products Studio
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            color: '#F0ECF9',
            lineHeight: 1.08,
            marginBottom: 16,
            letterSpacing: '-0.03em',
          }}
        >
          AI Trading Systems.
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #8B5CF6, #C084FC, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Deployed in Minutes.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(0.9rem, 1.8vw, 1.1rem)',
            fontWeight: 400,
            color: '#9CA3AF',
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          The same dashboard running a $184K portfolio — packaged as a template.
          <br />Full source code. 44 themes. 6 autonomous agents.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="https://ai-trading-dashboard-demo.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(139,92,246,0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '15px 36px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(139,92,246,0.25)',
                transition: 'box-shadow 0.3s',
              }}
            >
              View Live Demo →
            </motion.button>
          </a>
          <Link href="/store" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#8B5CF6' }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '15px 36px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)',
                color: '#E8E8E8',
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                transition: 'border-color 0.3s',
              }}
            >
              Browse Store
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.6rem', color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, #555, transparent)' }}
        />
      </motion.div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 250,
        background: 'linear-gradient(to bottom, transparent, #000)',
        pointerEvents: 'none',
        zIndex: 4,
      }} />
    </section>
  );
}
