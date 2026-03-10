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

  if (loading) return <div style={{ minHeight: '100vh', background: '#000', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (error || !order) return <div style={{ minHeight: '100vh', background: '#000', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{error || 'Order not found'}</div>;

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8', paddingTop: '12vh' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px' }}>
          {/* Receipt Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: '0.72rem', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Receipt</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>GWDS</h1>
            <p style={{ fontSize: '0.82rem', color: '#888' }}>Gamma Waves Design Studio</p>
            <p style={{ fontSize: '0.72rem', color: '#555', marginTop: 4 }}>gammawavesdesign@gmail.com</p>
          </div>

          {/* Order Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32, padding: 20, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Order ID</p>
              <p style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono, monospace)', color: '#888' }}>{order.id.slice(0, 8)}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Date</p>
              <p style={{ fontSize: '0.82rem', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Customer</p>
              <p style={{ fontSize: '0.82rem', color: '#888' }}>{order.customerEmail}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.65rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Status</p>
              <p style={{ fontSize: '0.82rem', color: order.status === 'completed' ? '#10B981' : '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>{order.status}</p>
            </div>
          </div>

          {/* Items */}
          <div style={{ padding: 20, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a', marginBottom: 24 }}>
            <p style={{ fontSize: '0.68rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16, fontWeight: 600 }}>Items</p>
            {order.items?.map((item: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid #111' : 'none' }}>
                <div>
                  <span style={{ marginRight: 8 }}>{item.emoji}</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#E8E8E8' }}>{item.productName}</span>
                  {item.quantity > 1 && <span style={{ fontSize: '0.75rem', color: '#555', marginLeft: 8 }}>×{item.quantity}</span>}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E8E8E8' }}>${((item.priceCents || 0) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #222' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E8E8E8' }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800, color: '#10B981' }}>${((order.totalCents || 0) / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 48 }}>
            <button onClick={() => window.print()} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#ccc', fontSize: '0.82rem', cursor: 'pointer' }}>🖨️ Print Receipt</button>
            <Link href="/account/orders" style={{ padding: '10px 24px', borderRadius: 8, background: '#8B5CF6', color: '#fff', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>← Back to Orders</Link>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '24px 0 48px', borderTop: '1px solid #111' }}>
            <p style={{ fontSize: '0.72rem', color: '#444' }}>Gamma Waves Design Studio • Source code & architecture</p>
            <p style={{ fontSize: '0.68rem', color: '#333', marginTop: 4 }}>Trading involves risk. Products are educational tools, not financial advice.</p>
          </div>
        </div>
      </div>
    </>
  );
}
