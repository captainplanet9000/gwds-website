'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ReceiptPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return (
    <div className="cival" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-neutral-600)' }}>
      Loading...
    </div>
  );
  if (error || !order) return (
    <div className="cival" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-2-700)' }}>
      {error || 'Order not found'}
    </div>
  );

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ paddingTop: '12vh', paddingBottom: 48 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          {/* Receipt Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: 'var(--color-accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>Receipt</p>
            <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Cival Systems</h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-700)' }}>Cival Systems</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-600)', marginTop: 4 }}>gammawavesdesign@gmail.com</p>
          </div>

          {/* Order Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32, padding: 20, borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Order ID</p>
              <p style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', color: 'var(--color-neutral-800)' }}>{order.id.slice(0, 8)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Date</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-800)' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Customer</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-neutral-800)' }}>{order.customerEmail}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Status</p>
              <span className={`tag ${order.status === 'completed' ? 'tag-accent-2' : 'tag-neutral'}`}>{order.status}</span>
            </div>
          </div>

          {/* Items */}
          <div style={{ padding: 20, borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', marginBottom: 24 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-neutral-600)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, fontWeight: 600 }}>Items</p>
            {order.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
                <div>
                  <span style={{ marginRight: 8 }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)' }}>{item.productName}</span>
                  {item.quantity > 1 && <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', marginLeft: 8 }}>×{item.quantity}</span>}
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>${((item.priceCents || 0) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-accent)' }}>${((order.totalCents || 0) / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
            <button onClick={() => window.print()} className="btn btn-secondary">🖨️ Print Receipt</button>
            <Link href="/account/orders" className="btn btn-primary">← Back to Orders</Link>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px', borderTop: '1px solid var(--color-divider)' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-neutral-600)' }}>Cival Systems • Source code & architecture</p>
            <p style={{ fontSize: '0.68rem', color: 'var(--color-neutral-500)', marginTop: 4 }}>Trading involves risk. Products are educational tools, not financial advice.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
