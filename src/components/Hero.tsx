'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Split text animation on mount
    if (headlineRef.current) {
      const text = headlineRef.current.textContent || '';
      const chars = text.split('');
      headlineRef.current.innerHTML = chars
        .map((char) => `<span style="display: inline-block; opacity: 0;">${char === ' ' ? '&nbsp;' : char}</span>`)
        .join('');
      
      const charElements = headlineRef.current.querySelectorAll('span');
      
      gsap.to(charElements, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.03,
        ease: 'power3.out',
        delay: 0.3,
      });
    }

    // Fade in subtitle and CTA
    gsap.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 1.2, ease: 'power3.out' }
    );

    // Scroll indicator animation
    gsap.to(scrollIndicatorRef.current, {
      y: 10,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, []);

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 5vw',
        position: 'relative',
        background: '#000',
      }}
    >
      {/* Main Content */}
      <div
        style={{
          maxWidth: '1400px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <h1
          ref={headlineRef}
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '10vw',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#E8E8E8',
            marginBottom: '3vw',
          }}
        >
          WE DESIGN UNUSUAL DIGITAL PRODUCTS
        </h1>

        <p
          ref={subtitleRef}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '1.5vw',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#A8A8A8',
            marginBottom: '4vw',
            maxWidth: '700px',
            margin: '0 auto 4vw',
          }}
        >
          AI templates, trading dashboards, animations, NFTs, and creative tools. 
          Built by makers, powered by technology.
        </p>

        <div ref={ctaRef} style={{ display: 'flex', gap: '2vw', justifyContent: 'center' }}>
          <Link
            href="/store"
            style={{
              display: 'inline-block',
              padding: '1.2vw 2.5vw',
              fontFamily: 'Syne, sans-serif',
              fontSize: '1vw',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              background: 'oklch(0.65 0.29 295)',
              color: '#000',
              border: '1px solid oklch(0.65 0.29 295)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'oklch(0.65 0.29 295)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'oklch(0.65 0.29 295)';
              e.currentTarget.style.color = '#000';
            }}
          >
            Browse Store
          </Link>

          <Link
            href="/about"
            style={{
              display: 'inline-block',
              padding: '1.2vw 2.5vw',
              fontFamily: 'Syne, sans-serif',
              fontSize: '1vw',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              border: '1px solid rgba(232, 232, 232, 0.2)',
              background: 'transparent',
              color: '#E8E8E8',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E8E8E8';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.borderColor = '#E8E8E8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#E8E8E8';
              e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
            }}
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        style={{
          position: 'absolute',
          bottom: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1vh',
          opacity: 0.5,
        }}
      >
        <span
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.8vw',
            fontWeight: 500,
            color: '#A8A8A8',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '40px',
            background: 'linear-gradient(to bottom, #A8A8A8, transparent)',
          }}
        />
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          h1 {
            font-size: 14vw !important;
            margin-bottom: 6vw !important;
          }
          p {
            font-size: 4vw !important;
            margin-bottom: 8vw !important;
          }
          a {
            padding: 3vw 6vw !important;
            font-size: 3.5vw !important;
          }
        }
      `}</style>
    </section>
  );
}
