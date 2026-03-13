'use client';
import { useState, useEffect } from 'react';

interface Coupon {
  id: string; code: string; description: string; discount_type: 'percentage' | 'fixed';
  discount_value: number; max_uses: number | null; used_count: number; min_order: number;
  is_active: boolean; expires_at: string | null; created_at: string;
}

const emptyForm = { 
  code: '', description: '', discount_type: 'percentage' as const, 
  discount_value: 10, max_uses: '', min_order: 0, is_active: true, expires_at: '' 
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
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { 
    if (sessionStorage.getItem('gwds-admin') === 'true') setAuthed(true); 
  }, []);

  const login = () => {
    fetch('/api/admin/auth', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ password }) 
    })
    .then(r => r.json())
    .then(d => { 
      if (d.ok) { 
        setAuthed(true); 
        sessionStorage.setItem('gwds-admin', 'true'); 
      } else {
        alert('Invalid password'); 
      }
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
      discount_type: c.discount_type, 
      discount_value: c.discount_value, 
      max_uses: c.max_uses?.toString() || '', 
      min_order: c.min_order, 
      is_active: c.is_active, 
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '' 
    });
    setEditingId(c.id); 
    setShowForm(true); 
    setError('');
  };

  const handleSubmit = async () => {
    setError(''); 
    setSuccess('');
    if (!form.code.trim()) { setError('Code is required'); return; }
    if (form.discount_value <= 0) { setError('Discount must be > 0'); return; }
    
    const payload = { 
      code: form.code.trim().toUpperCase(), 
      description: form.description, 
      discount_type: form.discount_type, 
      discount_value: Number(form.discount_value), 
      max_uses: form.max_uses ? Number(form.max_uses) : null, 
      min_order: Number(form.min_order) || 0, 
      is_active: form.is_active, 
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null 
    };
    
    const url = editingId ? `/api/admin/coupons/${editingId}` : '/api/admin/coupons';
    const res = await fetch(url, { 
      method: editingId ? 'PUT' : 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });
    const data = await res.json();
    
    if (!res.ok) { setError(data.error || 'Failed'); return; }
    
    setSuccess(editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!'); 
    resetForm(); 
    fetchCoupons(); 
    setTimeout(() => setSuccess(''), 3000);
  };

  const toggleActive = async (c: Coupon) => { 
    await fetch(`/api/admin/coupons/${c.id}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ is_active: !c.is_active }) 
    }); 
    fetchCoupons(); 
  };

  const handleDelete = async (c: Coupon) => { 
    if (!confirm(`Delete coupon "${c.code}"? This cannot be undone.`)) return; 
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' }); 
    fetchCoupons(); 
  };

  if (!authed) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 24, textAlign: 'center' }}>GWDS Admin</h1>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && login()} 
          placeholder="Password"
          style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} 
        />
        <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Login</button>
      </div>
    </div>
  );

  const filteredCoupons = coupons.filter(c => {
    const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
    const isMaxed = c.max_uses && c.used_count >= c.max_uses;
    
    if (filter === 'active' && (!c.is_active || isExpired || isMaxed)) return false;
    if (filter === 'inactive' && c.is_active) return false;
    if (filter === 'expired' && !isExpired) return false;
    if (search && !c.code.toLowerCase().includes(search.toLowerCase()) && !c.description?.toLowerCase().includes(search.toLowerCase())) return false;
    
    return true;
  });

  const activeCoupons = coupons.filter(c => {
    const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
    const isMaxed = c.max_uses && c.used_count >= c.max_uses;
    return c.is_active && !isExpired && !isMaxed;
  });
  
  const totalRedemptions = coupons.reduce((s, c) => s + c.used_count, 0);
  const totalRevenue = 0; // Would need order data to calculate accurately
  
  const inputStyle: React.CSSProperties = { 
    width: '100%', 
    padding: '12px 14px', 
    background: '#111', 
    border: '1px solid #222', 
    borderRadius: 8, 
    color: '#E8E8E8', 
    fontSize: '0.85rem', 
    fontFamily: 'var(--font-body)', 
    outline: 'none', 
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease'
  };
  
  const labelStyle: React.CSSProperties = { 
    display: 'block', 
    fontSize: '0.7rem', 
    color: '#666', 
    marginBottom: 6, 
    fontFamily: 'var(--font-body)', 
    letterSpacing: '0.05em', 
    textTransform: 'uppercase', 
    fontWeight: 600 
  };

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2rem', 
          fontWeight: 800, 
          marginBottom: 8,
          letterSpacing: '-0.03em',
          color: '#E8E8E8'
        }}>Coupons</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Manage discount codes and promotional offers
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Coupons', value: coupons.length, color: '#8B5CF6', icon: '🎟️' },
          { label: 'Active', value: activeCoupons.length, color: '#10B981', icon: '✓' },
          { label: 'Total Redemptions', value: totalRedemptions, color: '#F59E0B', icon: '🔄' },
          { label: 'Revenue from Coupons', value: `$${totalRevenue.toLocaleString()}`, color: '#EC4899', icon: '💰' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: 12,
            padding: 20,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              background: `radial-gradient(circle at top right, ${s.color}15, transparent)`
            }}></div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <p style={{ fontSize: '0.72rem', color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {success && (
        <div style={{ 
          marginBottom: 20, 
          padding: '14px 18px', 
          borderRadius: 8, 
          background: '#10B98115', 
          border: '1px solid #10B98140', 
          color: '#10B981', 
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: '1.2rem' }}>✓</span>
          {success}
        </div>
      )}

      {/* Create Button */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="admin-btn-primary"
          style={{ 
            padding: '12px 24px', 
            borderRadius: 8, 
            border: 'none', 
            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
            color: '#fff', 
            fontSize: '0.82rem', 
            fontWeight: 700, 
            cursor: 'pointer', 
            transition: 'all 0.15s ease',
            letterSpacing: '0.03em'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #9D6EFF, #F768AA)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          + Create Coupon
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ 
          marginBottom: 24, 
          padding: 24, 
          borderRadius: 12, 
          background: '#0a0a0a', 
          border: '1px solid #1a1a1a',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              color: '#E8E8E8'
            }}>
              {editingId ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <button 
              onClick={resetForm} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                cursor: 'pointer', 
                fontSize: '1.2rem',
                padding: '4px 8px',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#E8E8E8'}
              onMouseLeave={e => e.currentTarget.style.color = '#666'}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Code</label>
              <input 
                value={form.code} 
                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} 
                placeholder="SUMMER20" 
                style={{ 
                  ...inputStyle, 
                  textTransform: 'uppercase', 
                  fontFamily: 'var(--font-mono, monospace)', 
                  letterSpacing: '0.08em',
                  fontWeight: 600
                }} 
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select 
                value={form.discount_type} 
                onChange={e => setForm({ ...form, discount_type: e.target.value as any })} 
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = '#222'}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Discount Value</label>
              <input 
                type="number" 
                value={form.discount_value} 
                onChange={e => setForm({ ...form, discount_value: Number(e.target.value) })} 
                min={0} 
                step={form.discount_type === 'percentage' ? 1 : 0.01}
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description (Optional)</label>
            <input 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
              placeholder="e.g., Launch sale - 25% off everything" 
              style={inputStyle} 
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Max Uses (blank = unlimited)</label>
              <input 
                type="number" 
                value={form.max_uses} 
                onChange={e => setForm({ ...form, max_uses: e.target.value })} 
                placeholder="Unlimited" 
                min={1} 
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>
            <div>
              <label style={labelStyle}>Min Order Amount ($)</label>
              <input 
                type="number" 
                value={form.min_order} 
                onChange={e => setForm({ ...form, min_order: Number(e.target.value) })} 
                placeholder="0" 
                min={0} 
                step={0.01}
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>
            <div>
              <label style={labelStyle}>Expires (blank = never)</label>
              <input 
                type="date" 
                value={form.expires_at} 
                onChange={e => setForm({ ...form, expires_at: e.target.value })} 
                style={{ ...inputStyle, colorScheme: 'dark' }} 
                onFocus={e => e.target.style.borderColor = '#8B5CF6'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div style={{ position: 'relative', width: 48, height: 26, background: form.is_active ? '#10B981' : '#333', borderRadius: 13, transition: 'background 0.2s ease', cursor: 'pointer' }}
                onClick={() => setForm({ ...form, is_active: !form.is_active })}>
                <div style={{ 
                  position: 'absolute', 
                  top: 3, 
                  left: form.is_active ? 25 : 3, 
                  width: 20, 
                  height: 20, 
                  background: '#fff', 
                  borderRadius: '50%', 
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 500 }}>
                Active {form.is_active ? '(enabled)' : '(disabled)'}
              </span>
            </label>
          </div>

          {error && (
            <div style={{ 
              marginBottom: 16, 
              padding: '12px 16px', 
              borderRadius: 8, 
              background: '#1a0a0a', 
              border: '1px solid #EF444440', 
              color: '#EF4444', 
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: '1.1rem' }}>⚠</span>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button 
              onClick={handleSubmit} 
              style={{ 
                padding: '12px 28px', 
                borderRadius: 8, 
                border: 'none', 
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
                color: '#fff', 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #9D6EFF, #F768AA)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {editingId ? 'Save Changes' : 'Create Coupon'}
            </button>
            <button 
              onClick={resetForm} 
              className="admin-btn"
              style={{ 
                padding: '12px 28px', 
                borderRadius: 8, 
                border: '1px solid #333', 
                background: 'transparent', 
                color: '#888', 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#555';
                e.currentTarget.style.color = '#E8E8E8';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.color = '#888';
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search by code or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#111',
              border: '1px solid #1a1a1a',
              borderRadius: 8,
              color: '#E8E8E8',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
            onFocus={e => e.target.style.borderColor = '#8B5CF6'}
            onBlur={e => e.target.style.borderColor = '#1a1a1a'}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'active', 'inactive', 'expired'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: filter === f ? '1px solid #8B5CF6' : '1px solid #1a1a1a',
                background: filter === f ? '#8B5CF610' : 'transparent',
                color: filter === f ? '#8B5CF6' : '#888',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (filter !== f) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#E8E8E8';
                }
              }}
              onMouseLeave={e => {
                if (filter !== f) {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                border: '3px solid #1a1a1a', 
                borderTopColor: '#8B5CF6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading coupons...</span>
            </div>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>🎟️</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No coupons found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>
              {search || filter !== 'all' ? 'Try adjusting your filters' : 'Create your first coupon to get started'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
                  {['Code', 'Type', 'Discount', 'Usage', 'Min Order', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ 
                      padding: '16px 12px', 
                      textAlign: 'left', 
                      fontSize: '0.7rem', 
                      color: '#666', 
                      fontWeight: 600, 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(c => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  const isMaxed = c.max_uses && c.used_count >= c.max_uses;
                  const status = !c.is_active ? 'inactive' : isExpired ? 'expired' : isMaxed ? 'maxed' : 'active';
                  const statusColors: Record<string, { bg: string; text: string }> = { 
                    active: { bg: '#10B98120', text: '#10B981' }, 
                    inactive: { bg: '#55555520', text: '#555' }, 
                    expired: { bg: '#EF444420', text: '#EF4444' }, 
                    maxed: { bg: '#F59E0B20', text: '#F59E0B' } 
                  };
                  const usagePercent = c.max_uses ? (c.used_count / c.max_uses) * 100 : 0;
                  
                  return (
                    <tr 
                      key={c.id} 
                      style={{ 
                        borderBottom: '1px solid #111',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          fontFamily: 'var(--font-mono, monospace)', 
                          color: '#E8E8E8', 
                          fontWeight: 700, 
                          letterSpacing: '0.05em', 
                          whiteSpace: 'nowrap',
                          marginBottom: c.description ? 4 : 0
                        }}>
                          {c.code}
                        </div>
                        {c.description && (
                          <div style={{ 
                            fontSize: '0.72rem', 
                            color: '#666', 
                            fontWeight: 400,
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: c.discount_type === 'percentage' ? '#8B5CF615' : '#10B98115',
                          color: c.discount_type === 'percentage' ? '#8B5CF6' : '#10B981',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}>
                          {c.discount_type === 'percentage' ? 'Percent' : 'Fixed'}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px 12px', 
                        fontSize: '1rem', 
                        fontWeight: 700, 
                        color: '#F59E0B',
                        fontFamily: 'var(--font-display)',
                        whiteSpace: 'nowrap'
                      }}>
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#999', marginBottom: 4, whiteSpace: 'nowrap' }}>
                          {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ' / ∞'}
                        </div>
                        {c.max_uses && (
                          <div style={{ 
                            width: 100, 
                            height: 6, 
                            background: '#1a1a1a', 
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.min(usagePercent, 100)}%`, 
                              height: '100%', 
                              background: usagePercent >= 100 ? '#EF4444' : usagePercent >= 75 ? '#F59E0B' : '#10B981',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '0.82rem', color: '#999', whiteSpace: 'nowrap' }}>
                        {c.min_order > 0 ? `$${c.min_order}` : '—'}
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap' }}>
                        {c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '5px 12px', 
                          borderRadius: 6, 
                          fontSize: '0.7rem', 
                          fontWeight: 600, 
                          background: statusColors[status].bg, 
                          color: statusColors[status].text, 
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.03em'
                        }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button 
                            onClick={() => startEdit(c)} 
                            className="admin-btn"
                            style={{ 
                              padding: '6px 14px', 
                              borderRadius: 6, 
                              border: '1px solid #333', 
                              background: 'transparent', 
                              color: '#ccc', 
                              fontSize: '0.72rem', 
                              fontWeight: 600, 
                              cursor: 'pointer', 
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#8B5CF6';
                              e.currentTarget.style.color = '#8B5CF6';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#333';
                              e.currentTarget.style.color = '#ccc';
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => toggleActive(c)} 
                            style={{ 
                              padding: '6px 14px', 
                              borderRadius: 6, 
                              border: '1px solid #333', 
                              background: 'transparent', 
                              color: c.is_active ? '#F59E0B' : '#10B981', 
                              fontSize: '0.72rem', 
                              fontWeight: 600, 
                              cursor: 'pointer', 
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = c.is_active ? '#F59E0B' : '#10B981';
                              e.currentTarget.style.background = c.is_active ? '#F59E0B10' : '#10B98110';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#333';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {c.is_active ? 'Disable' : 'Enable'}
                          </button>
                          <button 
                            onClick={() => handleDelete(c)} 
                            style={{ 
                              padding: '6px 14px', 
                              borderRadius: 6, 
                              border: '1px solid #333', 
                              background: 'transparent', 
                              color: '#EF4444', 
                              fontSize: '0.72rem', 
                              fontWeight: 600, 
                              cursor: 'pointer', 
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#EF4444';
                              e.currentTarget.style.background = '#EF444410';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = '#333';
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            Delete
                          </button>
                        </div>
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
