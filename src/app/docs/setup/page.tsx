import { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Setup Guide — GWDS',
  description: 'How to set up your GWDS template after purchase. Step-by-step guide for the AI Trading Dashboard and other products.',
};

const accent = '#8B5CF6';

export default function SetupGuidePage() {
  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: '0.72rem', color: '#555', fontFamily: 'var(--font-body)', marginBottom: 40, display: 'flex', gap: 8 }}>
            <Link href="/store" style={{ color: '#666', textDecoration: 'none' }}>Store</Link>
            <span>→</span>
            <span style={{ color: '#888' }}>Setup Guide</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 800, color: '#E8E8E8', letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1,
          }}>
            Setup Guide
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: 48 }}>
            Everything you need to get your GWDS product running. Most products are ready in under 5 minutes with the QUICK-START script.
          </p>

          {/* Prerequisites */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#E8E8E8', marginBottom: 16 }}>
              Prerequisites
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { tool: 'Node.js 18+', link: 'https://nodejs.org', desc: 'JavaScript runtime' },
                { tool: 'npm or pnpm', link: null, desc: 'Comes with Node.js' },
                { tool: 'A code editor', link: 'https://code.visualstudio.com', desc: 'VS Code recommended' },
                { tool: 'A terminal', link: null, desc: 'Command Prompt, PowerShell, or Terminal.app' },
              ].map(item => (
                <div key={item.tool} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 16px', borderRadius: 8, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                  <span style={{ color: accent, fontSize: '0.85rem' }}>✓</span>
                  <span style={{ fontSize: '0.85rem', color: '#E8E8E8', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                    {item.link ? <a href={item.link} target="_blank" rel="noopener" style={{ color: accent, textDecoration: 'none' }}>{item.tool}</a> : item.tool}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'var(--font-body)' }}>— {item.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* AI Trading Dashboard Setup */}
          <section style={{ marginBottom: 48, padding: 32, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: '1.5rem' }}>📊</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#E8E8E8' }}>
                AI Trading Dashboard
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                {
                  step: '1',
                  title: 'Extract and run',
                  code: 'Double-click QUICK-START.bat (Windows) or QUICK-START.command (Mac)',
                  note: 'The script checks for Node.js, installs dependencies, creates your config file, and opens the dashboard automatically. If you prefer manual setup, run: npm install && npm run dev',
                },
                {
                  step: '2',
                  title: 'Configure your API keys',
                  note: 'The Setup Wizard opens at localhost:3000 and walks you through each key. You\'ll need:',
                  list: [
                    { name: 'Hyperliquid', url: 'https://app.hyperliquid.xyz/API', desc: 'Create an API wallet (trade-only, can\'t withdraw)' },
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
              ].map((item) => (
                <div key={item.step}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <span style={{
                      minWidth: 30, height: 30, borderRadius: '50%', background: accent, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {item.step}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#E8E8E8', fontFamily: 'var(--font-display)', marginBottom: 6 }}>
                        {item.title}
                      </p>
                      {item.code && (
                        <pre style={{
                          padding: '12px 16px', borderRadius: 6, background: '#111', border: '1px solid #222',
                          fontSize: '0.78rem', color: '#8B5CF6', fontFamily: 'var(--font-mono, monospace)',
                          marginBottom: 8, overflow: 'auto',
                        }}>
                          {item.code}
                        </pre>
                      )}
                      {item.note && (
                        <p style={{ fontSize: '0.8rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                          {item.note}
                        </p>
                      )}
                      {item.list && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                          {item.list.map(api => (
                            <div key={api.name} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                              <span style={{ color: accent, fontSize: '0.75rem' }}>→</span>
                              <span style={{ fontSize: '0.8rem', color: '#999', fontFamily: 'var(--font-body)' }}>
                                <a href={api.url} target="_blank" rel="noopener" style={{ color: accent, textDecoration: 'none', fontWeight: 600 }}>{api.name}</a>
                                {' — '}{api.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Prompts / Wallpapers / Animations */}
          <section style={{ marginBottom: 48, padding: 32, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem' }}>💬</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#E8E8E8' }}>
                Prompts, Wallpapers & Animation Packs
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: 16 }}>
              These are instant-use products. No setup required.
            </p>
            <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Download and extract the zip file',
                'Open the folder — files are organized by category',
                'For prompts: copy/paste into ChatGPT, Claude, Midjourney, or any AI tool',
                'For wallpapers: set as desktop/phone background, or use in your projects',
                'For animation packs: use the included assets, scripts, and style references in your pipeline',
              ].map((text, i) => (
                <li key={i} style={{ fontSize: '0.82rem', color: '#999', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                  {text}
                </li>
              ))}
            </ol>
          </section>

          {/* Plugin Installation */}
          <section style={{ marginBottom: 48, padding: 32, borderRadius: 12, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: '1.5rem' }}>🧩</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#E8E8E8' }}>
                Installing Plugins
              </h2>
            </div>

            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: '#E8E8E8', marginBottom: 12 }}>
                Strategy Plugins
              </h3>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Download the plugin zip from the GWDS Store',
                  'Extract it into your dashboard\'s plugins/ folder',
                  'Restart the dashboard',
                  'The new strategy appears in Settings → Plugins and is available when creating agents',
                ].map((text, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: '#999', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                    {text}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: '#E8E8E8', marginBottom: 12 }}>
                Extensions (Flash Loans, Meme Trading)
              </h3>
              <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Download the extension zip from the GWDS Store',
                  'Extract it anywhere on your computer',
                  'Run the included install script: install.bat (Windows) or bash install.command (Mac)',
                  'Point it to your dashboard folder when prompted',
                  'Restart the dashboard — new pages appear in the sidebar',
                ].map((text, i) => (
                  <li key={i} style={{ fontSize: '0.82rem', color: '#999', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                    {text}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#E8E8E8', marginBottom: 24 }}>
              Common Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { q: 'Do I need coding experience?', a: 'No. Double-click the QUICK-START script and follow the Setup Wizard. For plugins, just unzip and drop into the plugins folder.' },
                { q: 'What if npm install fails?', a: 'The QUICK-START script handles installation automatically. If it fails, make sure you have Node.js 18+ installed from nodejs.org.' },
                { q: 'Is Supabase free?', a: 'Yes. The free tier includes 500MB of database storage and 1GB of file storage — more than enough to run the dashboard.' },
                { q: 'Can I deploy this publicly?', a: 'Yes. The dashboard is designed to deploy to Vercel (free tier works). You can also self-host on any Node.js-compatible platform.' },
                { q: 'Do I get updates?', a: 'Yes — all purchases include 1 year of free updates. You\'ll receive an email when new versions are available.' },
                { q: 'What if I need help?', a: 'Email gammawavesdesign@gmail.com and we\'ll help you get set up. Most issues are resolved within 24 hours.' },
              ].map(item => (
                <div key={item.q} style={{ padding: '20px 24px', borderRadius: 10, background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#E8E8E8', fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                    {item.q}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: '#777', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div style={{ textAlign: 'center', paddingTop: 24, borderTop: '1px solid #1a1a1a' }}>
            <Link href="/store" style={{ fontSize: '0.85rem', color: accent, textDecoration: 'none', fontFamily: 'var(--font-body)' }}>
              ← Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
