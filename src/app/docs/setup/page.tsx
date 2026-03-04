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
            Everything you need to get your GWDS product running. Most templates are ready in under 10 minutes.
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
                  title: 'Extract and install',
                  code: 'cd ai-trading-dashboard\nnpm install',
                  note: 'Dependencies install automatically. Warnings about peer deps are safe to ignore.',
                },
                {
                  step: '2',
                  title: 'Create your environment file',
                  code: 'cp .env.example .env.local',
                  note: 'Open .env.local in your editor. Each variable has a comment explaining what it does.',
                },
                {
                  step: '3',
                  title: 'Get your API keys',
                  note: null,
                  list: [
                    { name: 'Hyperliquid', url: 'https://app.hyperliquid.xyz/API', desc: 'Create an API wallet (trade-only, no withdrawal access)' },
                    { name: 'Supabase', url: 'https://supabase.com', desc: 'Create a free project → Settings → API → get URL + keys' },
                    { name: 'OpenRouter', url: 'https://openrouter.ai', desc: 'Sign up → get API key (powers AI agent decisions)' },
                  ],
                },
                {
                  step: '4',
                  title: 'Set up the database',
                  note: 'Go to your Supabase project → SQL Editor → paste the contents of supabase/migrations/001_initial.sql → click Run. This creates all the tables your dashboard needs.',
                },
                {
                  step: '5',
                  title: 'Start the dashboard',
                  code: 'npm run dev',
                  note: 'Open http://localhost:3000 — the Setup Wizard will verify your configuration and walk you through final steps.',
                },
                {
                  step: '6',
                  title: 'Deploy to Vercel (optional)',
                  note: 'Push to GitHub and connect to Vercel, or use the Deploy button in the README. Add your environment variables in the Vercel dashboard.',
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

          {/* FAQ */}
          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#E8E8E8', marginBottom: 24 }}>
              Common Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { q: 'Do I need coding experience?', a: 'For templates (Trading Dashboard, SaaS Starter, etc.), basic familiarity with the command line helps. The setup wizard handles most configuration. For prompt packs and wallpapers, no technical skills needed.' },
                { q: 'What if npm install fails?', a: 'The .npmrc file included in the project handles most dependency issues automatically. If you still have trouble, make sure you have Node.js 18 or later installed.' },
                { q: 'Is Supabase free?', a: 'Yes. The free tier includes 500MB of database storage and 1GB of file storage — more than enough to run the dashboard.' },
                { q: 'Can I deploy this publicly?', a: 'Yes. The dashboard is designed to deploy to Vercel (free tier works). You can also self-host on any Node.js-compatible platform.' },
                { q: 'Do I get updates?', a: 'Yes — all purchases include 1 year of free updates. You\'ll receive an email when new versions are available.' },
                { q: 'What if I need help?', a: 'Email support@gwds.studio and we\'ll help you get set up. Most issues are resolved within 24 hours.' },
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
