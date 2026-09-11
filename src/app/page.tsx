'use client';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { products } from '@/lib/products';
import { motion } from 'framer-motion';
import Link from 'next/link';

const RIBBON = ['A hedge fund starting point', 'Full TypeScript source', 'Runs on Hyperliquid', 'Skip months of build time', 'From $99', 'One-click setup', 'Agents that execute', 'Own it outright'];
const STATS = [
  { v: '$184K', k: 'Demo portfolio' },
  { v: '6', k: 'Autonomous agents' },
  { v: '2,847', k: 'Trades executed' },
  { v: '68%', k: 'Win rate' },
];
const PREMISE = [
  { n: '01', t: 'The runtime is the hard part', d: 'Order lifecycle, reconciliation, agent supervision, halts that actually halt. Weeks of work with no upside when it goes right.' },
  { n: '02', t: 'Agents execute, not suggest', d: "These aren't alert bots. They size, enter, trail, and flatten on Hyperliquid without a human in the loop." },
  { n: '03', t: 'You own the source', d: 'Full TypeScript. Fork it, rename it, sell your own thing on top of it. No license server, no phone-home.' },
];
const EDITORS = ['Cursor', 'Windsurf', 'VS Code', 'Zed', 'WebStorm', 'Neovim'];
const SOURCE_NOTES = [
  { t: 'AI-assisted customisation', d: 'Point Cursor or Windsurf at the repo and change strategies, add indicators, or build a new agent from an existing one.' },
  { t: 'Full TypeScript, no obfuscation', d: 'Strategies, risk management, UI components, API routes — every line readable and editable.' },
  { t: 'One-click setup', d: 'Double-click QUICK-START: dependencies install, config is written, the dashboard opens. Deploy to Vercel when you’re ready.' },
];
const COMMUNITY = [
  { n: '42', t: 'channels, including a dedicated setup room' },
  { n: '24h', t: 'typical answer time on plugin questions' },
  { n: '1yr', t: 'of updates included with every product' },
];

// `legacy` is excluded from BOTH lists, not just editions.
//
// The homepage filtered on productType alone, so `full-stack-trader-bundle` - legacy:true,
// productType:"bundle", retired and superseded by the Trader and Desk editions - rendered a full
// tile priced at $299 whose href, /store/full-stack-trader-bundle, returns 404. The product detail
// route and sitemap already exclude legacy items; the homepage was the one surface that did not,
// which put a dead $299 link on the highest-traffic page on the site.
//
// Applied to `agents` as well even though no agent is legacy today: meme-trading-suite and
// flash-loan-arbitrage are already legacy extensions, and the next retirement should not have to
// remember to come back and edit this line a second time.
const isSellable = (p: (typeof products)[number]) => !p.legacy;

const coreEdition = products.find((p) => p.id === 'trading-dashboard-template')!;
const agents = products.filter((p) => p.productType === 'agent' && isSellable(p));
const editions = products.filter(
  (p) => (p.productType === 'flagship' || p.productType === 'bundle') && isSellable(p),
);

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
        {/* 4 hard columns collapsed to ~70px each at 375px, with no gap. "Autonomous agents"
            needs 95px, so labels ran straight into their neighbours. Two columns on a phone gives
            each label ~160px, which every one of them fits. Geometry is in the class, NOT inline:
            inline styles outrank media queries and would make the breakpoint a no-op. */}
        <div className="stats-grid">
          {STATS.map((s) => (
            <motion.div key={s.k} className="stat-cell" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(24px,2.6vw,36px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-accent-700)' }}>{s.v}</div>
              <div className="stat-label">{s.k}</div>
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
            Building the boring 80% costs you a quarter and a million tokens.
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '42ch' }}>
            You don&apos;t need help having strategy ideas. You need somewhere to run them — with position tracking that reconciles,
            drawdown limits that actually halt an agent, and a UI you can look at during a 14% day.
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
          <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', letterSpacing: '-0.015em', lineHeight: 1.1, margin: 0 }}>Ninety-nine dollars to own the platform.</h2>
        </div>
        <Link href="/store" className="btn btn-ghost">Compare editions →</Link>
      </div>
      <div data-cv-2col style={{ borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.15fr)' }}>
        <div style={{ padding: '52px 46px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span className="tag tag-accent">Core edition</span>
            <span className="tag tag-neutral">Next.js 15 · TS</span>
          </div>
          <h3 style={{ fontSize: 36, letterSpacing: '-0.015em', lineHeight: 1.14, margin: '0 0 14px' }}>Core Edition</h3>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 0 26px' }}>{coreEdition.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 32 }}>
            {['Live VWAP + RSI agent included', 'Goal-based execution', 'Farm orchestration', 'Drawdown halts + reconciliation', '44 themes', '2,400+ source files'].map((f) => (
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
          {coreEdition.image && <img src={coreEdition.image} alt="Core Edition dashboard" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' }} />}
        </div>
      </div>
    </section>
  );
}

function AgentRail() {
  return (
    <section style={{ position: 'relative', background: 'var(--color-neutral-100)', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto 32px', padding: '0 28px' }}>
        <h6 style={{ marginBottom: 14 }}>The agents</h6>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', letterSpacing: '-0.012em', margin: '0 0 12px' }}>Six strategies that trade while you sleep.</h2>
        <p style={{ fontSize: 16, color: 'var(--color-neutral-800)', margin: 0, maxWidth: '52ch' }}>
          Each one drops into the dashboard as a plugin. Run one, or run all six as a coordinated farm under shared risk limits.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 20, padding: '0 28px', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
        {agents.map((p) => (
          <Link key={p.id} href={`/store/${p.id}`} scroll={false} style={{
            width: 300, flex: 'none', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 14, padding: '30px 26px',
            borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-bg)', textDecoration: 'none', color: 'var(--color-text)', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ width: 46, height: 46, borderRadius: 99, background: 'var(--color-accent-2-100)', display: 'grid', placeItems: 'center', fontSize: 20 }}>{p.emoji}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 21, letterSpacing: '-0.015em', lineHeight: 1.12, marginTop: 4 }}>{p.name}</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-neutral-800)', flex: 1 }}>{p.description}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--color-divider)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 19, fontWeight: 500 }}>{money(p.price)}</span>
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
            No compiled binaries, no obfuscation, no license server. Clean TypeScript you can point Cursor at and refactor into your
            own thing. There is no version of this where we can turn it off.
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
        <div style={{ position: 'sticky', top: 100, borderRadius: 'var(--radius-lg)', background: 'color-mix(in srgb, var(--color-neutral-900) 72%, #000)', border: '1px solid color-mix(in srgb, var(--color-neutral-100) 14%, transparent)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid color-mix(in srgb, var(--color-neutral-100) 12%, transparent)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--color-accent-500)' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--color-accent-2-500)' }} />
            <span style={{ width: 9, height: 9, borderRadius: 99, background: 'var(--color-neutral-600)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-neutral-500)', marginLeft: 8 }}>agents/vwap-rsi/strategy.ts</span>
          </div>
          <pre style={{ margin: 0, padding: 24, fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.85, color: 'var(--color-neutral-300)', overflowX: 'auto' }}>
{`// tune it, break it, ship it — it's your file now
export const config: AgentConfig = {
  venue:        'hyperliquid',
  symbols:      ['BTC', 'ETH', 'SOL'],
  entry:        { vwapBand: 1.5, rsiDiv: true },
  risk:         { maxDrawdownPct: 8, perTradePct: 1.5 },
  onHalt:       async () => farm.defensive(),
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
        <h6 style={{ marginBottom: 14 }}>Editions</h6>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', letterSpacing: '-0.015em', lineHeight: 1.1, margin: 0 }}>Three steps, no wrong entry point.</h2>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '56ch', margin: '14px 0 0' }}>
          Every edition includes the full platform and its source. Move up when you want more strategies — you only pay the difference.
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
          The demo is the product with sample data in it. Six agents, seven farms, live analytics, every tab. No signup, no email gate.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a href="https://ai-trading-dashboard-demo.vercel.app" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ height: 46, padding: '0 22px' }}>Open the demo</a>
          <Link href="/store/trading-dashboard-template" className="btn btn-secondary" style={{ height: 46, padding: '0 20px' }}>Own it for $99</Link>
        </div>
      </div>
      <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', aspectRatio: '16/10', background: 'var(--color-bg)' }}>
        <img src="/images/cival/gw-shot-live-trading.png" alt="Live trading dashboard" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          <h2 style={{ fontSize: 'clamp(28px,3vw,40px)', letterSpacing: '-0.02em', margin: '0 0 14px' }}>42 channels of people running this in production.</h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-accent-2-900)', margin: '0 0 26px', maxWidth: '48ch' }}>
            Setup help, plugin sharing, strategy arguments at 3am. If you get stuck on a Supabase key, someone has already been stuck on it.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ height: 46, padding: '0 22px' }}>Join the Discord</a>
            <a href="https://x.com/GWDSofficial" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ height: 46, padding: '0 20px', borderColor: 'var(--color-accent-2-300)' }}>Follow on X</a>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {COMMUNITY.map((c) => (
            <div key={c.t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px', borderRadius: 99, background: 'color-mix(in srgb, #fff 55%, transparent)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: 'var(--color-accent-2-800)', minWidth: 52 }}>{c.n}</span>
              <span style={{ fontSize: 14.5, color: 'var(--color-accent-2-900)' }}>{c.t}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HostedPlans() {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '70px 28px' }}>
      <div className="card" style={{ padding: '40px 32px', background: 'var(--color-surface)' }}>
        <span className="tag tag-accent">Managed cloud hosting</span>
        <h2 style={{ fontSize: 'clamp(30px,3.2vw,44px)', margin: '18px 0 14px' }}>Your dashboard stays running in the cloud.</h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, maxWidth: '66ch', color: 'var(--color-neutral-800)' }}>
          Start with Solo at $29/month for one strategy agent. Scale to Desk for up to three agents or Fund for up to ten.
          Every plan includes one private persistent dashboard, managed updates, cloud saves and backups.
        </p>
        <p style={{ lineHeight: 1.6, maxWidth: '66ch', color: 'var(--color-neutral-700)' }}>
          Bring your own AI provider keys and fund your own Hyperliquid account. AI usage, trading capital and exchange fees are separate.
          Hosting is paid monthly; there is no free hosting tier.
        </p>
        <Link href="/hosted" className="btn btn-primary">View plans and launch availability</Link>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section style={{ borderTop: '1px solid var(--color-divider)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '130px 28px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(38px,5.2vw,70px)', lineHeight: 1.06, letterSpacing: '-0.018em', margin: '0 auto 26px', maxWidth: '20ch' }}>Choose how you run your trading desk.</h2>
        <p style={{ fontSize: 17, color: 'var(--color-neutral-800)', margin: '0 auto 34px', maxWidth: '52ch' }}>
          Choose a source edition to operate yourself, or a managed cloud plan for a persistent dashboard.
          Connect your provider keys, approve your agent wallet and configure risk limits before enabling trading.
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
        <HostedPlans />
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
