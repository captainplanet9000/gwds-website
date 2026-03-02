'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Work' },
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
        padding: '2vw 5vw',
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
          maxWidth: '1600px',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '1.5vw',
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
            gap: '3vw',
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
                fontSize: '1vw',
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
              padding: '0.8vw 1.5vw',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1vw',
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
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            color: '#E8E8E8',
            fontSize: '6vw',
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
            padding: '5vw',
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
                fontSize: '5vw',
                fontWeight: 500,
                color: '#A8A8A8',
                textDecoration: 'none',
                padding: '3vw 0',
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
              marginTop: '5vw',
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(232, 232, 232, 0.2)',
              color: '#E8E8E8',
              padding: '4vw',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '4vw',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cart ({totalItems})
          </button>
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
