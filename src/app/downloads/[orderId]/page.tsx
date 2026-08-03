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
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 700, margin: '0 auto', padding: '150px 24px 96px' }}>
        <h1 style={{ fontSize: 'clamp(30px,3.6vw,42px)', letterSpacing: '-0.015em', margin: '0 0 8px' }}>
          Your Downloads
        </h1>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', fontFamily: 'var(--font-mono)', marginBottom: 40 }}>
          {orderId}
        </p>

        {loading && <p style={{ color: 'var(--color-neutral-600)' }}>Loading order...</p>}
        {error && (
          <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-800)', fontSize: 13.5 }}>
            {error}
          </div>
        )}

        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(order.items || []).map((item: any, i: number) => (
              <div key={i} style={{
                padding: 24, borderRadius: 'calc(var(--radius-lg) * 1.15)',
                background: 'var(--color-surface)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>{item.emoji || '📦'}</span>
                  <div>
                    <h3 style={{ fontSize: 17, margin: 0 }}>
                      {item.productName}
                    </h3>
                    <p style={{ fontSize: 12.5, color: 'var(--color-neutral-600)', marginTop: 2 }}>
                      {order.status === 'completed' ? 'Ready to download' : `Status: ${order.status}`}
                    </p>
                  </div>
                </div>
                {order.status === 'completed' ? (
                  <button
                    onClick={() => {
                      const tokenParam = item.downloadToken ? `?token=${item.downloadToken}` : '';
                      // Use the database UUID (order.id), not the URL param (GWDS-* string)
                      window.open(`/api/downloads/${order.id}/${item.productId}${tokenParam}`, '_blank');
                    }}
                    className="btn btn-primary"
                  >
                    Download
                  </button>
                ) : (
                  <span className="tag tag-accent-2">
                    Awaiting payment
                  </span>
                )}
              </div>
            ))}

            {/* Getting Started Instructions */}
            <div style={{
              marginTop: 24, padding: 32, borderRadius: 'calc(var(--radius-lg) * 1.15)',
              background: 'var(--color-surface)',
            }}>
              <h2 style={{ fontSize: 22, margin: '0 0 20px' }}>
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
                      background: 'var(--color-accent)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
                    }}>
                      {item.step}
                    </span>
                    <div>
                      <p style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>
                        {item.title}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--color-neutral-700)', lineHeight: 1.5 }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plugin Installation */}
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--color-divider)' }}>
                <h3 style={{ fontSize: 17, margin: '0 0 12px' }}>
                  Installing a Plugin
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Extract the plugin zip',
                    'Copy the extracted folder into your dashboard\'s plugins/ directory',
                    'Restart the dashboard — the plugin loads automatically',
                  ].map((text, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Extension Installation */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-divider)' }}>
                <h3 style={{ fontSize: 17, margin: '0 0 12px' }}>
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
                      <span style={{ fontSize: 13, color: 'var(--color-accent)', fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                      <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{
                marginTop: 20, fontSize: 12.5, color: 'var(--color-neutral-600)',
                lineHeight: 1.5,
              }}>
                Full setup guide included in the download at <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: 12 }}>docs/SETUP.md</code>
              </p>
            </div>

            {/* Discord CTA */}
            <div style={{
              marginTop: 8, padding: '20px 24px',
              background: 'var(--color-accent-100)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, flexWrap: 'wrap',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                  Need help? Join the community
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>
                  Setup support, plugin sharing, strategy discussion, and more.
                </div>
              </div>
              <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Join Discord
              </a>
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link href="/store" style={{ fontSize: 13.5, color: 'var(--color-accent)' }}>
                ← Back to Store
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
