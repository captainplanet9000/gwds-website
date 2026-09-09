'use client';
import { useEffect, useMemo, useState } from 'react';

interface AnalyticsResponse {
  generatedAt: string;
  period: { days: number; label: string; startDate: string; endDate: string };
  revenue: {
    summary: { today: number; last7Days: number; last30Days: number; last90Days: number; allTime: number };
    trend: {
      daily: { date: string; label: string; revenue: number; orders: number }[];
      weekly: { weekStart: string; weekEnd: string; label: string; revenue: number; orders: number }[];
      monthly: { month: string; label: string; revenue: number; orders: number }[];
    };
    period: { revenue: number; completedOrders: number; averageOrderValue: number };
  };
  orders: {
    period: { started: number; completed: number; inFlight: number; abandoned: number; failed: number; disputed: number; conversionRatePct: number };
  };
  topProducts: {
    period: {
      byRevenue: { productId: string; productName: string; units: number; revenue: number }[];
      byUnits: { productId: string; productName: string; units: number; revenue: number }[];
    };
  };
  coupons: {
    period: { redemptions: number; discountGiven: number; breakdown: { code: string; redemptions: number; discountGiven: number; description: string | null; discountType: string | null; discountValue: number | null }[] };
    allTime: { leaderboard: { code: string; usedCount: number; isActive: boolean; maxUses: number | null; expiresAt: string | null; discountType: string; discountValue: number; description: string | null }[]; activeCount: number };
  };
  customers: {
    period: { newCustomers: number; returningCustomers: number; newCustomerRevenue: number; returningCustomerRevenue: number };
    allTime: { totalCustomers: number; repeatCustomers: number; repeatRatePct: number };
  };
  refunds: {
    allTime: { completedOrders: number; refundedOrders: number; disputedOrders: number; refundedAmount: number; refundRatePct: number };
    period: { refundEventsIssued: number; refundedAmount: number; openRequests: number; requestsByStatus: Record<string, number> };
  };
}

const PERIODS = [7, 30, 90, 180, 365];
const money = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const moneyShort = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function AnalyticsAdmin() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`, { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.error || 'Analytics could not be loaded.');
        return r.json();
      })
      .then((body) => { setData(body); setError(''); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Analytics could not be loaded.'))
      .finally(() => setLoading(false));
  }, [days]);

  const trendSeries = useMemo(() => {
    if (!data) return [];
    if (granularity === 'daily') return data.revenue.trend.daily.map((d) => ({ label: d.label, revenue: d.revenue, orders: d.orders }));
    if (granularity === 'weekly') return data.revenue.trend.weekly.map((d) => ({ label: d.label, revenue: d.revenue, orders: d.orders }));
    return data.revenue.trend.monthly.map((d) => ({ label: d.label, revenue: d.revenue, orders: d.orders }));
  }, [data, granularity]);

  const maxTrendRevenue = Math.max(1, ...trendSeries.map((d) => d.revenue));

  return (
    <>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', color: 'var(--admin-text)' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-dim)' }}>
            {data ? `Real settled numbers · ${data.period.label} · generated ${new Date(data.generatedAt).toLocaleTimeString()}` : 'Revenue, orders, and operations — sourced from live tables only'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setDays(p)}
              style={{
                padding: '10px 16px', borderRadius: 8,
                border: days === p ? '1px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                background: days === p ? 'var(--admin-accent)10' : 'transparent',
                color: days === p ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
              }}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-dim)' }}>Loading verified analytics…</div>
      ) : error ? (
        <div role="alert" style={{ padding: 40, textAlign: 'center', color: 'var(--admin-danger)', background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12 }}>{error}</div>
      ) : data ? (
        <>
          {/* Top-line revenue — always current, independent of the period selector */}
          <div className="admin-stat-grid-4" style={{ marginBottom: 16 }}>
            {[
              ['Today', data.revenue.summary.today, 'var(--admin-success)'],
              ['Last 7 days', data.revenue.summary.last7Days, 'var(--admin-accent)'],
              ['Last 30 days', data.revenue.summary.last30Days, 'var(--admin-accent)'],
              ['All-time', data.revenue.summary.allTime, 'var(--admin-warning)'],
            ].map(([label, value, color]) => (
              <StatCard key={label as string} label={label as string} value={money(value as number)} color={color as string} />
            ))}
          </div>

          {/* Revenue trend */}
          <section style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
              <h2 style={headingStyle}>Revenue trend</h2>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['daily', 'weekly', 'monthly'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGranularity(g)}
                    style={{
                      padding: '6px 14px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      border: granularity === g ? '1px solid var(--admin-accent)' : '1px solid var(--admin-border)',
                      background: granularity === g ? 'var(--admin-accent)10' : 'transparent',
                      color: granularity === g ? 'var(--admin-accent)' : 'var(--admin-text-muted)',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <p style={{ color: 'var(--admin-text-dim)', fontSize: '0.78rem', margin: '0 0 12px' }}>
              {granularity === 'daily' ? 'Last 30 days' : granularity === 'weekly' ? 'Last 12 weeks' : 'Last 12 months'}, by settlement date
            </p>
            <div style={{ height: 190, display: 'flex', alignItems: 'end', gap: granularity === 'daily' ? 3 : 8, overflowX: 'auto' }}>
              {trendSeries.map((d, i) => (
                <div key={`${d.label}-${i}`} title={`${d.label}: ${money(d.revenue)} · ${d.orders} order${d.orders === 1 ? '' : 's'}`}
                  style={{ flex: 1, minWidth: granularity === 'daily' ? 4 : 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 150, display: 'flex', alignItems: 'end' }}>
                    <div style={{ width: '100%', height: `${Math.max(2, (d.revenue / maxTrendRevenue) * 100)}%`, background: d.revenue ? 'linear-gradient(180deg, var(--admin-accent), var(--admin-accent))' : 'var(--admin-border)', borderRadius: '3px 3px 0 0' }} />
                  </div>
                  {granularity !== 'daily' && <span style={{ fontSize: '0.62rem', color: 'var(--admin-text-dim)', whiteSpace: 'nowrap' }}>{d.label}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Period funnel + AOV */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16, margin: '16px 0' }}>
            <section style={cardStyle}>
              <h2 style={headingStyle}>Checkout funnel — {data.period.label.toLowerCase()}</h2>
              <FunnelRow label="Checkouts started" value={data.orders.period.started} color="var(--admin-accent)" />
              <FunnelRow label="Completed" value={data.orders.period.completed} color="var(--admin-success)" />
              <FunnelRow label="Abandoned / expired" value={data.orders.period.abandoned} color="var(--admin-warning)" />
              <FunnelRow label="Payment failed" value={data.orders.period.failed} color="var(--admin-danger)" />
              <FunnelRow label="Disputed" value={data.orders.period.disputed} color="var(--admin-danger)" />
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem' }}>Conversion rate</span>
                <strong style={{ color: 'var(--admin-accent)', fontFamily: 'var(--font-display)' }}>{data.orders.period.conversionRatePct}%</strong>
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={headingStyle}>Order economics — {data.period.label.toLowerCase()}</h2>
              <FunnelRow label="Settled revenue" value={money(data.revenue.period.revenue)} color="var(--admin-success)" />
              <FunnelRow label="Completed orders" value={data.revenue.period.completedOrders} color="var(--admin-accent)" />
              <FunnelRow label="Average order value" value={money(data.revenue.period.averageOrderValue)} color="var(--admin-accent)" />
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem' }}>New customer revenue</span>
                  <strong style={{ color: 'var(--admin-success)' }}>{money(data.customers.period.newCustomerRevenue)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem' }}>Returning customer revenue</span>
                  <strong style={{ color: 'var(--admin-accent)' }}>{money(data.customers.period.returningCustomerRevenue)}</strong>
                </div>
              </div>
            </section>
          </div>

          {/* New vs returning + refunds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16, marginBottom: 16 }}>
            <section style={cardStyle}>
              <h2 style={headingStyle}>Customers — {data.period.label.toLowerCase()}</h2>
              <div className="admin-stat-grid-2" style={{ marginTop: 14 }}>
                <MiniStat label="New customers" value={data.customers.period.newCustomers} color="var(--admin-success)" />
                <MiniStat label="Returning customers" value={data.customers.period.returningCustomers} color="var(--admin-accent)" />
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem' }}>Repeat rate (all-time)</span>
                <strong style={{ color: 'var(--admin-warning)' }}>{data.customers.allTime.repeatRatePct}% of {data.customers.allTime.totalCustomers}</strong>
              </div>
            </section>

            <section style={cardStyle}>
              <h2 style={headingStyle}>Refunds &amp; disputes</h2>
              <div style={{ marginTop: 14 }}>
                <FunnelRow label="Refund rate (all-time)" value={`${data.refunds.allTime.refundRatePct}%`} color="var(--admin-danger)" />
                <FunnelRow label="Refunded orders (all-time)" value={data.refunds.allTime.refundedOrders} color="var(--admin-danger)" />
                <FunnelRow label="Refunded amount (all-time)" value={money(data.refunds.allTime.refundedAmount)} color="var(--admin-danger)" />
                <FunnelRow label="Disputed orders (all-time)" value={data.refunds.allTime.disputedOrders} color="var(--admin-warning)" />
              </div>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem' }}>Refund events this period</span>
                  <strong style={{ color: 'var(--admin-danger)' }}>{data.refunds.period.refundEventsIssued} ({money(data.refunds.period.refundedAmount)})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.85rem' }}>Open refund requests</span>
                  <strong style={{ color: data.refunds.period.openRequests > 0 ? 'var(--admin-warning)' : 'var(--admin-text-dim)' }}>{data.refunds.period.openRequests}</strong>
                </div>
              </div>
            </section>
          </div>

          {/* Top products */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 16, marginBottom: 16 }}>
            <section style={cardStyle}>
              <h2 style={headingStyle}>Top products by revenue — {data.period.label.toLowerCase()}</h2>
              <ProductBars rows={data.topProducts.period.byRevenue} valueKey="revenue" format={money} />
            </section>
            <section style={cardStyle}>
              <h2 style={headingStyle}>Top products by units — {data.period.label.toLowerCase()}</h2>
              <ProductBars rows={data.topProducts.period.byUnits} valueKey="units" format={(n) => `${n} sold`} />
            </section>
          </div>

          {/* Coupons */}
          <section style={{ ...cardStyle, marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <h2 style={headingStyle}>Coupons</h2>
              <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                <span>Redemptions ({data.period.label.toLowerCase()}): <strong style={{ color: 'var(--admin-accent)' }}>{data.coupons.period.redemptions}</strong></span>
                <span>Discount given: <strong style={{ color: 'var(--admin-warning)' }}>{money(data.coupons.period.discountGiven)}</strong></span>
                <span>Active coupons: <strong style={{ color: 'var(--admin-success)' }}>{data.coupons.allTime.activeCount}</strong></span>
              </div>
            </div>
            {data.coupons.allTime.leaderboard.length === 0 ? <Empty label="No coupons created yet." /> : (
              <div className="admin-table-wrap" style={{ marginTop: 14 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--admin-border)' }}>
                      {['Code', 'Discount', 'Used (all-time)', `Redemptions (${data.period.label.toLowerCase()})`, `Discount given (${data.period.label.toLowerCase()})`, 'Status'].map((h) => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.coupons.allTime.leaderboard.map((c) => {
                      const periodRow = data.coupons.period.breakdown.find((b) => b.code === c.code);
                      const expired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
                      return (
                        <tr key={c.code} style={{ borderTop: '1px solid var(--admin-surface-raised)' }}>
                          <td style={{ ...tdStyle, fontFamily: 'var(--font-mono, monospace)', color: 'var(--admin-text)' }}>{c.code}</td>
                          <td style={tdStyle}>{c.discountType === 'percentage' ? `${c.discountValue}%` : money(c.discountValue)}</td>
                          <td style={tdStyle}>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}</td>
                          <td style={tdStyle}>{periodRow?.redemptions || 0}</td>
                          <td style={tdStyle}>{money(periodRow?.discountGiven || 0)}</td>
                          <td style={tdStyle}>
                            <span style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
                              background: c.isActive && !expired ? 'var(--admin-success)15' : 'var(--admin-text-dim)15',
                              color: c.isActive && !expired ? 'var(--admin-success)' : 'var(--admin-text-muted)',
                            }}>
                              {expired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, ${color}15, transparent)` }} />
      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>{label}</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--admin-surface-raised)', border: '1px solid var(--admin-border)', borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>{value}</div>
    </div>
  );
}

function FunnelRow({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>{label}</span>
      <strong style={{ color, fontFamily: 'var(--font-display)' }}>{value}</strong>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p style={{ color: 'var(--admin-text-dim)', padding: '18px 0 4px', fontSize: '0.85rem' }}>{label}</p>;
}

function ProductBars({ rows, valueKey, format }: { rows: { productId: string; productName: string; units: number; revenue: number }[]; valueKey: 'revenue' | 'units'; format: (n: number) => string }) {
  if (rows.length === 0) return <Empty label="No settled sales in this period yet." />;
  const max = Math.max(1, ...rows.map((r) => r[valueKey]));
  return (
    <div style={{ marginTop: 14 }}>
      {rows.map((r) => (
        <div key={r.productId} style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, fontSize: '0.83rem', color: '#ccc', marginBottom: 6 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.productName}</span>
            <strong style={{ color: 'var(--admin-text)', flexShrink: 0 }}>{format(r[valueKey])}</strong>
          </div>
          <div style={{ height: 6, background: 'var(--admin-border)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(r[valueKey] / max) * 100}%`, background: 'linear-gradient(90deg, var(--admin-accent), var(--admin-accent))' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle: React.CSSProperties = { background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', borderRadius: 12, padding: 20 };
const headingStyle: React.CSSProperties = { fontSize: '1rem', margin: 0, color: 'var(--admin-text)', fontFamily: 'var(--font-display)', fontWeight: 700 };
const thStyle: React.CSSProperties = { padding: '10px 12px', color: 'var(--admin-text-dim)', fontSize: '0.7rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 };
const tdStyle: React.CSSProperties = { padding: '12px', color: '#ccc', fontSize: '0.83rem' };
