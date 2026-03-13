'use client';
import { useState, useEffect } from 'react';

export default function AdminCustomers() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (sessionStorage.getItem('gwds-admin') === 'true') setAuthed(true); }, []);
  const login = () => {
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      .then(r => r.json()).then(d => { if (d.ok) { setAuthed(true); sessionStorage.setItem('gwds-admin', 'true'); } else alert('Invalid password'); });
  };

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/customers').then(r => r.json()).then(d => { setCustomers(d.customers || []); setLoading(false); }).catch(() => setLoading(false));
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

  const totalLTV = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.order_count || 0), 0);

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>Customers</h1>

      <div className="admin-stat-grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Customers', value: customers.length, color: '#EC4899' },
          { label: 'Total LTV', value: `$${totalLTV.toFixed(0)}`, color: '#10B981' },
          { label: 'Total Orders', value: totalOrders, color: '#8B5CF6' },
        ].map(s => (
          <div key={s.label} className="admin-card" style={{ padding: 20, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <p style={{ fontSize: '0.68rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</p>
            <p className="stat-value" style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 24, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
        {loading ? <p style={{ color: '#555' }}>Loading...</p> : customers.length === 0 ? <p style={{ color: '#555' }}>No customers yet</p> : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Email', 'Name', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#E8E8E8', whiteSpace: 'nowrap' }}>{c.email}</td>
                    <td style={{ padding: '12px', fontSize: '0.82rem', color: '#888', whiteSpace: 'nowrap' }}>{c.name || '—'}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#8B5CF6' }}>{c.order_count}</td>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#10B981', whiteSpace: 'nowrap' }}>${Number(c.total_spent || 0).toFixed(0)}</td>
                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{c.last_order_at ? new Date(c.last_order_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
