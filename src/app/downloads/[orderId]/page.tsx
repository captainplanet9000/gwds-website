'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DownloadsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setOrder(d);
        setLoading(false);
      })
      .catch(() => { setError('Failed to load order'); setLoading(false); });
  }, [orderId]);

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 120 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 80px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.8rem',
            fontWeight: 800, color: '#E8E8E8', marginBottom: 8, letterSpacing: '-0.03em',
          }}>
            Your Downloads
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'var(--font-mono, monospace)', marginBottom: 40 }}>
            {orderId}
          </p>

          {loading && <p style={{ color: '#555' }}>Loading order...</p>}
          {error && <p style={{ color: '#EF4444' }}>{error}</p>}

          {order && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} style={{
                  padding: 24, borderRadius: 12,
                  background: '#0a0a0a', border: '1px solid #1a1a1a',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.emoji || '📦'}</span>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#E8E8E8' }}>
                        {item.productName}
                      </h3>
                      <p style={{ fontSize: '0.72rem', color: '#555', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                        {order.status === 'completed' ? 'Ready to download' : `Status: ${order.status}`}
                      </p>
                    </div>
                  </div>
                  {order.status === 'completed' ? (
                    <button
                      onClick={() => window.open(`/api/downloads/${orderId}/${item.productId}`, '_blank')}
                      style={{
                        padding: '10px 20px', borderRadius: 6, border: 'none',
                        background: '#8B5CF6', color: '#fff',
                        fontSize: '0.78rem', fontWeight: 700,
                        fontFamily: 'var(--font-display)', cursor: 'pointer',
                        letterSpacing: '0.05em', textTransform: 'uppercase',
                      }}
                    >
                      Download
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontFamily: 'var(--font-body)' }}>
                      Awaiting payment
                    </span>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link href="/store" style={{ fontSize: '0.82rem', color: '#8B5CF6', textDecoration: 'none' }}>
                  ← Back to Store
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
