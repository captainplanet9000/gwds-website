'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => {
        // Aggregate customers from orders
        const map = new Map<string, any>();
        for (const o of (d.orders || [])) {
          const email = o.email;
          if (!map.has(email)) {
            map.set(email, { email, name: o.name || '', totalSpent: 0, orderCount: 0, lastOrder: o.createdAt || o.created_at });
          }
          const c = map.get(email)!;
          c.totalSpent += parseFloat(o.total) || 0;
          c.orderCount++;
          const date = o.createdAt || o.created_at;
          if (date > c.lastOrder) c.lastOrder = date;
        }
        setCustomers(Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, textDecoration: 'none', color: '#E8E8E8' }}>GWDS Admin</Link>
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons'].map(item => (
            <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{ fontSize: '0.78rem', color: item === 'Customers' ? '#E8E8E8' : '#888', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: item === 'Customers' ? 700 : 500 }}>
              {item}
            </Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Back to site</Link>
      </nav>

      <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>Customers</h1>
        <p style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'var(--font-body)', marginBottom: 32 }}>
          {customers.length} unique customers
        </p>

        <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          {loading ? (
            <p style={{ padding: 32, color: '#555', textAlign: 'center' }}>Loading...</p>
          ) : customers.length === 0 ? (
            <p style={{ padding: 32, color: '#555', textAlign: 'center', fontSize: '0.85rem' }}>No customers yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.email} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', fontWeight: 600, color: '#E8E8E8' }}>{c.name || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: '#888' }}>{c.email}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: '#ccc', fontWeight: 600 }}>{c.orderCount}</td>
                    <td style={{ padding: '12px 14px', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#10B981' }}>${c.totalSpent.toFixed(2)}</td>
                    <td style={{ padding: '12px 14px', fontSize: '0.72rem', color: '#555' }}>{new Date(c.lastOrder).toLocaleDateString()}</td>
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

