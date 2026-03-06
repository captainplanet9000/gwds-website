'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import dynamic from 'next/dynamic';

const GWDSLogo3D = dynamic(() => import('./GWDSLogo3D'), { ssr: false });
const WaveTerrain3D = dynamic(() => import('./WaveTerrain3D'), { ssr: false });

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const logo3dOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    const init = async () => {
      if (!headlineRef.current) return;
      const { gsap } = await import('gsap');
      const { SplitText } = await import('gsap/SplitText');
      gsap.registerPlugin(SplitText);
      const split = new SplitText(headlineRef.current, { type: 'chars,words' });
      gsap.from(split.chars, {
        opacity: 0, y: 60, rotateX: -60, filter: 'blur(6px)',
        stagger: 0.03, duration: 0.8, ease: 'back.out(1.2)', delay: 0.5,
      });
      return () => split.revert();
    };
    init().catch(console.error);
  }, []);

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
      {/* 3D Wave terrain background */}
      <WaveTerrain3D height="100vh" opacity={0.6} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,92,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* 3D Logo */}
      <motion.div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: 800,
        opacity: logo3dOpacity,
      }}>
        <GWDSLogo3D height="45vh" />
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
        marginTop: -40,
      }}>
        {/* Tagline */}
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
            border: '1px solid rgba(139,92,246,0.25)',
            background: 'rgba(139,92,246,0.06)',
            marginBottom: 24,
          }}
        >
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#8B5CF6',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: '#8B5CF6',
            fontFamily: 'var(--font-body)',
          }}>
            Digital Products Studio
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            color: '#E8E8E8',
            lineHeight: 1.1,
            marginBottom: 16,
            letterSpacing: '-0.03em',
          }}
        >
          AI Trading Systems.
          <br />
          <span style={{ color: '#8B5CF6' }}>Deployed in Minutes.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.h2
          ref={headlineRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            fontWeight: 400,
            color: '#888',
            lineHeight: 1.6,
            marginBottom: 40,
            letterSpacing: '-0.01em',
          }}
        >
          The same dashboard running a $184K portfolio — packaged as a template.
          <br />Full source code, 44 themes, 6 autonomous agents.
        </motion.h2>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a href="https://ai-trading-dashboard-demo.vercel.app" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '15px 36px',
                borderRadius: 8,
                border: 'none',
                background: '#8B5CF6',
                color: '#fff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
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
                border: '1px solid #333',
                background: 'transparent',
                color: '#E8E8E8',
                fontFamily: 'var(--font-display)',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
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
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: '0.6rem', color: '#444', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 1, height: 24, background: 'linear-gradient(to bottom, #444, transparent)' }}
        />
      </motion.div>

      {/* Bottom fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        background: 'linear-gradient(to bottom, transparent, #000)',
        pointerEvents: 'none',
        zIndex: 4,
      }} />
    </section>
  );
}
