'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, textDecoration: 'none', color: '#E8E8E8' }}>GWDS Admin</Link>
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons', 'Subscribers', 'Messages'].map(item => (
            <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{ fontSize: '0.78rem', color: item === 'Orders' ? '#E8E8E8' : '#888', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: item === 'Orders' ? 700 : 500 }}>
              {item}
            </Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Back to site</Link>
      </nav>

      <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Orders</h1>
        <p style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'var(--font-body)', marginBottom: 32 }}>
          {orders.length} orders · Total revenue: ${totalRevenue.toFixed(2)}
        </p>

        <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: 32, color: '#555', fontSize: '0.85rem', textAlign: 'center' }}>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ padding: 32, color: '#555', fontSize: '0.85rem', textAlign: 'center' }}>No orders yet. When customers purchase, orders will appear here.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Order ID', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.orderId || o.order_id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.72rem', fontFamily: 'var(--font-mono, monospace)', color: '#999' }}>
                      {(o.orderId || o.order_id || '').slice(0, 24)}
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#ccc' }}>{o.name || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#888' }}>{o.email}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#666' }}>
                      {(o.items || []).length} items
                    </td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#E8E8E8' }}>
                      ${o.total}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: '0.6rem', fontWeight: 600,
                        background: o.status === 'completed' ? '#10B98120' : o.status === 'pending' ? '#F59E0B20' : '#EF444420',
                        color: o.status === 'completed' ? '#10B981' : o.status === 'pending' ? '#F59E0B' : '#EF4444',
                        textTransform: 'uppercase',
                      }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: '#555' }}>
                      {new Date(o.createdAt || o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}


