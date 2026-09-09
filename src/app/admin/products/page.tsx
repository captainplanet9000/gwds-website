'use client';
import { useState, useEffect, useMemo } from 'react';

interface DbProduct {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  category: string | null;
  badge: string | null;
  emoji: string;
  features: string[];
  image_url: string | null;
  stripe_price_id: string | null;
  download_url: string | null;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  version: string | null;
  artifact_path: string | null;
  artifact_sha256: string | null;
  artifact_size_bytes: number | null;
  artifact_ready: boolean;
}

interface ProductForm {
  id: string;
  name: string;
  description: string;
  price: number; // dollars, in the form only — converted to price_cents on submit
  category: string;
  badge: string;
  emoji: string;
  features: string; // one per line in the form
  image_url: string;
  stripe_price_id: string;
  download_url: string;
  version: string;
  artifact_path: string;
  artifact_sha256: string;
  artifact_size_bytes: string;
  artifact_ready: boolean;
  is_active: boolean;
}

const emptyForm: ProductForm = {
  id: '', name: '', description: '', price: 0, category: '', badge: '', emoji: '📦',
  features: '', image_url: '', stripe_price_id: '', download_url: '', version: '',
  artifact_path: '', artifact_sha256: '', artifact_size_bytes: '', artifact_ready: false, is_active: false,
};

function isSafeToSell(p: DbProduct) {
  return Boolean(p.artifact_ready && p.stripe_price_id && p.is_active);
}

export default function AdminProducts() {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'safe' | 'not_ready'>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchProducts(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); setError(''); };

  const startCreate = () => { resetForm(); setShowForm(true); };

  const startEdit = (p: DbProduct) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: p.price_cents / 100,
      category: p.category || '',
      badge: p.badge || '',
      emoji: p.emoji || '📦',
      features: (p.features || []).join('\n'),
      image_url: p.image_url || '',
      stripe_price_id: p.stripe_price_id || '',
      download_url: p.download_url || '',
      version: p.version || '',
      artifact_path: p.artifact_path || '',
      artifact_sha256: p.artifact_sha256 || '',
      artifact_size_bytes: p.artifact_size_bytes?.toString() || '',
      artifact_ready: p.artifact_ready,
      is_active: p.is_active,
    });
    setEditingId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (!editingId && !form.id.trim()) { setError('Product ID is required'); return; }
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (form.price < 0) { setError('Price cannot be negative'); return; }
    if (form.is_active && !form.artifact_ready) {
      setError('Cannot activate: Artifact Ready must be on first, or a customer will pay for a broken download.');
      return;
    }

    const featuresArr = form.features.split('\n').map((f) => f.trim()).filter(Boolean);

    if (editingId) {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        price_cents: Math.round(form.price * 100),
        category: form.category || null,
        badge: form.badge || null,
        emoji: form.emoji || '📦',
        features: featuresArr,
        image_url: form.image_url || null,
        stripe_price_id: form.stripe_price_id || null,
        download_url: form.download_url || null,
        version: form.version || null,
        artifact_path: form.artifact_path || null,
        artifact_sha256: form.artifact_sha256 || null,
        artifact_size_bytes: form.artifact_size_bytes ? Number(form.artifact_size_bytes) : null,
        artifact_ready: form.artifact_ready,
        is_active: form.is_active,
      };
      const res = await fetch(`/api/admin/products/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || 'Failed'); return; }
      setSuccess('Product updated successfully!');
    } else {
      const payload = {
        id: form.id.trim(),
        name: form.name.trim(),
        description: form.description,
        price_cents: Math.round(form.price * 100),
        category: form.category || null,
        badge: form.badge || null,
        emoji: form.emoji || '📦',
        features: featuresArr,
        image_url: form.image_url || null,
        stripe_price_id: form.stripe_price_id || null,
        download_url: form.download_url || null,
        version: form.version || null,
        artifact_path: form.artifact_path || null,
        artifact_sha256: form.artifact_sha256 || null,
        artifact_size_bytes: form.artifact_size_bytes ? Number(form.artifact_size_bytes) : null,
      };
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || 'Failed'); return; }
      setSuccess('Product created — it starts inactive and not artifact-ready until you finish staging it.');
    }

    resetForm();
    fetchProducts();
    setTimeout(() => setSuccess(''), 4000);
  };

  const toggleActive = async (p: DbProduct) => {
    setError('');
    if (!p.is_active && !p.artifact_ready) {
      setError(`Cannot activate "${p.name}": artifact_ready is false. Edit the product and mark its artifact ready first.`);
      return;
    }
    setBusyId(p.id);
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.is_active }),
    });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) { setError(data.message || data.error || 'Failed to toggle'); return; }
    fetchProducts();
  };

  const handleDelete = async (p: DbProduct) => {
    if (!confirm(`Delete "${p.name}" (${p.id})? This cannot be undone and will fail if it has order history.`)) return;
    setBusyId(p.id);
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) { setError(data.message || data.error || 'Failed to delete'); return; }
    fetchProducts();
  };

  const filtered = useMemo(() => products.filter((p) => {
    if (filter === 'active' && !p.is_active) return false;
    if (filter === 'inactive' && p.is_active) return false;
    if (filter === 'safe' && !isSafeToSell(p)) return false;
    if (filter === 'not_ready' && p.artifact_ready) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [products, filter, search]);

  const totalValue = products.reduce((s, p) => s + p.price_cents, 0) / 100;
  const activeCount = products.filter((p) => p.is_active).length;
  const safeCount = products.filter(isSafeToSell).length;
  const notReadyCount = products.filter((p) => !p.artifact_ready).length;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', background: 'var(--admin-surface-raised)', border: '1px solid #222', borderRadius: 8,
    color: 'var(--admin-text)', fontSize: '0.85rem', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s ease',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.7rem', color: 'var(--admin-text-dim)', marginBottom: 6, fontFamily: 'var(--font-body)',
    letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600,
  };

  const Toggle = ({ on, onClick, color = 'var(--admin-success)' }: { on: boolean; onClick: () => void; color?: string }) => (
    <div
      onClick={onClick}
      style={{ position: 'relative', width: 44, height: 24, background: on ? color : 'var(--admin-border-strong)', borderRadius: 12, transition: 'background 0.2s ease', cursor: 'pointer', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'left 0.2s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', color: 'var(--admin-text)' }}>Products</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-dim)' }}>Product catalog, pricing, and release readiness</p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Products', value: products.length, color: 'var(--admin-accent)', icon: '📦' },
          { label: 'Active', value: activeCount, color: 'var(--admin-success)', icon: '✓' },
          { label: 'Safe to Sell', value: safeCount, color: 'var(--admin-success)', icon: '🛡️' },
          { label: 'Not Artifact-Ready', value: notReadyCount, color: notReadyCount > 0 ? 'var(--admin-warning)' : 'var(--admin-text-dim)', icon: '⚠️' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${s.color}15, transparent)` }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', marginTop: -14, marginBottom: 24 }}>Catalog value (active + inactive, at list price): ${totalValue.toLocaleString()}</p>

      {success && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 8, background: 'var(--admin-success)15', border: '1px solid var(--admin-success)40', color: 'var(--admin-success)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>✓</span>{success}
        </div>
      )}
      {error && !showForm && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: 8, background: '#1a0a0a', border: '1px solid var(--admin-danger)40', color: 'var(--admin-danger)', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>⚠</span>{error}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <button
          onClick={startCreate}
          className="admin-btn-primary"
          style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent))', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease', letterSpacing: '0.03em' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #9D6EFF, #F768AA)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent))'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          + New Product
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: 24, padding: 24, borderRadius: 12, background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)' }}>
              {editingId ? `Edit Product — ${editingId}` : 'New Product'}
            </h2>
            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--admin-text-dim)', cursor: 'pointer', fontSize: '1.2rem', padding: '4px 8px' }}>✕</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            {!editingId && (
              <div>
                <label style={labelStyle}>Product ID (slug)</label>
                <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.trim() })} placeholder="scalper-pro" style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)' }} />
              </div>
            )}
            <div>
              <label style={labelStyle}>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Scalper Pro" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Price (USD)</label>
              <input type="number" min={0} step={0.01} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Emoji</label>
              <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="trading" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Badge (optional)</label>
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Best Seller" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Features (one per line)</label>
            <textarea value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} rows={4} placeholder={'Real-time signal engine\nBacktested on 5 years of data'} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }} />
          </div>

          <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 20, marginBottom: 20 }}>
            <p style={{ ...labelStyle, marginBottom: 14, color: 'var(--admin-accent)' }}>Release &amp; Fulfillment</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Stripe Price ID</label>
                <input value={form.stripe_price_id} onChange={(e) => setForm({ ...form, stripe_price_id: e.target.value })} placeholder="price_1AbC..." style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)' }} />
              </div>
              <div>
                <label style={labelStyle}>Download URL</label>
                <input value={form.download_url} onChange={(e) => setForm({ ...form, download_url: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Version</label>
                <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} placeholder="1.0.0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Artifact Path</label>
                <input value={form.artifact_path} onChange={(e) => setForm({ ...form, artifact_path: e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)' }} />
              </div>
              <div>
                <label style={labelStyle}>Artifact SHA-256</label>
                <input value={form.artifact_sha256} onChange={(e) => setForm({ ...form, artifact_sha256: e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem' }} />
              </div>
              <div>
                <label style={labelStyle}>Artifact Size (bytes)</label>
                <input type="number" min={0} value={form.artifact_size_bytes} onChange={(e) => setForm({ ...form, artifact_size_bytes: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Toggle on={form.artifact_ready} onClick={() => {
                  const next = !form.artifact_ready;
                  setForm({ ...form, artifact_ready: next, is_active: next ? form.is_active : false });
                }} color="var(--admin-warning)" />
                <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 500 }}>
                  Artifact Ready {form.artifact_ready ? '(verified, safe to deliver)' : '(NOT staged — do not activate)'}
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: form.artifact_ready ? 'pointer' : 'not-allowed', opacity: form.artifact_ready ? 1 : 0.5 }}>
                <Toggle on={form.is_active} onClick={() => {
                  if (!form.artifact_ready && !form.is_active) return;
                  setForm({ ...form, is_active: !form.is_active });
                }} />
                <span style={{ fontSize: '0.85rem', color: '#ccc', fontWeight: 500 }}>
                  Active (listed &amp; purchasable) {form.is_active ? '' : ''}
                </span>
              </label>
            </div>
            {!form.artifact_ready && (
              <p style={{ fontSize: '0.75rem', color: 'var(--admin-warning)', marginTop: 10 }}>
                Activation is locked until Artifact Ready is on — this is the guard that stops a customer from paying for a broken download.
              </p>
            )}
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: '#1a0a0a', border: '1px solid var(--admin-danger)40', color: 'var(--admin-danger)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>⚠</span>{error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleSubmit}
              style={{ padding: '12px 28px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent))', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              {editingId ? 'Save Changes' : 'Create Product'}
            </button>
            <button onClick={resetForm} className="admin-btn" style={{ padding: '12px 28px', borderRadius: 8, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'var(--admin-surface-raised)', border: '1px solid var(--admin-border)', borderRadius: 8, color: 'var(--admin-text)', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['all', 'active', 'inactive', 'safe', 'not_ready'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 18px', borderRadius: 8,
                border: filter === f ? '1px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                background: filter === f ? 'var(--admin-accent)10' : 'transparent',
                color: filter === f ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {f === 'not_ready' ? 'not ready' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 24, height: 24, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>Loading products...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>📦</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No products found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>{search || filter !== 'all' ? 'Try adjusting your filters' : 'Create your first product to get started'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}>
                  {['Product', 'Price', 'Artifact', 'Stripe', 'Status', 'Safe to Sell', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--admin-text-dim)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const safe = isSafeToSell(p);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--admin-surface-raised)' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: '1.4rem' }}>{p.emoji}</span>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--admin-text)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', fontFamily: 'var(--font-mono, monospace)' }}>{p.id}{p.version ? ` · v${p.version}` : ''}</div>
                            {p.badge && (
                              <span style={{ display: 'inline-block', marginTop: 4, fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, background: 'var(--admin-success)15', color: 'var(--admin-success)', fontWeight: 600 }}>{p.badge}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '1rem', fontWeight: 700, color: 'var(--admin-warning)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                        ${(p.price_cents / 100).toFixed(2)}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: p.artifact_ready ? 'var(--admin-success)15' : 'var(--admin-danger)15', color: p.artifact_ready ? 'var(--admin-success)' : 'var(--admin-danger)', whiteSpace: 'nowrap' }}>
                          {p.artifact_ready ? '✓ Ready' : '✕ Not Ready'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: p.stripe_price_id ? 'var(--admin-success)15' : 'var(--admin-text-dim)20', color: p.stripe_price_id ? 'var(--admin-success)' : 'var(--admin-text-dim)', whiteSpace: 'nowrap' }}>
                          {p.stripe_price_id ? '✓ Linked' : '— None'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ padding: '5px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: p.is_active ? 'var(--admin-success)20' : 'var(--admin-text-dim)20', color: p.is_active ? 'var(--admin-success)' : 'var(--admin-text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.03em' }}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span title={safe ? 'artifact_ready + stripe_price_id + is_active are all set' : 'Missing one of: artifact_ready, stripe_price_id, is_active'} style={{ padding: '5px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700, background: safe ? 'var(--admin-success)20' : 'var(--admin-warning)15', color: safe ? 'var(--admin-success)' : 'var(--admin-warning)', whiteSpace: 'nowrap' }}>
                          {safe ? '🛡️ Safe' : '— Not Sellable'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => startEdit(p)} className="admin-btn" style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: '#ccc', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Edit</button>
                          <button
                            disabled={busyId === p.id}
                            onClick={() => toggleActive(p)}
                            title={!p.is_active && !p.artifact_ready ? 'Blocked: artifact_ready is false' : undefined}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: p.is_active ? 'var(--admin-warning)' : (!p.artifact_ready ? 'var(--admin-text-dim)' : 'var(--admin-success)'), fontSize: '0.72rem', fontWeight: 600, cursor: busyId === p.id ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                          >
                            {p.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            disabled={busyId === p.id}
                            onClick={() => handleDelete(p)}
                            style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid var(--admin-border-strong)', background: 'transparent', color: 'var(--admin-danger)', fontSize: '0.72rem', fontWeight: 600, cursor: busyId === p.id ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
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
