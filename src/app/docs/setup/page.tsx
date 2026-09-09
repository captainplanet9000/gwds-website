import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Cival Core 2.0 Setup Guide',
  description: 'Install and run the verified Cival Core 2.0 paper-trading source template.',
};

const steps = [
  {
    title: 'Verify and extract the release',
    body: 'Download Cival Core 2.0 from your verified account. Keep the original ZIP until setup is complete. If your receipt includes a SHA-256 digest, compare it before extracting.',
  },
  {
    title: 'Install the locked dependencies',
    code: 'npm ci',
    body: 'Open a terminal in the extracted product folder. Use Node.js 20 or newer. The lockfile pins the dependency tree reviewed for this release.',
  },
  {
    title: 'Run the local workspace',
    code: 'npm run dev',
    body: 'Open http://localhost:3000. Local mode stores your paper workspace in this browser. It does not need an exchange account, wallet, API key, or database.',
  },
  {
    title: 'Use only simulated orders',
    body: 'Review the dashboard, adjust agents and goals, submit paper orders, and export a JSON backup. The supported release has no live-order endpoint, exchange connector, withdrawal route, or private-key form.',
  },
  {
    title: 'Verify a production build',
    code: 'npm run check',
    body: 'This runs lint, TypeScript, unit tests, and a production build. Run it after making changes and before deploying your fork.',
  },
] as const;

export default function SetupGuidePage() {
  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 800, margin: '0 auto', padding: '150px 28px 96px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', marginBottom: 32, display: 'flex', gap: 8 }}>
          <Link href="/store/trading-dashboard-template">Cival Core 2.0</Link><span>→</span><span style={{ color: 'var(--color-accent)' }}>Setup</span>
        </div>
        <span className="tag tag-accent">Verified release 2.0.0</span>
        <h1 style={{ fontSize: 'clamp(36px,5vw,58px)', letterSpacing: '-0.015em', margin: '18px 0 16px' }}>Set up Cival Core 2.0</h1>
        <p style={{ fontSize: 17, color: 'var(--color-neutral-700)', lineHeight: 1.7, marginBottom: 44, maxWidth: 650 }}>
          The package is a paper-trading source template. Start locally, keep it paper-only, and read the included README, SECURITY, LICENSE, SUPPORT, and RUNBOOK files before changing or deploying it.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          {steps.map((step, index) => (
            <section className="card" style={{ padding: 26 }} key={step.title}>
              <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-accent)', color: 'var(--color-bg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, flexShrink: 0 }}>{index + 1}</span>
                <div>
                  <h2 style={{ fontSize: 20, margin: '3px 0 9px' }}>{step.title}</h2>
                  {'code' in step && step.code ? <pre style={{ background: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', padding: '12px 14px', overflowX: 'auto' }}><code>{step.code}</code></pre> : null}
                  <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.7, marginBottom: 0 }}>{step.body}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <section style={{ marginTop: 38, padding: 26, border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: 22, marginTop: 0 }}>Optional managed hosting</h2>
          <p style={{ color: 'var(--color-neutral-700)', lineHeight: 1.7 }}>
            The source supports authenticated cloud saves when Cival configures a managed tenant. Do not put a Supabase service-role key or any exchange/wallet credential into the customer application. Managed hosting is not available for purchase until the public launch gate is open.
          </p>
          <Link href="/hosted" className="btn btn-secondary">Review managed hosting</Link>
        </section>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 38 }}>
          <a className="btn btn-primary" href="https://cival-core-v2-template.vercel.app" target="_blank" rel="noopener noreferrer">Open the paper demo</a>
          <Link className="btn btn-secondary" href="/contact?subject=Technical%20Support">Contact support</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
