'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminOrders() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (sessionStorage.getItem('gwds-admin') === 'true') setAuthed(true); }, []);
  const login = () => {
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      .then(r => r.json()).then(d => { if (d.ok) { setAuthed(true); sessionStorage.setItem('gwds-admin', 'true'); } else alert('Invalid password'); });
  };

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/orders').then(r => r.json()).then(d => { setOrders(d.orders || []); setLoading(false); }).catch(() => setLoading(false));
  }, [authed]);

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 24, textAlign: 'center' }}>GWDS Admin</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Password"
          style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', outline: 'none', marginBottom: 12 }} />
        <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Login</button>
      </div>
    </div>
  );

  const completed = orders.filter(o => o.status === 'completed');
  const pending = orders.filter(o => o.status !== 'completed');
  const totalRev = completed.reduce((s, o) => s + ((o.total_cents || 0) / 100), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      <nav style={{ padding: '16px 32px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>GWDS Admin</span>
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons', 'Subscribers', 'Messages'].map(item => (
            <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{ fontSize: '0.78rem', color: item === 'Orders' ? '#8B5CF6' : '#888', textDecoration: 'none', fontWeight: item === 'Orders' ? 700 : 500 }}>{item}</Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Back to site</Link>
      </nav>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>Orders</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Revenue', value: `$${totalRev.toFixed(2)}`, color: '#10B981' },
            { label: 'Completed', value: completed.length, color: '#10B981' },
            { label: 'Pending', value: pending.length, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ padding: 20, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
              <p style={{ fontSize: '0.68rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ padding: 24, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          {loading ? <p style={{ color: '#555' }}>Loading...</p> : orders.length === 0 ? <p style={{ color: '#555' }}>No orders yet</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Order ID', 'Customer', 'Amount', 'Coupon', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orders.map((o: any) => {
                  // Extract GWDS order ID from stripe_session_id for free orders
                  const gwdsId = o.stripe_session_id?.startsWith('local-') ? o.stripe_session_id.replace('local-', '') : null;
                  return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8B5CF6', fontFamily: 'var(--font-mono, monospace)' }}>{gwdsId || o.id.slice(0, 8)}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#E8E8E8' }}>{o.customer_name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#666' }}>{o.customer_email}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E8E8E8' }}>${((o.total_cents || 0) / 100).toFixed(2)}</span>
                      {o.discount_cents > 0 && <div style={{ fontSize: '0.68rem', color: '#10B981' }}>-${(o.discount_cents / 100).toFixed(2)} discount</div>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.78rem', color: o.coupon_code ? '#F59E0B' : '#333', fontFamily: 'var(--font-mono, monospace)' }}>{o.coupon_code || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: o.status === 'completed' ? '#10B98120' : o.status === 'pending' ? '#F59E0B20' : '#EF444420', color: o.status === 'completed' ? '#10B981' : o.status === 'pending' ? '#F59E0B' : '#EF4444', textTransform: 'uppercase' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#666' }}>{new Date(o.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      {o.status === 'completed' && gwdsId && (
                        <a href={`/downloads/${gwdsId}`} target="_blank" rel="noopener" style={{ fontSize: '0.72rem', color: '#8B5CF6', textDecoration: 'none' }}>Downloads ↗</a>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
