'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SubscribersAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (sessionStorage.getItem('gwds-admin') === 'true') setAuthed(true); }, []);
  const login = () => {
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      .then(r => r.json()).then(d => { if (d.ok) { setAuthed(true); sessionStorage.setItem('gwds-admin', 'true'); } else alert('Invalid password'); });
  };

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/subscribers').then(r => r.json()).then(d => { setSubscribers(d.subscribers || []); setLoading(false); });
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

  const active = subscribers.filter(s => s.is_active);
  const inactive = subscribers.filter(s => !s.is_active);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      <nav style={{ padding: '16px 32px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>GWDS Admin</span>
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons', 'Subscribers', 'Messages'].map(item => (
            <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{ fontSize: '0.78rem', color: item === 'Subscribers' ? '#8B5CF6' : '#888', textDecoration: 'none', fontWeight: item === 'Subscribers' ? 700 : 500 }}>{item}</Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Back to site</Link>
      </nav>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>Newsletter Subscribers</h1>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ padding: '8px 16px', borderRadius: 8, background: '#10B98115', border: '1px solid #10B98130' }}>
              <span style={{ fontSize: '0.7rem', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active</span>
              <span style={{ marginLeft: 8, fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>{active.length}</span>
            </div>
            <div style={{ padding: '8px 16px', borderRadius: 8, background: '#55555515', border: '1px solid #55555530' }}>
              <span style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Unsubscribed</span>
              <span style={{ marginLeft: 8, fontSize: '1.1rem', fontWeight: 800, color: '#555' }}>{inactive.length}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: 24, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          {loading ? <p style={{ color: '#555' }}>Loading...</p> : subscribers.length === 0 ? <p style={{ color: '#555' }}>No subscribers yet</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Email', 'Source', 'Status', 'Subscribed'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#555', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {subscribers.map((s: any) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem', color: '#E8E8E8' }}>{s.email}</td>
                    <td style={{ padding: '12px', fontSize: '0.78rem', color: '#888' }}>{s.source}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: s.is_active ? '#10B98120' : '#55555520', color: s.is_active ? '#10B981' : '#555', textTransform: 'uppercase' }}>
                        {s.is_active ? 'active' : 'unsubscribed'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.75rem', color: '#666' }}>{new Date(s.subscribed_at).toLocaleDateString()}</td>
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
