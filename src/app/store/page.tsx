import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoreCatalogue from './StoreCatalogue';
import { planExecutionMode } from '@/lib/hosting';
import { createServerClient } from '@/lib/supabase';

// Plan capacity, price and feature copy come from public.hosting_plans at request time, matching
// /hosted -- duplicated rather than shared because this is the only other place that reads it, and
// a premature shared helper for two call sites isn't worth the indirection yet.
export const dynamic = 'force-dynamic';

interface PlanRow {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  billingInterval: string;
  agentLimit: number | null;
  features: string[];
  executionMode: 'simulated' | 'live';
}

async function getHostingPlans(): Promise<PlanRow[]> {
  try {
    const { data, error } = await createServerClient()
      .from('hosting_plans')
      .select('id,name,description,price_cents,billing_interval,agent_limit,features,is_active,sort_order')
      .eq('is_active', true)
      .order('sort_order');
    if (error) return [];
    return (data || []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      priceCents: row.price_cents as number,
      billingInterval: row.billing_interval as string,
      agentLimit: (row.agent_limit as number | null) ?? null,
      features: Array.isArray(row.features)
        ? (row.features as unknown[]).filter((item): item is string => typeof item === 'string')
        : [],
      executionMode: planExecutionMode(row.price_cents as number),
    }));
  } catch {
    return [];
  }
}

function priceLabel(plan: PlanRow) {
  return plan.priceCents === 0 ? 'Free' : `$${Math.round(plan.priceCents / 100).toLocaleString('en-US')}`;
}

function intervalLabel(plan: PlanRow) {
  if (plan.priceCents === 0) return '';
  return plan.billingInterval === 'month' ? '/ mo' : `/ ${plan.billingInterval}`;
}

function agentLabel(plan: PlanRow) {
  if (plan.agentLimit === null) return 'Agent capacity not set';
  return plan.agentLimit === 1 ? '1 agent' : `Up to ${plan.agentLimit} agents`;
}

function Tick() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function StorePage() {
  const salesEnabled = process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === 'true';
  const plans = (await getHostingPlans()).filter((plan) => plan.executionMode === 'live');

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 28px 96px' }}>
        <StoreCatalogue />

        {plans.length > 0 && (
          <section style={{ marginTop: 88, paddingTop: 56, borderTop: '1px solid var(--color-divider)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12 }}>
                  Don&apos;t want to run it yourself?
                </div>
                <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: 0 }}>Managed hosting, priced by agents.</h2>
              </div>
              <Link href="/hosted" className="btn btn-secondary" style={{ height: 44, padding: '0 20px' }}>
                Full hosting details
              </Link>
            </div>

            {!salesEnabled && (
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '72ch', margin: '0 0 28px', padding: '14px 18px', border: '1px solid var(--color-divider)', borderLeft: '3px solid var(--color-accent)', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>
                <strong>These plans are not on sale yet.</strong> The prices below are the configured tiers, not an offer you can accept
                today — hosted checkout stays closed until tenant runtime, live loadout sync and recovery validation pass.
              </p>
            )}

            <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)},minmax(0,1fr))`, gap: 16 }}>
              {plans.map((plan) => (
                <article key={plan.id} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 26, borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{plan.name}</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }}>{priceLabel(plan)}</span>
                    {intervalLabel(plan) && <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{intervalLabel(plan)}</span>}
                  </div>
                  <span className="tag tag-neutral" style={{ width: 'fit-content' }}>{agentLabel(plan)}</span>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-neutral-800)', margin: 0 }}>{plan.description}</p>
                  <div style={{ display: 'grid', gap: 9, marginTop: 6 }}>
                    {plan.features.map((feature) => (
                      <div key={feature} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.4 }}>
                        <Tick />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/account/hosting" className="btn btn-secondary" style={{ marginTop: 'auto', textAlign: 'center' }}>
                    {salesEnabled ? `Choose ${plan.name}` : 'View activation status'}
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
