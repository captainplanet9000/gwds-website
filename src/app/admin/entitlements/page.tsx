'use client';
import { useCallback, useEffect, useState } from 'react';

type EntitlementView = {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productEmoji: string | null;
  orderId: string | null;
  orderStatus: string | null;
  customerEmail: string | null;
  customerName: string | null;
  status: string;
  active: boolean;
  updatesUntil: string | null;
  grantedAt: string;
  revokedAt: string | null;
  revokeReason: string | null;
  download: {
    downloadedCount: number;
    maxDownloads: number;
    expiresAt: string | null;
    lastDownloadedAt: string | null;
    revoked: boolean;
  } | null;
};

function fmtDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminEntitlements() {
  const [entitlements, setEntitlements] = useState<EntitlementView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'active' | 'revoked'>('');
  const [busyId, setBusyId] = useState('');
  const [reissueResult, setReissueResult] = useState<{ id: string; url: string; expiresAt: string } | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<EntitlementView | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const load = useCallback((q: string, status: string) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    params.set('limit', '100');
    fetch(`/api/admin/entitlements?${params.toString()}`, { cache: 'no-store' })
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || 'Failed to load entitlements');
        setEntitlements(body.entitlements || []);
        setTotal(body.total || 0);
      })
      .catch((err) => setError(err.message || 'Failed to load entitlements'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search, statusFilter), 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, load]);

  async function doRevoke() {
    if (!revokeTarget) return;
    setBusyId(revokeTarget.id);
    setError('');
    try {
      const res = await fetch('/api/admin/entitlements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', entitlementId: revokeTarget.id, reason: revokeReason }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Revoke failed');
      setEntitlements((prev) => prev.map((e) => (e.id === body.entitlement.id ? body.entitlement : e)));
      setRevokeTarget(null);
      setRevokeReason('');
    } catch (err: any) {
      setError(err.message || 'Revoke failed');
    } finally {
      setBusyId('');
    }
  }

  async function doReissue(entitlement: EntitlementView) {
    setBusyId(entitlement.id);
    setError('');
    setReissueResult(null);
    try {
      const res = await fetch('/api/admin/entitlements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reissue', entitlementId: entitlement.id }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Reissue failed');
      setEntitlements((prev) => prev.map((e) => (e.id === body.entitlement.id ? body.entitlement : e)));
      setReissueResult({ id: entitlement.id, url: body.downloadUrl, expiresAt: body.expiresAt });
    } catch (err: any) {
      setError(err.message || 'Reissue failed');
    } finally {
      setBusyId('');
    }
  }

  const activeCount = entitlements.filter((e) => e.active).length;
  const revokedCount = entitlements.filter((e) => !e.active).length;

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: 8,
          letterSpacing: '-0.03em',
          color: 'var(--admin-text)',
        }}>Entitlements</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-dim)' }}>
          Who owns what, download usage, and license control
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-3" style={{ marginBottom: 24 }}>
        {[
          { label: 'Loaded', value: total, color: 'var(--admin-accent)', icon: '🔑' },
          { label: 'Active (page)', value: activeCount, color: 'var(--admin-success)', icon: '✅' },
          { label: 'Revoked (page)', value: revokedCount, color: 'var(--admin-danger)', icon: '🚫' },
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

      {error && (
        <div style={{ background: 'var(--admin-danger)15', border: '1px solid var(--admin-danger)40', borderRadius: 10, padding: '12px 16px', color: 'var(--admin-danger)', fontSize: '0.85rem', marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Search & Filter */}
      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search by customer email or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'var(--admin-surface-raised)', border: '1px solid var(--admin-border)', borderRadius: 8, color: 'var(--admin-text)', fontSize: '0.85rem', outline: 'none' }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--admin-accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--admin-border)')}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Status:</span>
          {([
            { key: '', label: 'All' },
            { key: 'active', label: 'Active' },
            { key: 'revoked', label: 'Revoked' },
          ] as const).map((s) => (
            <button
              key={s.key || 'all'}
              onClick={() => setStatusFilter(s.key)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: statusFilter === s.key ? '1px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                background: statusFilter === s.key ? 'var(--admin-accent)10' : 'transparent',
                color: statusFilter === s.key ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 24, height: 24, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>Loading entitlements...</span>
            </div>
          </div>
        ) : entitlements.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>🔑</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No entitlements found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>{search || statusFilter ? 'Try a different search or filter' : 'Purchases will appear here'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}>
                  {['Customer', 'Product', 'Status', 'Downloads', 'Link Expires', 'Granted', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '16px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--admin-text-dim)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', position: 'sticky', top: 0, background: 'var(--admin-surface)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entitlements.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--admin-surface-raised)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)', fontWeight: 500, marginBottom: 2 }}>{e.customerName || 'Guest'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-dim)' }}>{e.customerEmail || '—'}</div>
                      <div style={{ fontSize: '0.68rem', color: '#444', marginTop: 2, fontFamily: 'monospace' }}>{e.orderId ? `${e.orderId.slice(0, 8)}…` : '—'}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--admin-text)' }}>{e.productEmoji ? `${e.productEmoji} ` : ''}{e.productName}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        padding: '4px 10px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        color: e.active ? 'var(--admin-success)' : 'var(--admin-danger)',
                        background: e.active ? 'var(--admin-success)15' : 'var(--admin-danger)15',
                        border: `1px solid ${e.active ? 'var(--admin-success)40' : 'var(--admin-danger)40'}`,
                      }}>
                        {e.active ? 'Active' : 'Revoked'}
                      </span>
                      {!e.active && e.revokeReason && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-dim)', marginTop: 4 }}>{e.revokeReason}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {e.download ? (
                        <span style={{ color: e.download.downloadedCount >= e.download.maxDownloads ? 'var(--admin-danger)' : 'var(--admin-text-muted)' }}>
                          {e.download.downloadedCount} / {e.download.maxDownloads}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.82rem', color: 'var(--admin-text-dim)' }}>
                      {e.download?.expiresAt
                        ? (new Date(e.download.expiresAt).getTime() <= Date.now()
                          ? <span style={{ color: 'var(--admin-danger)' }}>Expired</span>
                          : fmtDate(e.download.expiresAt))
                        : '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.82rem', color: 'var(--admin-text-dim)' }}>{fmtDate(e.grantedAt)}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          disabled={busyId === e.id}
                          onClick={() => doReissue(e)}
                          style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--admin-accent)40', background: 'var(--admin-accent)15', color: 'var(--admin-accent)', fontSize: '0.75rem', fontWeight: 600, cursor: busyId === e.id ? 'wait' : 'pointer', opacity: busyId === e.id ? 0.6 : 1 }}
                        >
                          Reissue
                        </button>
                        {e.active && (
                          <button
                            disabled={busyId === e.id}
                            onClick={() => { setRevokeTarget(e); setRevokeReason(''); }}
                            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--admin-danger)40', background: 'var(--admin-danger)15', color: 'var(--admin-danger)', fontSize: '0.75rem', fontWeight: 600, cursor: busyId === e.id ? 'wait' : 'pointer', opacity: busyId === e.id ? 0.6 : 1 }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                      {reissueResult?.id === e.id && (
                        <div style={{ marginTop: 8, padding: 10, background: 'var(--admin-surface-raised)', border: '1px solid var(--admin-border)', borderRadius: 8, maxWidth: 320 }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--admin-text-dim)', marginBottom: 4 }}>One-time link (expires {fmtDate(reissueResult.expiresAt)}):</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input readOnly value={reissueResult.url} onFocus={(ev) => ev.target.select()} style={{ flex: 1, minWidth: 0, fontSize: '0.7rem', padding: '6px 8px', background: '#000', border: '1px solid var(--admin-border)', borderRadius: 6, color: 'var(--admin-text-muted)' }} />
                            <button
                              onClick={() => navigator.clipboard?.writeText(reissueResult.url).catch(() => undefined)}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Revoke confirm modal */}
      {revokeTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 24, maxWidth: 420, width: '100%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Revoke entitlement?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)', marginBottom: 16 }}>
              {revokeTarget.customerEmail || 'This customer'} will immediately lose download access to <strong style={{ color: 'var(--admin-text)' }}>{revokeTarget.productName}</strong>. Any active download link for this product is invalidated too.
            </p>
            <input
              type="text"
              placeholder="Reason (optional)"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--admin-surface-raised)', border: '1px solid var(--admin-border)', borderRadius: 8, color: 'var(--admin-text)', fontSize: '0.85rem', outline: 'none', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRevokeTarget(null)}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--admin-border)', background: 'transparent', color: 'var(--admin-text-muted)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={busyId === revokeTarget.id}
                onClick={doRevoke}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid var(--admin-danger)', background: 'var(--admin-danger)', color: '#fff', fontSize: '0.8rem', fontWeight: 600, cursor: busyId === revokeTarget.id ? 'wait' : 'pointer', opacity: busyId === revokeTarget.id ? 0.6 : 1 }}
              >
                {busyId === revokeTarget.id ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
