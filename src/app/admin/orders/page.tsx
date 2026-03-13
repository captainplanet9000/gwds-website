'use client';
import { useState, useEffect } from 'react';

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 24, textAlign: 'center' }}>GWDS Admin</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Password"
          style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
        <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Login</button>
      </div>
    </div>
  );

  const completed = orders.filter(o => o.status === 'completed');
  const pending = orders.filter(o => o.status !== 'completed');
  const totalRev = completed.reduce((s, o) => s + ((o.total_cents || 0) / 100), 0);

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>Orders</h1>

      <div className="admin-stat-grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Revenue', value: `$${totalRev.toFixed(2)}`, color: '#10B981' },
          { label: 'Completed', value: completed.length, color: '#10B981' },
          { label: 'Pending', value: pending.length, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="admin-card" style={{ padding: 20, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <p style={{ fontSize: '0.68rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
            <p className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 24, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        {loading ? <p style={{ color: '#555' }}>Loading...</p> : orders.length === 0 ? <p style={{ color: '#555' }}>No orders yet</p> : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Order ID', 'Customer', 'Amount', 'Coupon', 'Status', 'Date', ''].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {orders.map((o: any) => {
                  const gwdsId = o.stripe_session_id?.startsWith('local-') ? o.stripe_session_id.replace('local-', '') : null;
                  return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '0.72rem', color: '#8B5CF6', fontFamily: 'var(--font-mono, monospace)' }}>{gwdsId || o.id.slice(0, 8)}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#E8E8E8', whiteSpace: 'nowrap' }}>{o.customer_name || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#666', whiteSpace: 'nowrap' }}>{o.customer_email}</div>
                    </td>
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#E8E8E8' }}>${((o.total_cents || 0) / 100).toFixed(2)}</span>
                      {o.discount_cents > 0 && <div style={{ fontSize: '0.68rem', color: '#10B981' }}>-${(o.discount_cents / 100).toFixed(2)} off</div>}
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.78rem', color: o.coupon_code ? '#F59E0B' : '#333', fontFamily: 'var(--font-mono, monospace)', whiteSpace: 'nowrap' }}>{o.coupon_code || '—'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: o.status === 'completed' ? '#10B98120' : o.status === 'pending' ? '#F59E0B20' : '#EF444420', color: o.status === 'completed' ? '#10B981' : o.status === 'pending' ? '#F59E0B' : '#EF4444', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{new Date(o.created_at).toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>
                      {o.status === 'completed' && gwdsId && (
                        <a href={`/downloads/${gwdsId}`} target="_blank" rel="noopener" style={{ fontSize: '0.72rem', color: '#8B5CF6', textDecoration: 'none', whiteSpace: 'nowrap' }}>Downloads ↗</a>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
