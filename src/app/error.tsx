'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 500, padding: '0 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚡</div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.03em', marginBottom: 12,
          }}>
            Something broke
          </h1>
          <p style={{
            fontSize: '0.85rem', color: '#666', lineHeight: 1.6,
            fontFamily: 'var(--font-body)', marginBottom: 32,
          }}>
            {error.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={reset}
            style={{
              padding: '12px 28px', borderRadius: 8, border: '1px solid #333',
              background: 'transparent', color: '#E8E8E8', fontSize: '0.82rem',
              fontFamily: 'var(--font-display)', fontWeight: 600,
              letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
