'use client';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { products } from '@/lib/products';
import { motion } from 'framer-motion';
import Link from 'next/link';

const RIBBON = ['Paper-only by design', 'TypeScript source', 'Next.js 16', 'Simulated orders', 'From $99', 'Setup guides included', 'Portable backups', 'One-time license'];
const STATS = [
  { v: '4/4', k: 'Release tests passing' },
  { v: '0', k: 'Production vulnerabilities' },
  { v: '4', k: 'Verified product views' },
  { v: '1', k: 'Current sellable release' },
];
const PREMISE = [
  { n: '01', t: 'Start from a working paper desk', d: 'The release includes a simulated order ticket, portfolio and risk views, goals, agent controls, and an audit timeline in one coherent workspace.' },
  { n: '02', t: 'Keep the safety boundary visible', d: 'The health endpoint and interface both report paper mode. There is no exchange connector, wallet-secret form, withdrawal route, or live-order endpoint.' },
  { n: '03', t: 'Then make the source yours', d: 'Readable TypeScript, no license server, and no activation dependency for your local copy. Inspect it, run the full check, and adapt it within the product licence.' },
];
const EDITORS = ['Cursor', 'Windsurf', 'VS Code', 'Zed', 'WebStorm', 'Neovim'];
const SOURCE_NOTES = [
  { t: 'AI-assisted customisation', d: 'Point Cursor or Windsurf at the product folder and adapt the interface, paper rules, goals, and workspace model.' },
  { t: 'TypeScript, no obfuscation', d: 'The dashboard, paper engine, safety checks, hosted shell, health route, and tests are supplied as editable source.' },
  { t: 'Guided setup', d: 'README, security guidance, licence, support policy, operations runbook, environment example, and deployment helper are included.' },
];
const COMMUNITY = [
  { n: 'Open', t: 'community Discord link' },
  { n: 'Email', t: 'direct support channel' },
  { n: 'Docs', t: 'setup and deployment guides' },
];

const coreEdition = products.find((p) => p.id === 'trading-dashboard-template')!;
const editions = products.filter((p) => !p.legacy && (p.productType === 'flagship' || p.productType === 'bundle'));
const workspaceViews = [
  { title: 'Operations overview', description: 'Portfolio, simulated performance, agents, goals, and audit context.', image: '/images/products/core-v2/overview.png' },
  { title: 'Paper order desk', description: 'Validated simulated orders with explicit paper-mode boundaries.', image: '/images/products/core-v2/paper-desk.png' },
  { title: 'Agent workspace', description: 'Start, pause, allocation, and research-state controls without live execution.', image: '/images/products/core-v2/agents.png' },
  { title: 'Settings and backup', description: 'Portable JSON export/restore and an always-visible safety status.', image: '/images/products/core-v2/settings.png' },
];

function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}

function Marquee() {
  return (
    <section style={{ background: 'var(--color-neutral-900)', overflow: 'hidden', padding: '20px 0' }}>
      <motion.div animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 26, ease: 'linear' }} style={{ display: 'flex', gap: 16, width: 'max-content' }}>
        {[...RIBBON, ...RIBBON].map((r, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)', fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-neutral-300)', whiteSpace: 'nowrap' }}>
            {r}<span style={{ width: 5, height: 5, borderRadius: 99, background: 'var(--color-accent-500)', display: 'block' }} />
          </span>
        ))}
      </motion.div>
    </section>
  );
}

function Stats() {
  return (
    <section style={{ borderBottom: '1px solid var(--color-divider)', background: 'var(--color-neutral-100)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
        <div data-cv-stats style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
          {STATS.map((s) => (
            <motion.div key={s.k} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ padding: '34px 0', borderRight: '1px solid var(--color-divider)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(26px,2.6vw,36px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-accent-700)' }}>{s.v}</div>
              <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', marginTop: 6 }}>{s.k}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Premise() {
  return (
    <section>
      <div data-cv-2col style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 28px', display: 'grid', gridTemplateColumns: 'minmax(0,0.85fr) minmax(0,1.15fr)', gap: 64, alignItems: 'start' }}>
        <div>
          <h6 style={{ marginBottom: 18 }}>The premise</h6>
          <h2 style={{ fontSize: 'clamp(31px,3.4vw,46px)', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '0 0 22px' }}>
            Start with the verified workflow, not an unsafe prototype.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '42ch' }}>
            Explore simulated operations in a polished interface, inspect every supplied source file, and preserve the paper-only boundary while you adapt it.
          </p>
        </div>
        <div style={{ display: 'grid', gap: 18 }}>
          {PREMISE.map((p) => (
            <motion.div key={p.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ display: 'flex', gap: 22, padding: '34px', borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-accent)', paddingTop: 6 }}>{p.n}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginBottom: 8 }}>{p.t}</div>
                <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>{p.d}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoreEditionCard() {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 32 }}>
        <div>
          <h6 style={{ marginBottom: 14 }}>Where everyone starts</h6>
          <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', letterSpacing: '-0.015em', lineHeight: 1.1, margin: 0 }}>Ninety-nine dollars for the Core source license.</h2>
        </div>
        <Link href="/store/trading-dashboard-template" className="btn btn-ghost">Review the release →</Link>
      </div>
      <div data-cv-2col style={{ borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.15fr)' }}>
        <div style={{ padding: '52px 46px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span className="tag tag-accent">Verified release</span>
            <span className="tag tag-neutral">Next.js 16 · TypeScript</span>
          </div>
          <h3 style={{ fontSize: 36, letterSpacing: '-0.015em', lineHeight: 1.14, margin: '0 0 14px' }}>Cival Core 2.0</h3>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 0 26px' }}>{coreEdition.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 32 }}>
            {['Simulated order desk', 'Agent controls', 'Goal tracking', 'Audit history', 'JSON backup/restore', 'Optional hosted sign-in'].map((f) => (
              <div key={f} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.4 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-700)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}><path d="M20 6 9 17l-5-5" /></svg>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 500 }}>{money(coreEdition.price)}</span>
              <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>one-time</span>
            </div>
            <Link href="/store/trading-dashboard-template" className="btn btn-primary" style={{ height: 46, padding: '0 22px' }}>View details</Link>
          </div>
        </div>
        <div style={{ position: 'relative', minHeight: 460, background: 'var(--color-neutral-200)', overflow: 'hidden' }}>
          {coreEdition.image && <img src={coreEdition.image} alt="Core Edition dashboard" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }} />}
        </div>
      </div>
    </section>
  );
}

function AgentRail() {
  return (
    <section style={{ position: 'relative', background: 'var(--color-neutral-100)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto 32px', padding: '0 28px' }}>
        <h6 style={{ marginBottom: 14 }}>The workspace</h6>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', letterSpacing: '-0.012em', margin: '0 0 12px' }}>Four verified views to inspect before purchase.</h2>
        <p style={{ fontSize: 16, color: 'var(--color-neutral-800)', margin: 0, maxWidth: '52ch' }}>
          These screenshots come from the exact Core 2.0 demo and match the current downloadable release.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '0 28px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        {workspaceViews.map((view) => (
          <Link key={view.title} href="/store/trading-dashboard-template" scroll={false} style={{
            width: 300, flex: 'none', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 14, padding: '30px 26px',
            borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-bg)', textDecoration: 'none', color: 'var(--color-text)', boxShadow: 'var(--shadow-sm)',
          }}>
            <img src={view.image} alt={`${view.title} screenshot`} loading="lazy" decoding="async" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', objectPosition: 'top', borderRadius: 'var(--radius-md)' }} />
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, letterSpacing: '-0.015em', lineHeight: 1.12, marginTop: 4 }}>{view.title}</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-neutral-800)', flex: 1 }}>{view.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--color-divider)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>View gallery</span>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ maxWidth: 1200, margin: '20px auto 0', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Drag or scroll</span>
        <div style={{ flex: 1, height: 2, background: 'var(--color-divider)', borderRadius: 99 }} />
      </div>
    </section>
  );
}

function SourceShowcase() {
  return (
    <section style={{ background: 'var(--color-neutral-900)', color: 'var(--color-neutral-100)' }}>
      <div data-cv-2col style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 28px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 64, alignItems: 'start' }}>
        <div style={{ paddingBottom: 40 }}>
          <h6 style={{ color: 'var(--color-accent-400)', marginBottom: 18 }}>Source, not SaaS</h6>
          <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '0 0 20px', color: 'var(--color-neutral-100)' }}>
            Open it in your editor. Make it unrecognisable.
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--color-neutral-300)', maxWidth: '44ch' }}>
            No compiled binaries, no obfuscation, no license server. Reviewable TypeScript you can inspect in your editor and adapt
            within the product license. Your local copy does not depend on a Cival activation service.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
            {EDITORS.map((e) => (
              <span key={e} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '7px 14px', borderRadius: 999, border: '1px solid color-mix(in srgb, var(--color-neutral-100) 22%, transparent)', color: 'var(--color-neutral-200)' }}>{e}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 1, marginTop: 44, background: 'color-mix(in srgb, var(--color-neutral-100) 12%, transparent)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {SOURCE_NOTES.map((n) => (
              <div key={n.t} style={{ padding: '22px 24px', background: 'var(--color-neutral-900)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-neutral-100)', marginBottom: 6 }}>{n.t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-400)' }}>{n.d}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'sticky', top: 100, borderRadius: 'var(--radius-lg)', background: '#070f0e', border: '1px solid var(--color-divider)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--color-divider)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--color-accent-500)' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--color-accent-2-500)' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--color-neutral-600)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-neutral-600)', marginLeft: 8 }}>lib/safety.ts</span>
          </div>
          <pre style={{ margin: 0, padding: 24, fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.85, color: 'var(--color-neutral-700)', overflowX: 'auto' }}>
{`// Keep the supported release paper-only.
export const safety = {
  tradingMode:        'paper',
  liveTradingEnabled: false,
  acceptsWalletKeys:  false,
  acceptsSeedPhrases: false,
  orderType:          'simulated',
};`}
          </pre>
        </div>
      </div>
    </section>
  );
}

function EditionsStack() {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 28px 0' }}>
      <div style={{ marginBottom: 40 }}>
        <h6 style={{ marginBottom: 14 }}>Current release</h6>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', letterSpacing: '-0.015em', lineHeight: 1.1, margin: 0 }}>One verified product, clearly scoped.</h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '56ch', margin: '14px 0 0' }}>
          Older prototypes and incomplete bundles are retired from new sales. Cival Core 2.0 is the only current store release.
        </p>
      </div>
      <div style={{ display: 'grid', gap: 26, paddingBottom: 120 }}>
        {editions.map((p) => (
          <Link key={p.id} href={`/store/${p.id}`} data-cv-edition style={{
            display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', gap: 32, alignItems: 'center', padding: '44px 44px',
            borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)', boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ width: 64, height: 64, borderRadius: 99, background: 'var(--color-bg)', display: 'grid', placeItems: 'center', fontSize: 26 }}>{p.emoji}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                {p.badge && <span className="tag tag-accent">{p.badge}</span>}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>{p.techStack?.[0] || 'Edition'}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(24px,2.4vw,32px)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--color-neutral-800)', maxWidth: '60ch' }}>{p.description}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 34, fontWeight: 500, lineHeight: 1 }}>{money(p.price)}</div>
              {p.wasPrice && <div style={{ fontSize: 13, color: 'var(--color-neutral-600)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)', marginTop: 6 }}>{money(p.wasPrice)}</div>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProofDemo() {
  return (
    <section data-cv-2col style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 120px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 56, alignItems: 'center' }}>
      <div>
        <h6 style={{ marginBottom: 16 }}>Proof</h6>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,42px)', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '0 0 18px' }}>Click through it before you pay us anything.</h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 0 26px' }}>
          The interactive demo shows the interface with sample data so you can evaluate the workflow before purchase. It does not show verified live performance.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a href="https://cival-core-v2-template.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ height: 46, padding: '0 22px' }}>Open the demo</a>
          <Link href="/store/trading-dashboard-template" className="btn btn-secondary" style={{ height: 46, padding: '0 20px' }}>Own it for $99</Link>
        </div>
      </div>
      <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', aspectRatio: '16/10', background: 'var(--color-neutral-200)' }}>
        <img src="/images/products/core-v2/overview.png" alt="Cival Core 2.0 paper-trading overview" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    </section>
  );
}

function Community() {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 120px' }}>
      <div data-cv-2col style={{ borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-accent-2-100)', padding: '60px 48px', display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: 48, alignItems: 'center' }}>
        <div>
          <h6 style={{ color: 'var(--color-accent-2-700)', marginBottom: 16 }}>Community</h6>
          <h2 style={{ fontSize: 'clamp(28px,3vw,40px)', letterSpacing: '-0.02em', margin: '0 0 14px' }}>Talk setup, plugins, and testing with the community.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-accent-2-900)', margin: '0 0 26px', maxWidth: '48ch' }}>
            Use Discord for community discussion and email for direct purchase or account support. Community content is not financial advice.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ height: 46, padding: '0 22px' }}>Join the Discord</a>
            <a href="/contact" className="btn btn-secondary" style={{ height: 46, padding: '0 20px', borderColor: 'var(--color-accent-2-300)' }}>Get release updates</a>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {COMMUNITY.map((c) => (
            <div key={c.t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 99, background: 'color-mix(in srgb, var(--color-accent-2) 16%, transparent)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: 'var(--color-accent-2-800)', minWidth: 52 }}>{c.n}</span>
              <span style={{ fontSize: 14.5, color: 'var(--color-accent-2-900)' }}>{c.t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ borderTop: '1px solid var(--color-divider)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '130px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(38px,5.2vw,70px)', lineHeight: 1.06, letterSpacing: '-0.018em', margin: '0 auto 26px', maxWidth: '20ch' }}>Explore the paper desk. Then make it yours.</h2>
        <p style={{ fontSize: 17, color: 'var(--color-neutral-800)', margin: '0 auto 34px', maxWidth: '54ch' }}>
          One verified Cival Core 2.0 source release with simulated orders, agent controls, risk views, audit history, and portable backups.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          <Link href="/store" className="btn btn-primary" style={{ height: 54, padding: '0 32px', fontSize: 16 }}>Explore the store</Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="cival">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Premise />
        <CoreEditionCard />
        <AgentRail />
        <SourceShowcase />
        <EditionsStack />
        <ProofDemo />
        <Community />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
