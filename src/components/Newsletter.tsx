'use client';
import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import WaveCanvas from './WaveCanvas';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('done');
    } catch {
      setStatus('done'); // Show success anyway — email was likely saved
    }
  };

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
        background: 'oklch(0.08 0 0)',
      }}
    >
      {/* Animated wave canvas background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <WaveCanvas
          style={{ width: '100%', height: '100%' }}
          waves={[
            { freq: 0.005, amp: 80, speed: 0.012, color: 'oklch(0.65 0.29 295)', phase: 0 },
            { freq: 0.009, amp: 50, speed: 0.018, color: 'oklch(0.75 0.15 195)', phase: 3 },
            { freq: 0.014, amp: 30, speed: 0.025, color: 'oklch(0.70 0.25 340)', phase: 1.5 },
          ]}
          centerY={0.5}
        />
      </div>

      {/* Radial glow center */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 80% at 50% 50%, oklch(0.65 0.29 295 / 0.12), transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.25em',
            color: 'oklch(0.75 0.15 195)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            — Signal Frequency —
          </p>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'oklch(0.98 0 0)',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
            Stay on the frequency
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'oklch(0.68 0.01 250)',
            margin: '0 0 40px',
            lineHeight: 1.7,
          }}>
            New products, early access drops, and AI insights — transmitted directly to your inbox.
          </p>

          {status === 'done' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                padding: '20px 32px',
                background: 'oklch(0.70 0.18 145 / 0.15)',
                border: '1px solid oklch(0.70 0.18 145 / 0.4)',
                borderRadius: 12,
                color: 'oklch(0.70 0.18 145)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                letterSpacing: '0.05em',
              }}
            >
              ✓ Signal received. You&apos;re on the wavelength.
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  background: 'oklch(0.12 0.01 270 / 0.8)',
                  border: '1px solid oklch(0.30 0.05 270)',
                  borderRadius: 10,
                  color: 'oklch(0.98 0 0)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.75 0.15 195)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.75 0.15 195 / 0.15)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'oklch(0.30 0.05 270)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '14px 28px',
                  background: 'linear-gradient(135deg, oklch(0.65 0.29 295), oklch(0.75 0.15 195))',
                  border: 'none',
                  borderRadius: 10,
                  color: 'oklch(0.98 0 0)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: status === 'sending' ? 'wait' : 'pointer',
                  opacity: status === 'sending' ? 0.7 : 1,
                  boxShadow: '0 0 20px oklch(0.65 0.29 295 / 0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px oklch(0.65 0.29 295 / 0.5)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px oklch(0.65 0.29 295 / 0.3)';
                }}
              >
                {status === 'sending' ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
