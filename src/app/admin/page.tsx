'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminAccessGate from '@/components/admin/AdminAccessGate';

interface AdminStats {
  totalRevenue: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalSubscribers: number;
  newMessages: number;
  activeCoupons: number;
  recentOrders: Array<{
    id: string;
    customer_email?: string;
    customer_name?: string;
    total_cents?: number;
    status?: string;
    created_at: string;
  }>;
  revenueByDay: Array<{ label: string; value: number }>;
  revenueByProduct: Array<{ productId: string; productName: string; revenue: number }>;
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState<'checking' | 'guest' | 'authenticated'>('checking');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/auth', { cache: 'no-store' })
      .then((response) => {
        setAuthState(response.ok ? 'authenticated' : 'guest');
        return response.ok ? fetch('/api/admin/stats', { cache: 'no-store' }) : null;
      })
      .then(async (response) => {
        if (!response) return;
        if (!response.ok) throw new Error('Operations data could not be loaded.');
        setStats(await response.json() as AdminStats);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Operations data could not be loaded.'));
  }, []);

  if (authState === 'guest') return <AdminAccessGate onAuthenticated={() => window.location.reload()} />;
  if (authState === 'checking' || (authState === 'authenticated' && !stats && !error)) {
    return <div style={centerStyle}>Loading verified operations data…</div>;
  }
  if (error || !stats) return <div role="alert" style={centerStyle}>{error || 'Operations data is unavailable.'}</div>;

  const cards = [
    ['Paid order revenue', `$${Number(stats.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, '#4ade9f'],
    ['Paid orders', stats.totalOrders.toLocaleString(), '#9ae6c4'],
    ['Customers', stats.totalCustomers.toLocaleString(), '#71cfa8'],
    ['Products', stats.totalProducts.toLocaleString(), '#b9efd8'],
  ] as const;
  const maxRevenue = Math.max(1, ...stats.revenueByProduct.map((item) => item.revenue));

  return <>
    <header style={{ marginBottom: 28 }}>
      <div style={{ color: '#4ade9f', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.15em' }}>Live database</div>
      <h1 style={{ margin: '8px 0', fontSize: 32 }}>Operations overview</h1>
      <p style={{ color: '#799487', margin: 0 }}>Paid orders recorded by the store. Refunded and disputed orders are excluded.</p>
    </header>

    <section className="admin-stat-grid-4" style={{ marginBottom: 22 }}>
      {cards.map(([label, value, color]) => <article key={label} style={cardStyle}>
        <div style={{ color: '#769184', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
        <div style={{ color, fontSize: 30, fontWeight: 850, marginTop: 12 }}>{value}</div>
      </article>)}
    </section>

    <section className="admin-stat-grid-3" style={{ marginBottom: 22 }}>
      <QuickLink href="/admin/subscribers" label="Newsletter subscribers" value={stats.totalSubscribers} />
      <QuickLink href="/admin/messages" label="New support messages" value={stats.newMessages} />
      <QuickLink href="/admin/coupons" label="Active coupons" value={stats.activeCoupons} />
    </section>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 22, marginBottom: 22 }}>
      <section style={cardStyle}>
        <h2 style={headingStyle}>Product sales before discounts</h2>
        {stats.revenueByProduct.length === 0 ? <Empty label="No settled product revenue yet." /> : stats.revenueByProduct.map((item) => <div key={item.productId} style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: '#cce8dc', fontSize: 13 }}>
            <span>{item.productName}</span><strong>${item.revenue.toFixed(2)}</strong>
          </div>
          <div style={{ height: 6, marginTop: 8, background: '#10241d', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(item.revenue / maxRevenue) * 100}%`, background: '#4ade9f' }} />
          </div>
        </div>)}
      </section>

      <section style={cardStyle}>
        <h2 style={headingStyle}>30-day paid order revenue</h2>
        {stats.revenueByDay.length === 0 ? <Empty label="No revenue history yet." /> : <div style={{ height: 170, display: 'flex', alignItems: 'end', gap: 3, paddingTop: 18 }}>
          {stats.revenueByDay.map((day, index) => {
            const maximum = Math.max(1, ...stats.revenueByDay.map((item) => item.value));
            return <div key={`${day.label}-${index}`} title={`Day ${day.label}: $${day.value.toFixed(2)}`} style={{ flex: 1, minWidth: 2, height: `${Math.max(3, (day.value / maximum) * 100)}%`, background: day.value ? '#4ade9f' : '#17352a', borderRadius: '3px 3px 0 0' }} />;
          })}
        </div>}
      </section>
    </div>

    <section style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h2 style={headingStyle}>Recent orders</h2>
        <Link href="/admin/orders" style={{ color: '#4ade9f', fontSize: 13 }}>Open orders →</Link>
      </div>
      {stats.recentOrders.length === 0 ? <Empty label="No orders yet." /> : <div className="admin-table-wrap" style={{ marginTop: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Customer', 'Amount', 'Status', 'Created'].map((label) => <th key={label} style={thStyle}>{label}</th>)}</tr></thead>
          <tbody>{stats.recentOrders.map((order) => <tr key={order.id} style={{ borderTop: '1px solid #173026' }}>
            <td style={tdStyle}>{order.customer_name || order.customer_email || 'Customer'}</td>
            <td style={tdStyle}>${((order.total_cents || 0) / 100).toFixed(2)}</td>
            <td style={tdStyle}>{order.status || 'unknown'}</td>
            <td style={tdStyle}>{new Date(order.created_at).toLocaleString()}</td>
          </tr>)}</tbody>
        </table>
      </div>}
    </section>
  </>;
}

function QuickLink({ href, label, value }: { href: string; label: string; value: number }) {
  return <Link href={href} style={{ ...cardStyle, color: 'inherit', textDecoration: 'none', display: 'block' }}>
    <div style={{ color: '#769184', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 850, color: value ? '#4ade9f' : '#a7bdb3', marginTop: 10 }}>{value.toLocaleString()}</div>
  </Link>;
}

function Empty({ label }: { label: string }) {
  return <p style={{ color: '#718a7e', padding: '18px 0 4px' }}>{label}</p>;
}

const centerStyle: React.CSSProperties = { minHeight: '55vh', display: 'grid', placeItems: 'center', color: '#789285' };
const cardStyle: React.CSSProperties = { background: '#07120e', border: '1px solid #173026', borderRadius: 14, padding: 20 };
const headingStyle: React.CSSProperties = { fontSize: 17, margin: 0, color: '#e8f8f0' };
const thStyle: React.CSSProperties = { padding: '10px 12px', color: '#718a7e', fontSize: 11, textAlign: 'left', textTransform: 'uppercase', letterSpacing: '.06em' };
const tdStyle: React.CSSProperties = { padding: '13px 12px', color: '#c5ddd2', fontSize: 13 };
