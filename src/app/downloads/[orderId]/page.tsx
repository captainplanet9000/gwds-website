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
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 140 }}>
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
                      onClick={() => {
                        const tokenParam = item.downloadToken ? `?token=${item.downloadToken}` : '';
                        window.open(`/api/downloads/${orderId}/${item.productId}${tokenParam}`, '_blank');
                      }}
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

              {/* Getting Started Instructions */}
              <div style={{
                marginTop: 40, padding: 32, borderRadius: 12,
                background: '#0a0a0a', border: '1px solid #1a1a1a',
              }}>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.1rem',
                  fontWeight: 700, color: '#E8E8E8', marginBottom: 20,
                }}>
                  Getting Started
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { step: '1', title: 'Extract the zip', desc: 'Unzip the downloaded file to a folder on your computer.' },
                    { step: '2', title: 'Run the setup script', desc: 'Double-click QUICK-START.bat (Windows) or QUICK-START.command (Mac). It handles everything automatically.' },
                    { step: '3', title: 'Configure API keys', desc: 'The Setup Wizard opens in your browser and walks you through connecting Hyperliquid, Supabase, and your AI provider.' },
                    { step: '4', title: 'Start trading', desc: 'Your dashboard is ready. Create agents, set goals, and let them trade.' },
                  ].map((item) => (
                    <div key={item.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <span style={{
                        minWidth: 28, height: 28, borderRadius: '50%',
                        background: '#8B5CF6', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)',
                      }}>
                        {item.step}
                      </span>
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8', fontFamily: 'var(--font-display)', marginBottom: 2 }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: '0.78rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Plugin Installation */}
                <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #1a1a1a' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#E8E8E8', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
                    Installing a Plugin
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      'Extract the plugin zip',
                      'Copy the extracted folder into your dashboard\'s plugins/ directory',
                      'Restart the dashboard — the plugin loads automatically',
                    ].map((text, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                        <span style={{ fontSize: '0.78rem', color: '#777', fontFamily: 'var(--font-body)' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extension Installation */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #1a1a1a' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#E8E8E8', fontFamily: 'var(--font-display)', marginBottom: 12 }}>
                    Installing an Extension
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      'Extract the extension zip',
                      'Run install.bat (Windows) or bash install.command (Mac)',
                      'Point it to your dashboard folder when prompted',
                      'Restart the dashboard — new features appear in the sidebar',
                    ].map((text, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#8B5CF6', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                        <span style={{ fontSize: '0.78rem', color: '#777', fontFamily: 'var(--font-body)' }}>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{
                  marginTop: 20, fontSize: '0.75rem', color: '#555',
                  fontFamily: 'var(--font-body)', lineHeight: 1.5,
                }}>
                  Full setup guide included in the download at <code style={{ color: '#8B5CF6', fontSize: '0.72rem' }}>docs/SETUP.md</code>
                </p>
              </div>

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
