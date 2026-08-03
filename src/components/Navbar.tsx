'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { href: '/store', label: 'Store' },
  { href: '/store?cat=edition', label: 'Pricing' },
  { href: '/docs/setup', label: 'Docs' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { user, loading: authLoading, signOut } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="cival"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        backdropFilter: 'blur(14px)',
        background: 'color-mix(in srgb, var(--color-bg) 84%, transparent)',
        borderBottom: isScrolled ? '1px solid var(--color-divider)' : '1px solid transparent',
        transition: 'border-color 0.3s ease',
      }}
    >
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 66,
        display: 'flex', alignItems: 'center', gap: 30,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--color-text)', marginRight: 'auto' }} aria-label="Cival Systems — home">
          <span style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: 999, overflow: 'hidden', border: '1.5px solid var(--color-text)' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 16, padding: '5px 13px', lineHeight: 1.25 }}>Cival</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', padding: '0 13px', background: 'var(--color-text)', color: 'var(--color-bg)', display: 'flex', alignItems: 'center' }}>Systems</span>
          </span>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 26, fontSize: 14 }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
              {link.label}
            </Link>
          ))}

          <button onClick={toggleCart} className="btn btn-secondary" style={{ gap: 8, fontSize: 13, height: 40, padding: '0 18px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /><path d="M19 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" /><path d="M2 3h2l2.6 12.2a2 2 0 0 0 2 1.6h9.2a2 2 0 0 0 2-1.6L21 7H5" /></svg>
            Cart <span style={{ fontFamily: 'var(--font-mono)' }}>{totalItems}</span>
          </button>

          {!authLoading && (
            user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowAccountMenu(!showAccountMenu)} style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  {user.email?.split('@')[0] || 'Account'}
                </button>
                {showAccountMenu && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 10, background: 'var(--color-bg)', border: '1px solid var(--color-divider)', borderRadius: 12, padding: 8, minWidth: 160, boxShadow: 'var(--shadow-md)', zIndex: 1001 }}>
                    <Link href="/account" onClick={() => setShowAccountMenu(false)} style={{ display: 'block', padding: '10px 14px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.85rem', borderRadius: 8 }}>
                      My Account
                    </Link>
                    <button onClick={() => { signOut(); setShowAccountMenu(false); }} style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--color-neutral-600)', textAlign: 'left', fontSize: '0.85rem', cursor: 'pointer', borderRadius: 8, fontFamily: 'var(--font-body)' }}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/account/login" style={{ textDecoration: 'none', color: 'var(--color-text)', fontWeight: 600 }}>
                Sign in
              </Link>
            )
          )}
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.5rem', cursor: 'pointer', padding: 0 }}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg)', borderBottom: '1px solid var(--color-divider)', padding: 20 }}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'block', fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-text)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid var(--color-divider)' }}>
              {link.label}
            </Link>
          ))}
          <button onClick={() => { toggleCart(); setIsMobileMenuOpen(false); }} className="btn btn-secondary btn-block" style={{ marginTop: 16 }}>
            Cart ({totalItems})
          </button>
          {!authLoading && (
            user ? (
              <>
                <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-ghost btn-block" style={{ marginTop: 8, textAlign: 'center' }}>
                  My Account
                </Link>
                <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/account/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary btn-block" style={{ marginTop: 8, textAlign: 'center' }}>
                Sign in
              </Link>
            )
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
