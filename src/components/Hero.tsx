'use client';
import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import WaveCanvas from './WaveCanvas';
import { WaveDivider } from './WaveDivider';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  // GSAP SplitText on headline
  useEffect(() => {
    const init = async () => {
      if (!headlineRef.current) return;
      const { gsap } = await import('gsap');
      const { SplitText } = await import('gsap/SplitText');
      if (typeof window !== 'undefined') {
        gsap.registerPlugin(SplitText);
      }
      const split = new SplitText(headlineRef.current, { type: 'chars,words' });
      gsap.from(split.chars, {
        opacity: 0,
        y: 80,
        rotateX: -90,
        filter: 'blur(8px)',
        stagger: 0.035,
        duration: 0.9,
        ease: 'back.out(1.5)',
        delay: 0.3,
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
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '120px 24px 80px',
        background: 'var(--color-void-black)',
      }}
      className="wave-grid"
    >
      {/* Background image parallax */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -120,
          backgroundImage: 'url(/images/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
          y: heroY,
          pointerEvents: 'none',
        }}
      />

      {/* Radial gradient overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.65 0.29 295 / 0.25), transparent),' +
            'radial-gradient(ellipse 50% 50% at 90% 80%, oklch(0.75 0.15 195 / 0.12), transparent),' +
            'radial-gradient(ellipse 40% 40% at 10% 70%, oklch(0.70 0.25 340 / 0.08), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Animated plasma orb */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '8%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, oklch(0.65 0.29 295 / 0.15) 0%, oklch(0.75 0.15 195 / 0.06) 50%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          y: orbY,
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="animate-plasma-pulse"
      />

      {/* Second orb */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, oklch(0.70 0.25 340 / 0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* WaveCanvas — full viewport background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      >
        <WaveCanvas
          style={{ width: '100%', height: '100%' }}
          waves={[
            { freq: 0.005, amp: 100, speed: 0.012, color: 'oklch(0.65 0.29 295 / 0.3)', phase: 0 },
            { freq: 0.009, amp: 60, speed: 0.018, color: 'oklch(0.75 0.15 195 / 0.25)', phase: 3 },
            { freq: 0.004, amp: 140, speed: 0.008, color: 'oklch(0.70 0.25 340 / 0.15)', phase: 1.5 },
          ]}
          centerY={0.5}
        />
      </div>

      {/* Floating sine wave particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${15 + i * 12}%`,
            left: `${5 + i * 15}%`,
            width: 60 + i * 20,
            height: 20,
            pointerEvents: 'none',
            opacity: 0.3 + i * 0.05,
          }}
          animate={{ y: [0, -16, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3 + i * 0.8, repeat: Infinity, delay: i * 0.5 }}
        >
          <svg viewBox={`0 0 ${60 + i * 20} 20`} style={{ width: '100%', height: '100%' }}>
            <path
              d={`M0,10 C${15 + i * 5},0 ${30 + i * 5},20 ${60 + i * 20},10`}
              stroke={i % 2 === 0 ? 'oklch(0.65 0.29 295)' : 'oklch(0.75 0.15 195)'}
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
            />
          </svg>
        </motion.div>
      ))}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, width: '100%' }}>
        <motion.div style={{ opacity: textOpacity, y: textY }}>
          {/* Label badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 999,
                border: '1px solid oklch(0.65 0.29 295 / 0.4)',
                background: 'oklch(0.65 0.29 295 / 0.08)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'oklch(0.75 0.15 195)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'oklch(0.75 0.15 195)',
                  display: 'inline-block',
                  animation: 'plasma-pulse 2s ease-in-out infinite',
                }}
              />
              Digital Products Studio · Wave Physics Aesthetic
            </div>
          </motion.div>

          {/* Headline — GSAP SplitText handles the animation */}
          <h1
            ref={headlineRef}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 8vw, 6rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 24,
              color: 'var(--color-text-bright)',
              perspective: 800,
            }}
          >
            GAMMA WAVES{' '}
            <span className="gradient-plasma">DESIGN</span>
            <br />
            STUDIO
          </h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'oklch(0.68 0.01 250)',
              lineHeight: 1.7,
              maxWidth: '44rem',
              margin: '0 auto 48px',
            }}
          >
            Digital products at the intersection of{' '}
            <span style={{ color: 'oklch(0.75 0.15 195)' }}>AI</span>,{' '}
            <span style={{ color: 'oklch(0.65 0.29 295)' }}>design</span>, and{' '}
            <span style={{ color: 'oklch(0.82 0.18 85)' }}>wave physics</span>.
            AI templates, trading tools, animations, and creative assets — built by makers.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
          >
            <Link href="/store" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="glow-purple"
                style={{
                  padding: '16px 36px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, oklch(0.65 0.29 295), oklch(0.58 0.32 290))',
                  color: 'white',
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Browse Store →
              </motion.button>
            </Link>
            <Link href="/about" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.04, borderColor: 'oklch(0.65 0.29 295)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '16px 36px',
                  borderRadius: 8,
                  border: '1px solid oklch(0.65 0.29 295 / 0.4)',
                  background: 'transparent',
                  color: 'var(--color-text-bright)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap' }}
          >
            {[
              { value: '50+', label: 'Digital Products', color: 'oklch(0.65 0.29 295)' },
              { value: '6', label: 'Content Channels', color: 'oklch(0.75 0.15 195)' },
              { value: 'AI', label: 'Powered Creation', color: 'oklch(0.82 0.18 85)' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(2rem, 4vw, 3rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: stat.color,
                    textShadow: `0 0 30px ${stat.color}`,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ color: 'oklch(0.55 0.01 250)', fontSize: 13, marginTop: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade into next section */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 220,
          background: 'linear-gradient(to bottom, transparent, var(--color-void-black))',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* SVG wave at very bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4 }}>
        <WaveDivider color="var(--color-void-black)" variant="multi" height={60} opacity={0.8} />
      </div>
    </section>
  );
}
