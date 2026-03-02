'use client';

import { useState } from 'react';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <section
      style={{
        padding: '15vh 5vw',
        background: '#000',
        borderTop: '1px solid rgba(232, 232, 232, 0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '6vw',
            fontWeight: 700,
            color: '#E8E8E8',
            marginBottom: '2vw',
          }}
        >
          Let's Build Something
        </h2>

        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '1.3vw',
            color: '#A8A8A8',
            marginBottom: '4vw',
          }}
        >
          Get notified when we launch new products, tools, and experiments.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '1vw',
            maxWidth: '600px',
            margin: '0 auto',
          }}
          className="cta-form"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={status === 'loading' || status === 'success'}
            style={{
              flex: 1,
              padding: '1.2vw',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1vw',
              background: '#050505',
              border: '1px solid rgba(232, 232, 232, 0.2)',
              color: '#E8E8E8',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'oklch(0.65 0.29 295)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
            }}
          />

          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            style={{
              padding: '1.2vw 2.5vw',
              fontFamily: 'Syne, sans-serif',
              fontSize: '1vw',
              fontWeight: 600,
              background: 'oklch(0.65 0.29 295)',
              color: '#000',
              border: 'none',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: status === 'loading' || status === 'success' ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (status === 'idle' || status === 'error') {
                e.currentTarget.style.background = '#E8E8E8';
              }
            }}
            onMouseLeave={(e) => {
              if (status === 'idle' || status === 'error') {
                e.currentTarget.style.background = 'oklch(0.65 0.29 295)';
              }
            }}
          >
            {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
          </button>
        </form>

        {status === 'success' && (
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9vw',
              color: 'oklch(0.65 0.29 295)',
              marginTop: '2vw',
            }}
          >
            Thanks for subscribing! We'll be in touch.
          </p>
        )}

        {status === 'error' && (
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.9vw',
              color: '#ff6b6b',
              marginTop: '2vw',
            }}
          >
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          h2 {
            font-size: 12vw !important;
          }
          p {
            font-size: 4vw !important;
          }
          .cta-form {
            flex-direction: column !important;
            gap: 3vw !important;
          }
          input,
          button {
            padding: 4vw !important;
            font-size: 4vw !important;
          }
        }
      `}</style>
    </section>
  );
}
