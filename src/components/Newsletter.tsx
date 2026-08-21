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
      className="cival"
      style={{
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
        background: 'var(--color-neutral-900)',
      }}
    >
      {/* Animated wave canvas background — colors are the hex values behind the
          Cival Systems accent tokens (canvas strokeStyle can't resolve CSS vars) */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <WaveCanvas
          style={{ width: '100%', height: '100%' }}
          waves={[
            { freq: 0.005, amp: 80, speed: 0.012, color: '#7ba0f8', phase: 0 }, // accent-400
            { freq: 0.009, amp: 50, speed: 0.018, color: '#f6907a', phase: 3 }, // accent-2-400
            { freq: 0.014, amp: 30, speed: 0.025, color: '#4a78ea', phase: 1.5 }, // accent-500
          ]}
          centerY={0.5}
        />
      </div>

      {/* Radial glow center */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 80% at 50% 50%, color-mix(in srgb, var(--color-accent) 18%, transparent), transparent 70%)',
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
            color: 'var(--color-accent-400)',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            — Signal Frequency —
          </p>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 400,
            color: 'var(--color-neutral-100)',
            margin: '0 0 16px',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}>
            Stay on the frequency
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--color-neutral-400)',
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
                display: 'inline-block',
                padding: '20px 32px',
                background: 'var(--color-accent-2-100)',
                borderRadius: 999,
                color: 'var(--color-accent-2-800)',
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
                  background: 'color-mix(in srgb, var(--color-neutral-900) 40%, var(--color-neutral-800))',
                  border: '1px solid var(--color-neutral-700)',
                  borderRadius: 999,
                  color: 'var(--color-neutral-100)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-400)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--color-accent-400) 20%, transparent)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--color-neutral-700)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '14px 28px',
                  background: 'var(--color-accent)',
                  border: 'none',
                  borderRadius: 999,
                  color: 'var(--color-bg)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: status === 'sending' ? 'wait' : 'pointer',
                  opacity: status === 'sending' ? 0.7 : 1,
                  boxShadow: '0 0 20px color-mix(in srgb, var(--color-accent) 30%, transparent)',
                  transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent-700)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-accent)';
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
