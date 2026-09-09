'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current || !imageRef.current) return;

    // Animate text on scroll
    gsap.fromTo(
      textRef.current,
      { opacity: 0, x: -100 },
      {
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Parallax effect on image
    gsap.to(imageRef.current, {
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '15vh 5vw',
        background: '#000',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8vw',
          alignItems: 'center',
        }}
        className="philosophy-grid"
      >
        {/* Text Content */}
        <div ref={textRef}>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '4vw',
              fontWeight: 700,
              lineHeight: 1.2,
              color: '#E8E8E8',
              marginBottom: '3vw',
            }}
          >
            When everything is the same,{' '}
            <span style={{ color: 'oklch(0.65 0.29 295)' }}>different</span> is the greatest of
            opportunities.
          </h2>

          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.3vw',
              lineHeight: 1.8,
              color: '#A8A8A8',
              marginBottom: '2vw',
            }}
          >
            We don't follow templates. We don't chase trends. We build things that feel fresh,
            work flawlessly, and push boundaries.
          </p>

          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.3vw',
              lineHeight: 1.8,
              color: '#A8A8A8',
              marginBottom: '2vw',
            }}
          >
            Every product is an experiment. Every tool is battle-tested. Everything we ship is
            designed to make you more capable.
          </p>

          <div
            style={{
              width: '10vw',
              height: '1px',
              background: 'oklch(0.65 0.29 295)',
              marginTop: '4vw',
            }}
          />
        </div>

        {/* Visual Element (Placeholder for future image/graphic) */}
        <div
          ref={imageRef}
          style={{
            aspectRatio: '1 / 1',
            background: 'linear-gradient(135deg, oklch(0.65 0.29 295 / 0.1), transparent)',
            border: '1px solid rgba(232, 232, 232, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6vw',
          }}
        >
          🌊
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .philosophy-grid {
            grid-template-columns: 1fr !important;
            gap: 8vh !important;
          }
          h2 {
            font-size: 8vw !important;
          }
          p {
            font-size: 4vw !important;
          }
        }
      `}</style>
    </section>
  );
}
