'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/', label: 'Work' },
    { href: '/store', label: 'Store' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/docs/setup', label: 'Setup Guide' },
  ];

  const socialLinks = [
    { href: 'https://twitter.com/gwds_studio', label: 'Twitter' },
    { href: 'https://github.com/captainplanet9000', label: 'GitHub' },
    { href: '/content', label: 'Content' },
  ];

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(232, 232, 232, 0.1)',
        background: '#000',
        padding: '48px 40px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Top Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '48px',
            marginBottom: '40px',
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#E8E8E8',
                  letterSpacing: '-0.02em',
                }}
              >
                GWDS
              </span>
            </Link>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.85rem',
                color: '#A8A8A8',
                marginTop: '12px',
                lineHeight: 1.6,
              }}
            >
              Gamma Waves Design Studio
              <br />
              Digital products & creative tools
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#E8E8E8',
                marginBottom: '16px',
              }}
            >
              Navigation
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    color: '#A8A8A8',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#E8E8E8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#A8A8A8';
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social */}
          <div>
            <h4
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#E8E8E8',
                marginBottom: '16px',
              }}
            >
              Connect
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.85rem',
                    color: '#A8A8A8',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#E8E8E8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#A8A8A8';
                  }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div
          style={{
            paddingTop: '24px',
            borderTop: '1px solid rgba(232, 232, 232, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          className="footer-bottom"
        >
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            © {currentYear} Gamma Waves Design Studio. All rights reserved.
          </p>

          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { label: 'Privacy', href: '/privacy' },
              { label: 'Terms', href: '/terms' },
              { label: 'Refunds', href: '/refunds' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8rem',
                  color: '#666',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 6vh !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 3vh !important;
            text-align: center !important;
          }
          span,
          h4 {
            font-size: 5vw !important;
          }
          p,
          a {
            font-size: 3.5vw !important;
          }
        }
      `}</style>
    </footer>
  );
}
