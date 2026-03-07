'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const { user, loading: authLoading, signOut } = useAuth();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/store', label: 'Store' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '16px 40px',
        background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(232, 232, 232, 0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
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

        {/* Desktop Nav */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.875rem',
                fontWeight: 500,
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

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            style={{
              background: 'transparent',
              border: '1px solid rgba(232, 232, 232, 0.2)',
              color: '#E8E8E8',
              padding: '8px 16px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: '2px',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8E8E8';
              e.currentTarget.style.color = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#E8E8E8';
            }}
          >
            Cart ({totalItems})
          </button>

          {/* Account */}
          {!authLoading && (
            user ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#8B5CF6',
                    padding: '8px 16px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {user.email?.split('@')[0] || 'Account'}
                </button>
                {showAccountMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 8,
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: 8,
                      padding: 8,
                      minWidth: 160,
                      zIndex: 1001,
                    }}
                  >
                    <Link
                      href="/account"
                      onClick={() => setShowAccountMenu(false)}
                      style={{
                        display: 'block',
                        padding: '10px 14px',
                        color: '#E8E8E8',
                        textDecoration: 'none',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.85rem',
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => { signOut(); setShowAccountMenu(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        textAlign: 'left',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account/login"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#A8A8A8',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#E8E8E8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#A8A8A8'; }}
              >
                Sign In
              </Link>
            )
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#E8E8E8',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 0,
          }}
          className="mobile-menu-btn"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#000',
            borderBottom: '1px solid rgba(232, 232, 232, 0.1)',
            padding: '20px',
          }}
          className="mobile-menu"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.1rem',
                fontWeight: 500,
                color: '#A8A8A8',
                textDecoration: 'none',
                padding: '12px 0',
                borderBottom: '1px solid rgba(232, 232, 232, 0.05)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              toggleCart();
              setIsMobileMenuOpen(false);
            }}
            style={{
              marginTop: '16px',
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(232, 232, 232, 0.2)',
              color: '#E8E8E8',
              padding: '14px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Cart ({totalItems})
          </button>
          {!authLoading && (
            user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    display: 'block',
                    marginTop: '8px',
                    width: '100%',
                    textAlign: 'center',
                    background: 'transparent',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#8B5CF6',
                    padding: '14px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                >
                  My Account
                </Link>
                <button
                  onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                  style={{
                    marginTop: '8px',
                    width: '100%',
                    background: 'transparent',
                    border: '1px solid #1a1a1a',
                    color: '#888',
                    padding: '14px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '1rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/account/login"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  marginTop: '8px',
                  width: '100%',
                  textAlign: 'center',
                  background: 'transparent',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#8B5CF6',
                  padding: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              >
                Sign In
              </Link>
            )
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
