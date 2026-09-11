import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createServerClient } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Service Status',
  description: 'Current Cival Systems storefront and managed workspace status.',
};

export const dynamic = 'force-dynamic';

type PublicIncident = {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  started_at: string;
  resolved_at: string | null;
  updated_at: string;
};

async function getIncidents(): Promise<PublicIncident[]> {
  try {
    const { data, error } = await createServerClient()
      .from('hosting_incidents')
      .select('id,title,description,severity,status,started_at,resolved_at,updated_at')
      .eq('customer_visible', true)
      .order('started_at', { ascending: false })
      .limit(20);
    if (error) return [];
    return (data || []) as PublicIncident[];
  } catch {
    return [];
  }
}

export default async function StatusPage() {
  const incidents = await getIncidents();
  const open = incidents.filter((incident) => incident.status !== 'resolved');
  const hostingSalesEnabled = process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === 'true';
  // Read-only. The paid tiers run live agents, so this page must not describe the service as
  // paper-only; but while the gate is shut nothing executes live either. Both facts are stated
  // against the gate rather than against the product, so neither becomes a lie when it opens.

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '100vh', padding: '140px 24px 90px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <span className="tag tag-accent">Public status</span>
          <h1 style={{ fontSize: 'clamp(38px,6vw,64px)', margin: '18px 0 12px' }}>Cival Systems status</h1>
          <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.7, maxWidth: 700 }}>
            Storefront access and managed-workspace availability. Your trading funds stay in your own Hyperliquid account. You approve a trade-only agent wallet; its key and your AI provider credentials are encrypted for runtime use. Never share your main wallet private key or seed phrase.
          </p>

          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 14, margin: '34px 0' }}>
            <section className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>Storefront</h2>
              <span className="tag tag-accent-2">Operational</span>
              <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.6, marginBottom: 0 }}>Public pages, customer accounts, and support forms are available.</p>
            </section>
            <section className="card" style={{ padding: 24 }}>
              <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>Managed hosting</h2>
              <span className="tag tag-neutral">{hostingSalesEnabled ? 'Available' : 'Launch gate closed'}</span>
              <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.6, marginBottom: 0 }}>
                {hostingSalesEnabled
                  ? 'Paid monthly subscriptions are available. Each plan includes a private persistent dashboard, with agent capacity set by your tier. You supply your own AI keys and trading funds.'
                  : 'No hosting subscriptions are being accepted, and no managed workspace executes live orders, while the launch gate is closed.'}
              </p>
            </section>
          </div>

          <h2 style={{ fontSize: 27, marginTop: 42 }}>Incidents</h2>
          {open.length === 0 ? (
            <div className="card" style={{ padding: 24 }}>
              <strong>No open customer-visible incidents</strong>
              <p style={{ color: 'var(--color-neutral-700)', marginBottom: 0 }}>This is not an uptime guarantee or service-level agreement.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {open.map((incident) => (
                <article className="card" style={{ padding: 24 }} key={incident.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0 }}>{incident.title}</h3>
                    <span className="tag tag-neutral">{incident.severity} · {incident.status}</span>
                  </div>
                  <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.65 }}>{incident.description}</p>
                  <small style={{ color: 'var(--color-neutral-600)' }}>Updated {new Date(incident.updated_at).toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' })}</small>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
