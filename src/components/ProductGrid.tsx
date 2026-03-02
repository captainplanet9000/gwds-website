'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { products } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';

gsap.registerPlugin(ScrollTrigger);

export default function ProductGrid() {
  const { addItem } = useCart();
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    productRefs.current.forEach((product, index) => {
      if (!product) return;

      gsap.fromTo(
        product,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: product,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          delay: (index % 3) * 0.1,
        }
      );
    });
  }, []);

  const featuredProducts = products.slice(0, 6);

  return (
    <section
      style={{
        padding: '15vh 5vw',
        background: '#000',
      }}
    >
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ marginBottom: '8vh', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '6vw',
              fontWeight: 700,
              color: '#E8E8E8',
              marginBottom: '2vw',
            }}
          >
            Featured Products
          </h2>
          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '1.3vw',
              color: '#A8A8A8',
              maxWidth: '700px',
              margin: '0 auto',
            }}
          >
            Templates, tools, and digital assets ready to use in your projects.
          </p>
        </div>

        {/* Products Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '3vw',
          }}
          className="products-grid"
        >
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              ref={(el) => {
                productRefs.current[index] = el;
              }}
              style={{
                border: '1px solid rgba(232, 232, 232, 0.1)',
                background: '#050505',
                padding: '2vw',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.3)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Badge */}
              {product.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5vw',
                    right: '1.5vw',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.7vw',
                    fontWeight: 600,
                    color: '#000',
                    background: 'oklch(0.65 0.29 295)',
                    padding: '0.4vw 0.8vw',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {product.badge}
                </div>
              )}

              {/* Emoji/Image */}
              <div
                style={{
                  fontSize: '4vw',
                  marginBottom: '1.5vw',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '8vw',
                  background: 'rgba(232, 232, 232, 0.02)',
                }}
              >
                {product.emoji}
              </div>

              {/* Category */}
              <div
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.8vw',
                  fontWeight: 500,
                  color: '#A8A8A8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '1vw',
                }}
              >
                {product.category}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '1.5vw',
                  fontWeight: 600,
                  color: '#E8E8E8',
                  marginBottom: '1vw',
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.95vw',
                  lineHeight: 1.6,
                  color: '#A8A8A8',
                  marginBottom: '2vw',
                  minHeight: '4.5vw',
                }}
              >
                {product.description}
              </p>

              {/* Price & CTA */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '1.5vw',
                  borderTop: '1px solid rgba(232, 232, 232, 0.05)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontSize: '1.5vw',
                    fontWeight: 700,
                    color: '#E8E8E8',
                  }}
                >
                  ${product.price}
                </span>
                <button
                  onClick={() => addItem(product)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(232, 232, 232, 0.2)',
                    color: '#E8E8E8',
                    padding: '0.7vw 1.5vw',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '0.9vw',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
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
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div style={{ textAlign: 'center', marginTop: '8vh' }}>
          <Link
            href="/store"
            style={{
              display: 'inline-block',
              padding: '1.2vw 2.5vw',
              fontFamily: 'Syne, sans-serif',
              fontSize: '1vw',
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid rgba(232, 232, 232, 0.2)',
              background: 'transparent',
              color: '#E8E8E8',
              transition: 'all 0.3s ease',
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
            View All Products
          </Link>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr !important;
            gap: 6vw !important;
          }
          h2 {
            font-size: 12vw !important;
          }
          h3 {
            font-size: 5vw !important;
          }
          p {
            font-size: 3.5vw !important;
          }
        }
      `}</style>
    </section>
  );
}
