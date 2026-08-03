import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Setup Guide',
  description: 'How to set up your Cival Systems product after purchase. Step-by-step guide for Core Edition and other products.',
};

const prerequisites = [
  { tool: 'Node.js 18+', link: 'https://nodejs.org', desc: 'JavaScript runtime' },
  { tool: 'npm or pnpm', link: null, desc: 'Comes with Node.js' },
  { tool: 'A code editor', link: 'https://code.visualstudio.com', desc: 'VS Code recommended' },
  { tool: 'A terminal', link: null, desc: 'Command Prompt, PowerShell, or Terminal.app' },
];

const coreSteps = [
  {
    step: '1',
    title: 'Extract and run',
    code: 'Double-click QUICK-START.bat (Windows) or QUICK-START.command (Mac)',
    note: "The script checks for Node.js, installs dependencies, creates your config file, and opens the dashboard automatically. If you prefer manual setup, run: npm install && npm run dev",
  },
  {
    step: '2',
    title: 'Configure your API keys',
    note: "The Setup Wizard opens at localhost:3000 and walks you through each key. You'll need:",
    list: [
      { name: 'Hyperliquid', url: 'https://app.hyperliquid.xyz/API', desc: "Create an API wallet (trade-only, can't withdraw)" },
      { name: 'Supabase', url: 'https://supabase.com', desc: 'Create a free project → Settings → API → get URL + keys' },
      { name: 'OpenRouter', url: 'https://openrouter.ai', desc: 'Sign up → get API key (powers AI agent decisions)' },
    ],
  },
  {
    step: '3',
    title: 'Set up the database',
    note: 'Go to your Supabase project → SQL Editor → paste the contents of supabase/migrations/001_initial.sql → click Run.',
  },
  {
    step: '4',
    title: 'Start trading',
    note: 'Your dashboard is running. Create agents, configure strategies, set risk limits, and let them trade.',
  },
];

const instantUseSteps = [
  'Download and extract the zip file',
  'Open the folder — files are organized by category',
  'For prompts: copy/paste into ChatGPT, Claude, Midjourney, or any AI tool',
  'For wallpapers: set as desktop/phone background, or use in your projects',
  'For animation packs: use the included assets, scripts, and style references in your pipeline',
];

const strategyPluginSteps = [
  'Download the plugin zip from the Cival Systems Store',
  "Extract it into your dashboard's plugins/ folder",
  'Restart the dashboard',
  'The new strategy appears in Settings → Plugins and is available when creating agents',
];

const extensionSteps = [
  'Download the extension zip from the Cival Systems Store',
  'Extract it anywhere on your computer',
  'Run the included install script: install.bat (Windows) or bash install.command (Mac)',
  'Point it to your dashboard folder when prompted',
  'Restart the dashboard — new pages appear in the sidebar',
];

const faqs = [
  { q: 'Do I need coding experience?', a: 'No. Double-click the QUICK-START script and follow the Setup Wizard. For plugins, just unzip and drop into the plugins folder.' },
  { q: 'What if npm install fails?', a: 'The QUICK-START script handles installation automatically. If it fails, make sure you have Node.js 18+ installed from nodejs.org.' },
  { q: 'Is Supabase free?', a: 'Yes. The free tier includes 500MB of database storage and 1GB of file storage — more than enough to run the dashboard.' },
  { q: 'Can I deploy this publicly?', a: 'Yes. The dashboard is designed to deploy to Vercel (free tier works). You can also self-host on any Node.js-compatible platform.' },
  { q: 'Do I get updates?', a: "Yes — all purchases include 1 year of free updates. You'll receive an email when new versions are available." },
  { q: 'What if I need help?', a: "Email gammawavesdesign@gmail.com and we'll help you get set up. Most issues are resolved within 24 hours." },
];

export default function SetupGuidePage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 760, margin: '0 auto', padding: '150px 28px 96px' }}>
        {/* Breadcrumb */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--color-neutral-600)', marginBottom: 32, display: 'flex', gap: 8, alignItems: 'center',
        }}>
          <Link href="/store" style={{ color: 'var(--color-neutral-600)' }}>Store</Link>
          <span>→</span>
          <span style={{ color: 'var(--color-accent)' }}>Setup Guide</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,4.4vw,54px)', letterSpacing: '-0.015em', margin: '0 0 16px' }}>
          Setup Guide
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-neutral-700)', lineHeight: 1.7, marginBottom: 56, maxWidth: 560 }}>
          Everything you need to get your Cival Systems product running. Most products are ready in under 5 minutes with the QUICK-START script.
        </p>

        {/* Prerequisites */}
        <section style={{ marginBottom: 48 }}>
          <h6 style={{ marginBottom: 16 }}>Prerequisites</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {prerequisites.map(item => (
              <div key={item.tool} style={{
                display: 'flex', gap: 12, alignItems: 'center', padding: '14px 20px',
                borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)',
              }}>
                <span style={{ color: 'var(--color-accent)', fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 14, color: 'var(--color-text)', fontWeight: 600 }}>
                  {item.link ? <a href={item.link} target="_blank" rel="noopener">{item.tool}</a> : item.tool}
                </span>
                <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>— {item.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Core Edition Setup */}
        <section style={{
          marginBottom: 40, padding: '32px', borderRadius: 'calc(var(--radius-lg) * 1.15)',
          background: 'var(--color-surface)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '1.4rem' }}>📊</span>
            <h2 style={{ fontSize: 22, margin: 0 }}>Core Edition</h2>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 28 }}>
            Running in under ten minutes
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            {coreSteps.map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{
                  minWidth: 32, height: 32, borderRadius: '50%', background: 'var(--color-accent)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}>
                  {item.step}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--color-text)', marginBottom: 8 }}>
                    {item.title}
                  </p>
                  {item.code && (
                    <pre style={{
                      padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-bg)',
                      border: '1px solid var(--color-divider)',
                      fontSize: 13, color: 'var(--color-accent-700)', fontFamily: 'var(--font-mono)',
                      marginBottom: 10, overflow: 'auto', whiteSpace: 'pre-wrap',
                    }}>
                      {item.code}
                    </pre>
                  )}
                  {item.note && (
                    <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
                      {item.note}
                    </p>
                  )}
                  {item.list && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                      {item.list.map(api => (
                        <div key={api.name} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <span style={{ color: 'var(--color-accent)', fontSize: 12 }}>→</span>
                          <span style={{ fontSize: 13.5, color: 'var(--color-neutral-700)' }}>
                            <a href={api.url} target="_blank" rel="noopener" style={{ fontWeight: 600 }}>{api.name}</a>
                            {' — '}{api.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prompts / Wallpapers / Animation Packs */}
        <section style={{
          marginBottom: 40, padding: '32px', borderRadius: 'calc(var(--radius-lg) * 1.15)',
          background: 'var(--color-surface)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '1.4rem' }}>💬</span>
            <h2 style={{ fontSize: 22, margin: 0 }}>Prompts, Wallpapers &amp; Animation Packs</h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.7, marginBottom: 16 }}>
            These are instant-use products. No setup required.
          </p>
          <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, margin: 0 }}>
            {instantUseSteps.map((text, i) => (
              <li key={i} style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
                {text}
              </li>
            ))}
          </ol>
        </section>

        {/* Plugin Installation */}
        <section style={{
          marginBottom: 40, padding: '32px', borderRadius: 'calc(var(--radius-lg) * 1.15)',
          background: 'var(--color-surface)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: '1.4rem' }}>🧩</span>
            <h2 style={{ fontSize: 22, margin: 0 }}>Installing Plugins</h2>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Strategy Plugins</h3>
            <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, margin: 0 }}>
              {strategyPluginSteps.map((text, i) => (
                <li key={i} style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
                  {text}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Extensions (Flash Loans, Meme Trading)</h3>
            <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, margin: 0 }}>
              {extensionSteps.map((text, i) => (
                <li key={i} style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
                  {text}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 48 }}>
          <h6 style={{ marginBottom: 20 }}>Common Questions</h6>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {faqs.map(item => (
              <div key={item.q} style={{ padding: '20px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)' }}>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>
                  {item.q}
                </h3>
                <p style={{ fontSize: 13.5, color: 'var(--color-neutral-700)', lineHeight: 1.6 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid var(--color-divider)' }}>
          <Link href="/store" className="btn-ghost" style={{ fontSize: 14, fontWeight: 600 }}>
            ← Browse Products
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
