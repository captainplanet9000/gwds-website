'use client';
import { useState, useEffect } from 'react';

export default function MessagesAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (sessionStorage.getItem('gwds-admin') === 'true') setAuthed(true); }, []);
  const login = () => {
    fetch('/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      .then(r => r.json()).then(d => { if (d.ok) { setAuthed(true); sessionStorage.setItem('gwds-admin', 'true'); } else alert('Invalid password'); });
  };

  const fetchContacts = () => { fetch('/api/admin/contacts').then(r => r.json()).then(d => { setContacts(d.contacts || []); setLoading(false); }); };
  useEffect(() => { if (authed) fetchContacts(); }, [authed]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/contacts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchContacts();
  };

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

  const statusColors: Record<string, { bg: string; text: string }> = {
    new: { bg: '#8B5CF620', text: '#8B5CF6' }, read: { bg: '#F59E0B20', text: '#F59E0B' },
    replied: { bg: '#10B98120', text: '#10B981' }, archived: { bg: '#55555520', text: '#555' },
  };

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 32 }}>Contact Messages</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? <p style={{ color: '#555' }}>Loading...</p> : contacts.length === 0 ? <p style={{ color: '#555' }}>No messages yet</p> :
          contacts.map((c: any) => (
            <div key={c.id} className="admin-card" style={{ padding: 20, borderRadius: 12, background: '#0a0a0a', border: `1px solid ${c.status === 'new' ? '#8B5CF640' : '#1a1a1a'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E8E8' }}>{c.name}</span>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>{c.email}</span>
                  <span style={{ fontSize: '0.72rem', color: '#555' }}>{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, background: (statusColors[c.status] || statusColors.new).bg, color: (statusColors[c.status] || statusColors.new).text, textTransform: 'uppercase' }}>{c.status}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#F59E0B', marginBottom: 8 }}>{c.subject}</div>
              <div style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{c.message}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['read', 'replied', 'archived'].map(s => (
                  <button key={s} onClick={() => updateStatus(c.id, s)} disabled={c.status === s}
                    style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #333', background: c.status === s ? '#222' : 'transparent', color: c.status === s ? '#555' : '#888', fontSize: '0.7rem', cursor: c.status === s ? 'default' : 'pointer', textTransform: 'capitalize' }}>{s}</button>
                ))}
                <a href={`mailto:${c.email}?subject=Re: ${c.subject}`} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #8B5CF640', color: '#8B5CF6', fontSize: '0.7rem', textDecoration: 'none' }}>Reply ↗</a>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );
}
