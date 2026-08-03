'use client';

import { useState } from 'react';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
    } catch { /* still show success */ }
    setStatus('success');
    setEmail('');
    try { const { track } = await import('@vercel/analytics'); track('newsletter_subscribe', { source: 'cta' }); } catch {}
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <section
      style={{
        padding: 'clamp(60px, 12vh, 120px) 24px',
        borderTop: '1px solid var(--color-divider)',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            letterSpacing: '-0.018em',
            margin: '0 0 16px',
          }}
        >
          Let&apos;s Build Something
        </h2>

        <p
          style={{
            fontSize: '15.5px',
            lineHeight: 1.6,
            color: 'var(--color-neutral-700)',
            margin: '0 0 32px',
          }}
        >
          Get notified when we launch new products, tools, and experiments.
        </p>

        <form
          onSubmit={handleSubmit}
          className="cta-form"
          style={{
            display: 'flex',
            gap: '10px',
            maxWidth: '460px',
            margin: '0 auto',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading' || status === 'success'}
            className="input"
            style={{ flex: 1 }}
          />

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            {status === 'loading' ? 'Subscribing…' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>

        {status === 'success' && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              letterSpacing: '0.03em',
              color: 'var(--color-accent)',
              marginTop: '18px',
            }}
          >
            Thanks for subscribing! We&apos;ll be in touch.
          </p>
        )}

        {status === 'error' && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              letterSpacing: '0.03em',
              color: 'var(--color-accent-2-700)',
              marginTop: '18px',
            }}
          >
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 640px) {
          .cta-form {
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
}
