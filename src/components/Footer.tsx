'use client';
import Link from 'next/link';
import { AnimatedWaveBorder } from './WaveDivider';

const links = {
  Products: ['/templates', '/trading', '/animations', '/3d', '/store'],
  labels: ['AI Templates', 'Trading Tools', 'Animations', '3D Assets', 'All Products'],
  Company: ['/about', '/blog', '/careers', '/contact'],
  companyLabels: ['About', 'Blog', 'Careers', 'Contact'],
};

export default function Footer() {
  return (
    <footer style={{
      background: 'oklch(0.06 0 0)',
      borderTop: '1px solid oklch(0.15 0.02 270)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated top border wave */}
      <AnimatedWaveBorder color="oklch(0.65 0.29 295)" opacity={0.15} />

      {/* GWDS watermark */}
      <div style={{
        position: 'absolute',
        bottom: -40,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(80px, 15vw, 180px)',
        fontWeight: 800,
        color: 'oklch(0.98 0 0 / 0.03)',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        lineHeight: 1,
      }}>
        GWDS
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 48, marginBottom: 60 }}>
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <svg width="24" height="18" viewBox="0 0 56 40" fill="none">
                <path d="M2,20 C8,4 16,4 22,20 C28,36 36,36 42,20 C48,4 50,4 54,10"
                  stroke="oklch(0.65 0.29 295)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <path d="M2,28 C8,12 16,12 22,28 C28,44 36,44 42,28"
                  stroke="oklch(0.75 0.15 195)" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.08em', color: 'oklch(0.98 0 0)' }}>
                GWDS
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'oklch(0.55 0.01 250)', lineHeight: 1.7, maxWidth: 300, margin: '0 0 24px' }}>
              Gamma Waves Design Studio. Digital products at the intersection of AI, design, and wave physics.
            </p>
            {/* Social links */}
            <div style={{ display: 'flex', gap: 16 }}>
              {['Twitter/X', 'Instagram', 'TikTok'].map(s => (
                <a key={s} href="#" style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'oklch(0.50 0.02 270)',
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.75 0.15 195)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.50 0.02 270)')}
                >{s}</a>
              ))}
            </div>
          </div>

          {/* Products column */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'oklch(0.65 0.29 295)', textTransform: 'uppercase', marginBottom: 20, fontWeight: 500 }}>
              Products
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.labels.map((label, i) => (
                <li key={label}>
                  <Link href={links.Products[i]} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'oklch(0.58 0.01 250)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.98 0 0)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.58 0.01 250)')}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'oklch(0.65 0.29 295)', textTransform: 'uppercase', marginBottom: 20, fontWeight: 500 }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.companyLabels.map((label, i) => (
                <li key={label}>
                  <Link href={links.Company[i]} style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'oklch(0.58 0.01 250)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.98 0 0)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.58 0.01 250)')}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid oklch(0.15 0.02 270)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'oklch(0.40 0.01 270)', letterSpacing: '0.05em' }}>
            © 2026 Gamma Waves Design Studio. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'License'].map(t => (
              <Link key={t} href="#" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                color: 'oklch(0.40 0.01 270)',
                textDecoration: 'none',
                letterSpacing: '0.05em',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'oklch(0.68 0.01 250)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'oklch(0.40 0.01 270)')}
              >{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
