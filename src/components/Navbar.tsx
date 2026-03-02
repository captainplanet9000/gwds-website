'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

const navLinks = [
  { href: '/store', label: 'Store' },
  { href: '/templates', label: 'Templates' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 40);
    setHidden(y > lastY && y > 120);
    setLastY(y);
  });

  return (
    <motion.nav
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        background: scrolled
          ? 'oklch(0.08 0 0 / 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled
          ? '1px solid oklch(0.65 0.29 295 / 0.15)'
          : '1px solid transparent',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        {/* Sine wave logomark */}
        <svg width="28" height="20" viewBox="0 0 56 40" fill="none">
          <path
            d="M2,20 C8,4 16,4 22,20 C28,36 36,36 42,20 C48,4 50,4 54,10"
            stroke="oklch(0.65 0.29 295)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2,28 C8,12 16,12 22,28 C28,44 36,44 42,28"
            stroke="oklch(0.75 0.15 195)"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </svg>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '1.1rem',
          letterSpacing: '0.08em',
          color: 'oklch(0.98 0 0)',
          textTransform: 'uppercase',
        }}>
          GWDS
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {navLinks.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'oklch(0.80 0 0)',
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              position: 'relative',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'oklch(0.98 0 0)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'oklch(0.80 0 0)';
            }}
          >
            {label}
          </Link>
        ))}

        {/* CTA */}
        <Link
          href="/store"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'oklch(0.98 0 0)',
            textDecoration: 'none',
            padding: '8px 20px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, oklch(0.65 0.29 295), oklch(0.55 0.25 250))',
            boxShadow: '0 0 20px oklch(0.65 0.29 295 / 0.3)',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 30px oklch(0.65 0.29 295 / 0.5)';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 20px oklch(0.65 0.29 295 / 0.3)';
            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
          }}
        >
          Shop
        </Link>
      </div>
    </motion.nav>
  );
}
