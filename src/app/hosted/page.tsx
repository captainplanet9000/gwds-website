import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const STEPS = [
  ['Create an account', 'The same verified account you use for purchases and downloads. No terminal, no Supabase project, no Vercel account.'],
  ['Add a Hyperliquid API wallet', 'Trading permission only. Withdrawals are never authorised and we never take custody of funds.'],
  ['Pick your agents', 'Choose from the six strategy modules, or run one. Each drops into the dashboard as a plugin.'],
  ['Set risk limits and go live', 'Start on paper, confirm the behaviour you expect, then promote to real size when you are ready.'],
];

const INCLUDED = [
  ['Managed runtime', 'Servers, database, queues and agent workers are provisioned and supervised for you — the parts that break at 3am.'],
  ['Agent supervision', 'Health scoring, automatic restarts and farm orchestration. If a worker cannot recover, positions flatten to your configured defensive state and you are alerted.'],
  ['Risk engine always on', 'Drawdown halts, per-trade sizing and reconciliation run server-side, independent of whether your laptop is open.'],
  ['Updates applied for you', 'Patches and new strategy modules land automatically instead of waiting on a manual pull.'],
  ['Isolated tenancy', 'A separate runtime and data boundary per customer. No shared exchange keys and no shared trading state.'],
  ['Encrypted secrets', 'Exchange and AI credentials are encrypted at rest, scoped, revocable, and never written into source archives.'],
  ['Your strategy stays private', 'Custom agents and parameters live in your workspace. They are never shared between accounts or used to train anything.'],
  ['Never locked in', 'Every hosted plan includes the full TypeScript source download. Export your config and run it on your own box whenever you want.'],
];

const PLANS = [
  {
    name: 'Paper', price: 'Free', per: '',
    blurb: 'The whole platform on simulated fills. No card, no key, no expiry.',
    items: ['Full dashboard', '1 agent, paper only', 'Upgrade without losing setup'],
    featured: false,
  },
  {
    name: 'Solo', price: '$19', per: '/ mo',
    blurb: 'One live agent on real size, supervised and patched by us.',
    items: ['1 live agent', '250 agent-hours', 'Core Edition licence included'],
    featured: false,
  },
  {
    name: 'Desk', price: '$79', per: '/ mo',
    blurb: 'All six agents as a coordinated farm. This is the plan that replaces building it yourself.',
    items: ['All 6 agents, run as a farm', 'Shared risk limits + regime coordinator', '1,000 agent-hours', 'Desk Edition licence included', 'Priority Discord channel'],
    featured: true,
  },
  {
    name: 'Fund', price: '$299', per: '/ mo',
    blurb: 'Multiple books, multiple operators, private agents.',
    items: ['Unlimited agents and workspaces', 'Team seats and role permissions', 'Dedicated workers, no shared queue', 'Private agent development'],
    featured: false,
  },
];

const MATRIX = [
  ['Full TypeScript source', 'Yours forever', 'Yours forever'],
  ['Servers and database', 'You provide and configure', 'Provisioned for you'],
  ['Updates and patches', 'Manual pull', 'Applied automatically'],
  ['Agent supervision and restarts', 'Your machine', 'Managed workers'],
  ['Risk engine uptime', 'Only while your machine runs', 'Always on, server-side'],
  ['Time to first live agent', 'An afternoon', 'Under ten minutes'],
  ['Cost', 'One-time, $99–399', 'Monthly, cancel anytime'],
];

const FAQ = [
  ['Do you ever touch my funds?', 'No. You connect a Hyperliquid API wallet with trading permission only. Withdrawals are never authorised and we never hold custody. Never paste your main private key — here or anywhere else.'],
  ['Can I self-host later?', 'Yes. Every hosted plan includes the same source download. Export your config and run it on your own machine whenever you want.'],
  ['What happens if the service goes down?', 'Agents run on isolated workers with automatic restarts. If a worker cannot recover, your positions are flattened to your configured defensive state and you are alerted.'],
  ['Is my strategy code private?', 'Yes. Custom agents and parameters live in your workspace, encrypted at rest, and are never used to train anything or shared with other accounts.'],
  ['Does hosting reduce trading risk?', 'No. Hosting removes infrastructure work, not market risk. You remain responsible for your strategy, your risk limits and your capital.'],
];

const STATUS = [
  ['Customer accounts', 'Built', 'Verified sign-in, order ownership, entitlements, and private download regeneration are implemented.'],
  ['Commerce foundation', 'Built', 'Stripe checkout, signed webhooks, idempotent fulfillment, refunds, and revocation paths are implemented.'],
  ['Hosted control plane', 'In review', 'Tenant provisioning, encrypted secret storage, runtime health, metering, and teardown are being validated.'],
  ['Hosted subscriptions', 'In review', 'Pricing, service levels, tax treatment, and recurring billing need sign-off before any plan can be sold.'],
];

function Tick() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3.2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function HostedPage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ minHeight: '100vh', paddingTop: 66 }}>

        {/* Hero */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 28px 64px' }}>
          <span className="tag tag-accent">Hosted by Cival</span>
          <h1 style={{ fontSize: 'clamp(42px,6vw,72px)', lineHeight: 1.04, letterSpacing: '-0.02em', maxWidth: '15ch', margin: '24px 0' }}>
            Don&apos;t want to run it? We&apos;ll run it.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '62ch', margin: '0 0 14px' }}>
            Same product, same source, none of the infrastructure. Create an account, connect a Hyperliquid API wallet,
            pick your agents. We handle the servers, the database, the supervision and the updates.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-700)', maxWidth: '62ch', margin: 0 }}>
            Every hosted plan still includes the full source download, so you are never locked in.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 30 }}>
            <Link href="/contact?subject=Hosted%20Cival%20interest" className="btn btn-primary" style={{ height: 50, padding: '0 26px', fontSize: 15 }}>
              Join the hosted waitlist
            </Link>
            <Link href="/store" className="btn btn-secondary" style={{ height: 50, padding: '0 22px', fontSize: 15 }}>
              Buy the source instead
            </Link>
          </div>
        </section>

        {/* Four steps */}
        <section style={{ background: 'var(--color-neutral-100)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '76px 28px' }}>
            <h6 style={{ marginBottom: 14 }}>Live in four steps</h6>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: '0 0 34px' }}>
              No terminal, no Supabase project, no server to babysit.
            </h2>
            <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16 }}>
              {STEPS.map(([title, body], i) => (
                <article key={title} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: 26, border: '1px solid var(--color-divider)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', fontSize: 11, marginBottom: 12 }}>0{i + 1}</div>
                  <h3 style={{ fontSize: 19, lineHeight: 1.2, margin: '0 0 8px' }}>{title}</h3>
                  <p style={{ color: 'var(--color-neutral-800)', lineHeight: 1.55, fontSize: 14.5, margin: 0 }}>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* What hosting gives you */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '82px 28px' }}>
          <h6 style={{ marginBottom: 14 }}>What hosting gives you</h6>
          <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: '0 0 12px' }}>
            The boring 80%, operated for you.
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '58ch', margin: '0 0 34px' }}>
            The runtime is the hard part — order lifecycle, reconciliation, agent supervision and risk controls all have to keep
            running whether or not you are watching. Hosting is that work, done and monitored.
          </p>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 16 }}>
            {INCLUDED.map(([title, body]) => (
              <article key={title} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 26 }}>
                <h3 style={{ fontSize: 20, lineHeight: 1.2, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ color: 'var(--color-neutral-800)', lineHeight: 1.6, fontSize: 15, margin: 0 }}>{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section style={{ background: 'var(--color-neutral-100)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '82px 28px' }}>
            <h6 style={{ marginBottom: 14 }}>Planned pricing</h6>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: '0 0 12px' }}>Four tiers, licence included.</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '60ch', margin: '0 0 34px' }}>
              Paid hosting includes the edition licence outright — five months of Desk costs about what the Desk edition costs on
              its own, and you keep the source if you cancel. Agent-hours are billed per running agent, not per trade.
            </p>

            <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 16, alignItems: 'stretch' }}>
              {PLANS.map((p) => (
                <article key={p.name} style={{
                  display: 'flex', flexDirection: 'column', gap: 12, padding: 28,
                  borderRadius: 'calc(var(--radius-lg) * 1.15)',
                  background: p.featured ? 'var(--color-surface)' : 'var(--color-bg)',
                  border: `1px solid ${p.featured ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: p.featured ? 'var(--color-accent)' : 'var(--color-neutral-600)' }}>{p.name}</span>
                    {p.featured && <span className="tag tag-accent">Most picked</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 500, letterSpacing: '-0.02em' }}>{p.price}</span>
                    {p.per && <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>{p.per}</span>}
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-neutral-800)', margin: 0 }}>{p.blurb}</p>
                  <div style={{ display: 'grid', gap: 9, marginTop: 6 }}>
                    {p.items.map((it) => (
                      <div key={it} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.4 }}>
                        <Tick /><span>{it}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--color-neutral-700)', margin: '24px 0 0', maxWidth: '72ch' }}>
              These tiers describe the intended hosted service. Plans are not on sale yet and joining the waitlist does not
              authorise a charge — see the delivery status below.
            </p>
          </div>
        </section>

        {/* Self-host vs hosted */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '82px 28px' }}>
          <h6 style={{ marginBottom: 14 }}>Self-host or hosted</h6>
          <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: '0 0 30px' }}>Same source either way.</h2>
          <div style={{ display: 'grid', gap: 1, background: 'var(--color-divider)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,1.1fr) minmax(0,1fr) minmax(0,1fr)', gap: 20, background: 'var(--color-neutral-100)', padding: '16px 24px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Self-hosted edition</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>Hosted</span>
            </div>
            {MATRIX.map(([feature, self, hosted]) => (
              <div key={feature} data-cv-rows style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,1.1fr) minmax(0,1fr) minmax(0,1fr)', gap: 20, alignItems: 'center', background: 'var(--color-bg)', padding: '20px 24px' }}>
                <strong style={{ fontWeight: 600, fontSize: 15 }}>{feature}</strong>
                <span style={{ color: 'var(--color-neutral-800)', fontSize: 14.5, lineHeight: 1.5 }}>{self}</span>
                <span style={{ color: 'var(--color-neutral-800)', fontSize: 14.5, lineHeight: 1.5 }}>{hosted}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ background: 'var(--color-neutral-100)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '82px 28px' }}>
            <h6 style={{ marginBottom: 14 }}>Before you ask</h6>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: '0 0 30px' }}>The questions that actually matter.</h2>
            <div style={{ display: 'grid', gap: 14 }}>
              {FAQ.map(([q, a]) => (
                <article key={q} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: '26px 28px', border: '1px solid var(--color-divider)' }}>
                  <h3 style={{ fontSize: 19, margin: '0 0 8px' }}>{q}</h3>
                  <p style={{ color: 'var(--color-neutral-800)', lineHeight: 1.6, fontSize: 15, margin: 0 }}>{a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery status */}
        <section style={{ maxWidth: 1100, margin: '0 auto', padding: '82px 28px 110px' }}>
          <h6 style={{ marginBottom: 14 }}>Where hosting is today</h6>
          <h2 style={{ fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-0.015em', margin: '0 0 12px' }}>Not on sale until it is safe to sell.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '62ch', margin: '0 0 30px' }}>
            Hosting runs other people&apos;s capital, so tenant isolation, secrets, monitoring, recovery and subscription
            operations each pass a production review before a single plan goes on sale.
          </p>
          <div style={{ display: 'grid', gap: 1, background: 'var(--color-divider)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {STATUS.map(([title, state, description]) => (
              <div key={title} data-cv-rows style={{ display: 'grid', gridTemplateColumns: 'minmax(170px,0.55fr) 120px minmax(0,1.45fr)', gap: 20, alignItems: 'center', background: 'var(--color-bg)', padding: '22px 24px' }}>
                <strong style={{ fontWeight: 600, fontSize: 15 }}>{title}</strong>
                <span className={state === 'Built' ? 'tag tag-accent-2' : 'tag tag-neutral'}>{state}</span>
                <span style={{ color: 'var(--color-neutral-800)', lineHeight: 1.5, fontSize: 14.5 }}>{description}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32 }}>
            <Link href="/contact?subject=Hosted%20Cival%20interest" className="btn btn-primary" style={{ height: 48, padding: '0 24px' }}>Join the hosted waitlist</Link>
            <Link href="/account/login" className="btn btn-secondary" style={{ height: 48, padding: '0 22px' }}>Sign in to your account</Link>
          </div>

          <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.6, fontSize: 14.5, marginTop: 24, maxWidth: '72ch' }}>
            Hosted access will be optional. Buying a source licence does not create a hosted subscription, and joining the
            waitlist does not authorise a charge. Hosting a trading agent does not reduce trading risk — you remain responsible
            for your strategy, your risk limits and your capital. <Link href="/disclaimer">Full disclaimer</Link>.
          </p>
        </section>

      </main>
      <Footer />
    </div>
  );
}
