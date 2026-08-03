'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="cival" style={{ background: 'var(--color-neutral-900)', color: 'var(--color-neutral-300)' }}>
      <div data-cv-2col style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 28px 40px', display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) repeat(4, minmax(0,1fr))', gap: 34 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: 999, overflow: 'hidden', border: '1.5px solid var(--color-neutral-100)' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, padding: '6px 14px', lineHeight: 1.25, color: 'var(--color-neutral-100)' }}>Cival</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '0 14px', background: 'var(--color-neutral-100)', color: 'var(--color-neutral-900)', display: 'flex', alignItems: 'center' }}>Systems</span>
            </span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-neutral-400)', margin: 0, maxWidth: '34ch' }}>
            Cival Systems. Trading infrastructure and autonomous agents, sold as source.
          </p>
        </div>

        <div>
          <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 14 }}>Product</h6>
          <div style={{ display: 'grid', gap: 9, fontSize: 14 }}>
            <Link href="/store" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>All products</Link>
            <Link href="/store" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/store/trading-dashboard-template" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Core Edition — $99</Link>
            <Link href="/store?cat=agent" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Trading agents</Link>
          </div>
        </div>

        <div>
          <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 14 }}>Resources</h6>
          <div style={{ display: 'grid', gap: 9, fontSize: 14 }}>
            <Link href="/docs/setup" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Documentation</Link>
            <Link href="/content" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Content</Link>
            <Link href="/refunds" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Refund policy</Link>
            <Link href="/disclaimer" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Disclaimer</Link>
          </div>
        </div>

        <div>
          <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 14 }}>Studio</h6>
          <div style={{ display: 'grid', gap: 9, fontSize: 14 }}>
            <Link href="/about" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>About</Link>
            <Link href="/contact" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Contact</Link>
            <Link href="/account/login" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Sign in</Link>
            <Link href="/terms" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Legal &amp; refunds</Link>
          </div>
        </div>

        <div>
          <h6 style={{ color: 'var(--color-neutral-500)', marginBottom: 14 }}>Connect</h6>
          <div style={{ display: 'grid', gap: 9, fontSize: 14 }}>
            <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Discord</a>
            <a href="https://x.com/GWDSofficial" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>X · @GWDSofficial</a>
            <a href="https://github.com/captainplanet9000" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>GitHub</a>
            <a href="mailto:gammawavesdesign@gmail.com" style={{ color: 'var(--color-neutral-300)', textDecoration: 'none' }}>Email</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px 56px' }}>
        <hr style={{ border: 0, height: 1, background: 'color-mix(in srgb, var(--color-neutral-100) 14%, transparent)', margin: '0 0 24px' }} />
        <p style={{ fontSize: 11.5, lineHeight: 1.65, color: 'var(--color-neutral-500)', margin: '0 0 16px', maxWidth: '96ch' }}>
          Cival Systems products are software templates and source code sold as development starting points. They are not financial advice.
          Trading cryptocurrencies, futures, and digital assets involves substantial risk of loss. Past performance shown in demos or marketing
          does not guarantee future results. Cival Systems is not a registered investment advisor or broker-dealer.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', fontSize: 12, color: 'var(--color-neutral-500)' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>© {currentYear} Cival Systems</span>
          <Link href="/privacy" style={{ color: 'var(--color-neutral-400)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'var(--color-neutral-400)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/refunds" style={{ color: 'var(--color-neutral-400)', textDecoration: 'none' }}>Refunds</Link>
          <Link href="/disclaimer" style={{ color: 'var(--color-neutral-400)', textDecoration: 'none' }}>Disclaimer</Link>
        </div>
      </div>
    </footer>
  );
}
