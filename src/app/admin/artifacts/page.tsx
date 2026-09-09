'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface ProductArtifact {
  id: string;
  name: string;
  is_active: boolean;
  version: string | null;
  artifact_path: string | null;
  artifact_sha256: string | null;
  artifact_size_bytes: number | null;
  artifact_ready: boolean;
  updated_at: string | null;
  object_exists: boolean;
  actual_size_bytes: number | null;
  size_matches: boolean | null;
  content_type: string | null;
  object_updated_at: string | null;
  status: 'ok' | 'missing' | 'size_mismatch' | 'unverified' | 'no_path';
  dangerous: boolean;
}

interface StorageObject {
  path: string;
  name: string;
  size: number | null;
  content_type: string | null;
  created_at: string | null;
  updated_at: string | null;
  referenced: boolean;
}

interface ArtifactsData {
  bucket: string;
  summary: {
    total_products: number;
    active_products: number;
    ok: number;
    dangerous_active: number;
    total_objects: number;
    orphan_objects: number;
    store_safe: boolean;
  };
  products: ProductArtifact[];
  objects: StorageObject[];
  orphans: string[];
}

const STATUS_META: Record<ProductArtifact['status'], { label: string; bg: string; fg: string }> = {
  ok: { label: 'Verified', bg: '#0e3b2b', fg: '#6ee7b7' },
  missing: { label: 'Object missing', bg: '#441b22', fg: '#fda4af' },
  size_mismatch: { label: 'Size mismatch', bg: '#441b22', fg: '#fda4af' },
  unverified: { label: 'Unverified', bg: '#2a2410', fg: '#f5d67c' },
  no_path: { label: 'No artifact path', bg: 'var(--admin-border)', fg: 'var(--admin-text-muted)' },
};

function formatBytes(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function StatusBadge({ status }: { status: ProductArtifact['status'] }) {
  const meta = STATUS_META[status];
  return (
    <span style={{
      display: 'inline-flex', padding: '4px 10px', borderRadius: 999, fontSize: 11,
      fontWeight: 700, background: meta.bg, color: meta.fg, whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
}

export default function ArtifactsAdmin() {
  const [data, setData] = useState<ArtifactsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lastResult, setLastResult] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setError('');
    const res = await fetch('/api/admin/artifacts', { cache: 'no-store' });
    if (res.status === 401) {
      window.location.replace('/admin');
      return;
    }
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Could not load artifacts');
    setData(body);
  }, []);

  useEffect(() => {
    setLoading(true);
    load().catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load artifacts')).finally(() => setLoading(false));
  }, [load]);

  const verify = async (productId: string, adopt: boolean) => {
    setBusyId(productId);
    setError('');
    try {
      const res = await fetch('/api/admin/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, adopt }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Verification failed');
      setLastResult((prev) => ({ ...prev, [productId]: body.verified ? 'Verified — artifact_ready set to true' : `Not ready (${body.reason})` }));
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Verification failed');
    } finally {
      setBusyId(null);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.products;
    return data.products.filter((p) =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.artifact_path || '').toLowerCase().includes(q));
  }, [data, search]);

  const card: React.CSSProperties = { background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20 };
  const button: React.CSSProperties = {
    background: 'var(--admin-accent)', color: '#fff', border: 0, borderRadius: 7, padding: '7px 12px',
    fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap',
  };
  const secondaryButton: React.CSSProperties = {
    ...button, background: 'transparent', color: 'var(--admin-text-muted)', border: '1px solid var(--admin-border)',
  };

  if (loading) {
    return <div style={{ color: 'var(--admin-text-dim)', padding: 40 }}>Loading artifact status…</div>;
  }

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 8,
          letterSpacing: '-0.03em', color: 'var(--admin-text)',
        }}>Artifacts</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-dim)' }}>
          Release publishing — what&apos;s actually in the <code style={{ color: 'var(--admin-accent)' }}>downloads</code> bucket vs. what the database claims.
        </p>
      </div>

      {error && (
        <div style={{ background: '#441b22', border: '1px solid #7f1d1d', borderRadius: 10, padding: '12px 16px', color: '#fda4af', fontSize: '0.85rem', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Store safety banner */}
          <div style={{
            ...card,
            marginBottom: 24,
            background: data.summary.store_safe ? '#0e3b2b' : '#441b22',
            border: `1px solid ${data.summary.store_safe ? '#1f6b4d' : '#7f1d1d'}`,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <span style={{ fontSize: '2rem' }}>{data.summary.store_safe ? '✅' : '🚨'}</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', color: data.summary.store_safe ? '#6ee7b7' : '#fda4af', marginBottom: 2 }}>
                {data.summary.store_safe ? 'Store is safe to open' : `${data.summary.dangerous_active} active product(s) will fail on checkout`}
              </p>
              <p style={{ fontSize: '0.82rem', color: data.summary.store_safe ? '#a7f3d0' : '#fecaca' }}>
                {data.summary.store_safe
                  ? 'Every active product has a verified, existing artifact with matching size.'
                  : 'At least one active product has a missing object, a size mismatch, or an unverified artifact. Customers who pay for these will hit a failed download.'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
            {[
              { label: 'Products', value: data.summary.total_products, color: 'var(--admin-accent)', icon: '📦' },
              { label: 'Verified & Ready', value: data.summary.ok, color: 'var(--admin-success)', icon: '✅' },
              { label: 'Active but Broken', value: data.summary.dangerous_active, color: 'var(--admin-danger)', icon: '🚨' },
              { label: 'Orphan Objects', value: data.summary.orphan_objects, color: 'var(--admin-warning)', icon: '👻' },
            ].map((s) => (
              <div key={s.label} style={{ ...card, position: 'relative', overflow: 'hidden' }}>
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

          {/* Search */}
          <div style={{ ...card, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search products by name, ID, or artifact path…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--admin-surface-raised)', border: '1px solid var(--admin-border)', borderRadius: 8, color: 'var(--admin-text)', fontSize: '0.85rem', outline: 'none' }}
            />
          </div>

          {/* Products table */}
          <div style={{ ...card, marginBottom: 24, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--admin-text)' }}>
              Product Artifacts ({filteredProducts.length})
            </div>
            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#050505' }}>
                    {['Product', 'Active', 'Artifact Path', 'DB Size', 'Actual Size', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--admin-text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #141414', background: p.dangerous ? 'rgba(239,68,68,0.06)' : 'transparent' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>{p.id}{p.version ? ` · v${p.version}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ color: p.is_active ? '#6ee7b7' : 'var(--admin-text-dim)', fontWeight: 600 }}>{p.is_active ? 'Live' : 'Draft'}</span>
                      </td>
                      <td style={{ padding: '10px 16px', color: p.artifact_path ? 'var(--admin-accent)' : 'var(--admin-text-dim)', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                        {p.artifact_path || '—'}
                        {p.artifact_path && !p.object_exists && <div style={{ color: '#fda4af', fontSize: '0.7rem', marginTop: 2 }}>not found in bucket</div>}
                      </td>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text-muted)' }}>{formatBytes(p.artifact_size_bytes)}</td>
                      <td style={{ padding: '10px 16px', color: p.size_matches === false ? '#fda4af' : 'var(--admin-text-muted)' }}>
                        {formatBytes(p.actual_size_bytes)}
                        {p.size_matches === false && ' ⚠️'}
                      </td>
                      <td style={{ padding: '10px 16px' }}><StatusBadge status={p.status} /></td>
                      <td style={{ padding: '10px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            style={{ ...button, opacity: busyId === p.id ? 0.6 : 1 }}
                            disabled={busyId === p.id || !p.artifact_path}
                            onClick={() => verify(p.id, false)}
                            title="Re-check existence, size, and sha256 against what's on record"
                          >
                            {busyId === p.id ? 'Verifying…' : 'Verify'}
                          </button>
                          {p.status !== 'ok' && p.object_exists && (
                            <button
                              style={{ ...secondaryButton, opacity: busyId === p.id ? 0.6 : 1, color: 'var(--admin-warning)', borderColor: '#4a3a12' }}
                              disabled={busyId === p.id}
                              onClick={() => {
                                if (window.confirm(`Adopt the object currently in storage as the new baseline for "${p.name}"? This overwrites the recorded sha256/size.`)) {
                                  void verify(p.id, true);
                                }
                              }}
                              title="Accept the object in storage as correct and overwrite the recorded sha256/size"
                            >
                              Adopt
                            </button>
                          )}
                        </div>
                        {lastResult[p.id] && <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', marginTop: 4 }}>{lastResult[p.id]}</div>}
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-dim)' }}>No products match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bucket inventory */}
          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--admin-text)' }}>
                Bucket Inventory — <code style={{ color: 'var(--admin-accent)' }}>{data.bucket}</code> ({data.objects.length} objects)
              </span>
              {data.summary.orphan_objects > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-warning)' }}>{data.summary.orphan_objects} not referenced by any product</span>
              )}
            </div>
            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#050505' }}>
                    {['Object Path', 'Size', 'Content Type', 'Uploaded', 'Referenced'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--admin-text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--admin-border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.objects.map((o) => (
                    <tr key={o.path} style={{ borderBottom: '1px solid #141414', background: !o.referenced ? 'rgba(245,158,11,0.06)' : 'transparent' }}>
                      <td style={{ padding: '10px 16px', fontFamily: 'monospace', fontSize: '0.76rem', color: 'var(--admin-accent)' }}>{o.path}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text-muted)' }}>{formatBytes(o.size)}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text-dim)' }}>{o.content_type || '—'}</td>
                      <td style={{ padding: '10px 16px', color: 'var(--admin-text-dim)' }}>{formatDate(o.updated_at || o.created_at)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        {o.referenced
                          ? <span style={{ color: '#6ee7b7' }}>Yes</span>
                          : <span style={{ color: '#f5d67c' }}>Orphan</span>}
                      </td>
                    </tr>
                  ))}
                  {data.objects.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-dim)' }}>No objects found in this bucket.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
