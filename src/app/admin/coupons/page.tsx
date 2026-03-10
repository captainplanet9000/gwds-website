'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  min_order: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyForm = {
  code: '',
  description: '',
  discount_type: 'percentage' as const,
  discount_value: 10,
  max_uses: '',
  min_order: 0,
  is_active: true,
  expires_at: '',
};

export default function CouponsAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const saved = sessionStorage.getItem('gwds-admin');
    if (saved === 'true') setAuthed(true);
  }, []);

  const login = () => {
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(r => r.json()).then(d => {
      if (d.ok) { setAuthed(true); sessionStorage.setItem('gwds-admin', 'true'); }
      else alert('Invalid password');
    });
  };

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/coupons');
    const data = await res.json();
    setCoupons(data.coupons || []);
    setLoading(false);
  };

  useEffect(() => { if (authed) fetchCoupons(); }, [authed]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      description: c.description,
      discount_type: c.discount_type as 'percentage' | 'fixed',
      discount_value: c.discount_value,
      max_uses: c.max_uses?.toString() || '',
      min_order: c.min_order,
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '',
    });
    setEditingId(c.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!form.code.trim()) { setError('Code is required'); return; }
    if (form.discount_value <= 0) { setError('Discount value must be greater than 0'); return; }

    const payload = {
      code: form.code.trim(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      min_order: Number(form.min_order) || 0,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const url = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed'); return; }

    setSuccess(editingId ? 'Coupon updated' : 'Coupon created');
    resetForm();
    fetchCoupons();
    setTimeout(() => setSuccess(''), 3000);
  };

  const toggleActive = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !c.is_active }),
    });
    fetchCoupons();
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Delete coupon ${c.code}?`)) return;
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
    fetchCoupons();
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 24, textAlign: 'center' }}>GWDS Admin</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Password"
            style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: 12 }} />
          <button onClick={login}
            style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Login
          </button>
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: '#111', border: '1px solid #222',
    borderRadius: 8, color: '#E8E8E8', fontSize: '0.85rem', fontFamily: 'var(--font-body)', outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: 6,
    fontFamily: 'var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontWeight: 600,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      <nav style={{ padding: '16px 32px', borderBottom: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>GWDS Admin</span>
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons', 'Coupons'].map(item => (
            <Link key={item} href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{ fontSize: '0.78rem', color: item === 'Coupons' ? '#8B5CF6' : '#888', textDecoration: 'none', fontFamily: 'var(--font-body)', fontWeight: item === 'Coupons' ? 700 : 500 }}>
              {item}
            </Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Back to site</Link>
      </nav>

      <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Coupons
          </h1>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            + New Coupon
          </button>
        </div>

        {success && (
          <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: '#10B98115', border: '1px solid #10B98140', color: '#10B981', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}>
            {success}
          </div>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <div style={{ marginBottom: 32, padding: 24, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
                {editingId ? 'Edit Coupon' : 'Create Coupon'}
              </h2>
              <button onClick={resetForm}
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Code</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                  placeholder="SUMMER20" style={{ ...inputStyle, textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em' }} />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.discount_type} onChange={e => setForm({ ...form, discount_type: e.target.value as any })}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Discount Value</label>
                <input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })}
                  placeholder={form.discount_type === 'percentage' ? '25' : '50'} min={0} max={form.discount_type === 'percentage' ? 100 : undefined} style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Launch sale - 25% off everything" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Max Uses (blank = unlimited)</label>
                <input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })}
                  placeholder="Unlimited" min={1} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Min Order ($)</label>
                <input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: Number(e.target.value) })}
                  placeholder="0" min={0} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Expires (blank = never)</label>
                <input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })}
                  style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  style={{ width: 18, height: 18, accentColor: '#8B5CF6' }} />
                <span style={{ fontSize: '0.85rem', color: '#ccc', fontFamily: 'var(--font-body)' }}>Active</span>
              </label>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: '#1a0a0a', border: '1px solid #EF444440', color: '#EF4444', fontSize: '0.82rem', fontFamily: 'var(--font-body)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleSubmit}
                style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-display)', cursor: 'pointer' }}>
                {editingId ? 'Save Changes' : 'Create Coupon'}
              </button>
              <button onClick={resetForm}
                style={{ padding: '12px 28px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#888', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Coupons Table */}
        <div style={{ padding: 24, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
          {loading ? (
            <p style={{ color: '#555', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>Loading...</p>
          ) : coupons.length === 0 ? (
            <p style={{ color: '#555', fontSize: '0.85rem', fontFamily: 'var(--font-body)' }}>No coupons yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Code', 'Discount', 'Usage', 'Min Order', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#555',
                      fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isMaxed = c.max_uses && c.used_count >= c.max_uses;
                  const status = !c.is_active ? 'inactive' : isExpired ? 'expired' : isMaxed ? 'maxed' : 'active';
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    active: { bg: '#10B98120', text: '#10B981' },
                    inactive: { bg: '#55555520', text: '#555' },
                    expired: { bg: '#EF444420', text: '#EF4444' },
                    maxed: { bg: '#F59E0B20', text: '#F59E0B' },
                  };

                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '12px', fontSize: '0.85rem', fontFamily: 'var(--font-mono, monospace)', color: '#E8E8E8', fontWeight: 700, letterSpacing: '0.05em' }}>
                        {c.code}
                        {c.description && <div style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'var(--font-body)', fontWeight: 400, marginTop: 2 }}>{c.description}</div>}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.88rem', fontWeight: 700, color: '#8B5CF6' }}>
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: '#999', fontFamily: 'var(--font-body)' }}>
                        {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ' / ∞'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.82rem', color: '#999' }}>
                        {c.min_order > 0 ? `$${c.min_order}` : '—'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.75rem', color: '#666' }}>
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 4, fontSize: '0.65rem', fontWeight: 600,
                          background: statusColors[status].bg, color: statusColors[status].text,
                          textTransform: 'uppercase',
                        }}>{status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => startEdit(c)}
                            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#ccc', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                            Edit
                          </button>
                          <button onClick={() => toggleActive(c)}
                            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: c.is_active ? '#F59E0B' : '#10B981', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                            {c.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button onClick={() => handleDelete(c)}
                            style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #333', background: 'transparent', color: '#EF4444', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                            Delete
                          </button>
                        </div>
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

