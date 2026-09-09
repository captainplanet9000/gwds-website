'use client';
import { Fragment, useEffect, useState } from 'react';

interface OrderItem { id: string; product_id: string; product_name: string; quantity: number; price_cents: number }
interface Entitlement { id: string; product_id: string; product_name: string; status: string; revoked_at: string | null; revoke_reason: string | null }
interface StripeEvent { stripe_event_id: string; event_type: string; status: string; last_error: string | null; received_at: string; processed_at: string | null }
interface RefundOrder {
  id: string; customer_email: string; customer_name: string | null; total_cents: number; currency: string;
  status: string; fulfillment_status: string; failure_reason: string | null; payment_intent_id: string | null;
  stripe_session_id: string | null; paid_at: string | null; created_at: string; updated_at: string;
  items: OrderItem[]; entitlements: Entitlement[]; downloads_revoked: number; downloads_total: number; events: StripeEvent[];
}
interface RefundRequest {
  id: string; user_id: string; order_id: string; reason: string; status: string; created_at: string; updated_at: string;
  order: { id: string; customer_email: string; total_cents: number; currency: string; status: string; fulfillment_status: string; created_at: string } | null;
}
interface Summary { refunded_orders: number; disputed_orders: number; open_requests: number; revoked_entitlements: number; total_refunded_cents: number }

const REQUEST_STATUSES = ['requested', 'reviewing', 'approved', 'denied', 'refunded'];

const statusColor = (status: string): string => {
  if (['refunded', 'approved', 'active', 'completed'].includes(status)) return 'var(--admin-success)';
  if (['partially_refunded', 'reviewing', 'pending'].includes(status)) return 'var(--admin-warning)';
  if (['disputed', 'dispute_lost', 'denied', 'revoked', 'payment_failed', 'expired'].includes(status)) return 'var(--admin-danger)';
  return 'var(--admin-accent)';
};

const money = (cents: number, currency = 'usd') =>
  (cents / 100).toLocaleString(undefined, { style: 'currency', currency: currency.toUpperCase() });

const cardStyle: React.CSSProperties = { background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20 };
const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
  letterSpacing: '0.04em', textTransform: 'uppercase', color, background: `${color}18`, border: `1px solid ${color}40`,
});
const btnStyle = (color: string): React.CSSProperties => ({
  padding: '7px 14px', borderRadius: 7, border: `1px solid ${color}50`, background: `${color}14`, color,
  fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
});

export default function AdminRefunds() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<RefundOrder[]>([]);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/refunds')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        setSummary(d.summary || null);
        setOrders(d.orders || []);
        setRequests(d.requests || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(''), 4000); };

  const runAction = async (key: string, payload: Record<string, unknown>) => {
    setBusy(key);
    setError('');
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      flash('Done.');
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  };

  const setRequestStatus = (request: RefundRequest, status: string) => {
    if (status === 'refunded' && !confirm('Mark refunded and revoke this order’s entitlements + downloads now?')) return;
    if (status === 'denied' && !confirm(`Deny this refund request for ${request.order?.customer_email || 'this customer'}?`)) return;
    void runAction(`req-${request.id}-${status}`, { action: 'set_request_status', request_id: request.id, status });
  };

  const revokeOrder = (order: RefundOrder) => {
    const reason = prompt(`Reason for revoking access to order ${order.id.slice(0, 8)}…`, order.failure_reason || 'admin_manual_revoke');
    if (reason === null) return;
    void runAction(`revoke-${order.id}`, { action: 'revoke_entitlements', order_id: order.id, reason });
  };

  const restoreOrder = (order: RefundOrder) => {
    if (!confirm(`Restore entitlements + downloads for order ${order.id.slice(0, 8)}… and mark it paid again?`)) return;
    void runAction(`restore-${order.id}`, { action: 'restore_entitlements', order_id: order.id, reason: 'admin_manual_restore' });
  };

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', color: 'var(--admin-text)' }}>
          Refunds &amp; Disputes
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-dim)' }}>
          Reflects what Stripe has confirmed via webhook, reconciles entitlement access, and tracks customer refund requests.
          Refunds and dispute outcomes are issued in the Stripe dashboard by a human — this page does not call Stripe.
        </p>
      </div>

      {error && (
        <div style={{ ...cardStyle, borderColor: 'var(--admin-danger)50', background: 'var(--admin-danger)12', marginBottom: 16, color: 'var(--admin-danger)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ ...cardStyle, borderColor: 'var(--admin-success)50', background: 'var(--admin-success)12', marginBottom: 16, color: 'var(--admin-success)', fontSize: '0.85rem' }}>
          {notice}
        </div>
      )}

      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Refunded Orders', value: summary?.refunded_orders ?? '—', color: 'var(--admin-warning)', icon: '↩️' },
          { label: 'Disputed Orders', value: summary?.disputed_orders ?? '—', color: 'var(--admin-danger)', icon: '⚠️' },
          { label: 'Open Requests', value: summary?.open_requests ?? '—', color: 'var(--admin-accent)', icon: '📥' },
          { label: 'Total Refunded', value: summary ? money(summary.total_refunded_cents) : '—', color: 'var(--admin-success)', icon: '💸' },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, position: 'relative', overflow: 'hidden' }}>
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

      {/* Customer refund requests */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>Refund Requests</h2>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Loading…</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-dim)' }}>No refund requests submitted yet.</div>
          ) : (
            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    {['Customer', 'Order', 'Reason', 'Amount', 'Status', 'Requested', 'Actions'].map((h) => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--admin-text-dim)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--admin-surface-raised)' }}>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--admin-text)' }}>{r.order?.customer_email || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>{r.order_id.slice(0, 8)}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#aaa', maxWidth: 260 }}>{r.reason}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--admin-text)' }}>{r.order ? money(r.order.total_cents, r.order.currency) : '—'}</td>
                      <td style={{ padding: '14px 16px' }}><span style={badgeStyle(statusColor(r.status))}>{r.status}</span></td>
                      <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--admin-text-dim)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {r.status !== 'reviewing' && r.status !== 'approved' && r.status !== 'refunded' && r.status !== 'denied' && (
                            <button style={btnStyle('var(--admin-accent)')} disabled={busy === `req-${r.id}-reviewing`} onClick={() => setRequestStatus(r, 'reviewing')}>Review</button>
                          )}
                          {r.status !== 'approved' && r.status !== 'refunded' && r.status !== 'denied' && (
                            <button style={btnStyle('var(--admin-success)')} disabled={busy === `req-${r.id}-approved`} onClick={() => setRequestStatus(r, 'approved')}>Approve</button>
                          )}
                          {r.status !== 'refunded' && r.status !== 'denied' && (
                            <button style={btnStyle('var(--admin-warning)')} disabled={busy === `req-${r.id}-refunded`} onClick={() => setRequestStatus(r, 'refunded')}>Mark Refunded</button>
                          )}
                          {r.status !== 'denied' && r.status !== 'refunded' && (
                            <button style={btnStyle('var(--admin-danger)')} disabled={busy === `req-${r.id}-denied`} onClick={() => setRequestStatus(r, 'denied')}>Deny</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Stripe-confirmed refunds and disputes, reconciled against entitlements */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--admin-text)', marginBottom: 12 }}>Refunded &amp; Disputed Orders</h2>
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Loading…</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>✅</div>
              <p style={{ fontSize: '1rem' }}>No refunds or disputes on record.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                    {['Customer', 'Amount', 'Status', 'Access', 'Updated', ''].map((h) => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--admin-text-dim)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const isOpen = expanded === order.id;
                    const activeEntitlements = order.entitlements.filter((e) => e.status === 'active').length;
                    return (
                      <Fragment key={order.id}>
                        <tr
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                          style={{ borderBottom: '1px solid var(--admin-surface-raised)', cursor: 'pointer', background: isOpen ? '#0f0f0f' : 'transparent' }}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text)' }}>{order.customer_name || order.customer_email}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)' }}>{order.customer_email}</div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--admin-text)' }}>{money(order.total_cents, order.currency)}</td>
                          <td style={{ padding: '14px 16px' }}><span style={badgeStyle(statusColor(order.status))}>{order.status}</span></td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={badgeStyle(order.fulfillment_status === 'revoked' ? 'var(--admin-danger)' : 'var(--admin-success)')}>
                              {order.fulfillment_status === 'revoked' ? 'revoked' : `${activeEntitlements} active`}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: 'var(--admin-text-dim)' }}>{new Date(order.updated_at).toLocaleString()}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                              {order.fulfillment_status !== 'revoked' && (
                                <button style={btnStyle('var(--admin-danger)')} disabled={busy === `revoke-${order.id}`} onClick={() => revokeOrder(order)}>Revoke Access</button>
                              )}
                              {order.fulfillment_status === 'revoked' && (
                                <button style={btnStyle('var(--admin-success)')} disabled={busy === `restore-${order.id}`} onClick={() => restoreOrder(order)}>Restore Access</button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${order.id}-detail`} style={{ borderBottom: '1px solid var(--admin-surface-raised)', background: '#0d0d0d' }}>
                            <td colSpan={6} style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                                <div>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Order</p>
                                  <p style={{ fontSize: '0.78rem', color: '#aaa', fontFamily: 'monospace' }}>{order.id}</p>
                                  <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>Payment intent: {order.payment_intent_id || '—'}</p>
                                  {order.failure_reason && <p style={{ fontSize: '0.78rem', color: 'var(--admin-danger)', marginTop: 4 }}>Reason: {order.failure_reason}</p>}
                                  <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: 4 }}>Downloads revoked: {order.downloads_revoked} / {order.downloads_total}</p>
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Items &amp; Entitlements</p>
                                  {order.items.map((item) => {
                                    const ent = order.entitlements.find((e) => e.product_id === item.product_id);
                                    return (
                                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#aaa', marginBottom: 4 }}>
                                        <span>{item.product_name} ×{item.quantity}</span>
                                        <span style={{ color: ent?.status === 'revoked' ? 'var(--admin-danger)' : 'var(--admin-success)' }}>{ent?.status || 'n/a'}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div>
                                  <p style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Stripe Event Timeline</p>
                                  {order.events.length === 0 && <p style={{ fontSize: '0.78rem', color: 'var(--admin-text-dim)' }}>No events recorded.</p>}
                                  {order.events.map((ev) => (
                                    <div key={ev.stripe_event_id} style={{ fontSize: '0.76rem', color: '#aaa', marginBottom: 4 }}>
                                      <span style={{ color: 'var(--admin-text-muted)' }}>{new Date(ev.received_at).toLocaleString()}</span>{' — '}
                                      {ev.event_type} <span style={{ color: statusColor(ev.status === 'completed' ? 'active' : ev.status) }}>({ev.status})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
