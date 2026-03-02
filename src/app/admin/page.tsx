'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('gwds-admin');
    if (saved === 'true') setAuthed(true);
  }, []);

  const login = () => {
    // Simple password auth — set GWDS_ADMIN_PASSWORD in env
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(r => r.json()).then(d => {
      if (d.ok) {
        setAuthed(true);
        sessionStorage.setItem('gwds-admin', 'true');
      } else {
        alert('Invalid password');
      }
    });
  };

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/stats').then(r => r.json()).then(setStats);
    fetch('/api/admin/orders').then(r => r.json()).then(d => setOrders(d.orders || []));
  }, [authed]);

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: '1.5rem',
            fontWeight: 800, color: '#E8E8E8', marginBottom: 24,
            textAlign: 'center', letterSpacing: '-0.02em',
          }}>
            GWDS Admin
          </h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            placeholder="Password"
            style={{
              width: '100%', padding: '14px 16px',
              background: '#111', border: '1px solid #222',
              borderRadius: 8, color: '#E8E8E8',
              fontSize: '0.88rem', fontFamily: 'var(--font-body)',
              outline: 'none', marginBottom: 12,
            }}
          />
          <button
            onClick={login}
            style={{
              width: '100%', padding: '14px',
              borderRadius: 8, border: 'none',
              background: '#8B5CF6', color: '#fff',
              fontSize: '0.85rem', fontWeight: 700,
              fontFamily: 'var(--font-display)',
              cursor: 'pointer', letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const cardStyle = {
    padding: 24, borderRadius: 12,
    background: '#0a0a0a', border: '1px solid #1a1a1a',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>
            GWDS Admin
          </span>
          {['Dashboard', 'Products', 'Orders', 'Customers'].map(item => (
            <Link
              key={item}
              href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{
                fontSize: '0.78rem', color: '#888', textDecoration: 'none',
                fontFamily: 'var(--font-body)', fontWeight: 500,
              }}
            >
              {item}
            </Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>
          ← Back to site
        </Link>
      </nav>

      {/* Content */}
      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.8rem',
          fontWeight: 800, marginBottom: 32, letterSpacing: '-0.03em',
        }}>
          Dashboard
        </h1>

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Total Revenue', value: stats?.totalRevenue ? `$${stats.totalRevenue}` : '$0', color: '#10B981' },
            { label: 'Orders', value: stats?.totalOrders || '0', color: '#8B5CF6' },
            { label: 'Products', value: stats?.totalProducts || '0', color: '#F59E0B' },
            { label: 'Customers', value: stats?.totalCustomers || '0', color: '#EC4899' },
          ].map(s => (
            <div key={s.label} style={cardStyle}>
              <p style={{ fontSize: '0.68rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', marginBottom: 8 }}>
                {s.label}
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
              Recent Orders
            </h2>
            <Link href="/admin/orders" style={{ fontSize: '0.72rem', color: '#8B5CF6', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>

          {orders.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>No orders yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Order ID', 'Customer', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left',
                      fontSize: '0.68rem', color: '#555',
                      fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order: any) => (
                  <tr key={order.orderId || order.order_id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', fontFamily: 'var(--font-mono, monospace)', color: '#ccc' }}>
                      {(order.orderId || order.order_id || '').slice(0, 20)}...
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.78rem', color: '#999' }}>{order.email}</td>
                    <td style={{ padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700, color: '#E8E8E8' }}>${order.total}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        fontSize: '0.65rem', fontWeight: 600,
                        background: order.status === 'completed' ? '#10B98120' : '#F59E0B20',
                        color: order.status === 'completed' ? '#10B981' : '#F59E0B',
                        textTransform: 'uppercase',
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '0.72rem', color: '#555' }}>
                      {new Date(order.createdAt || order.created_at).toLocaleDateString()}
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
