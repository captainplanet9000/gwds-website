'use client';

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { products, categories, type ProductCategory } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const { addItem } = useCart();
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

  useEffect(() => {
    productRefs.current.forEach((product, index) => {
      if (!product) return;

      gsap.fromTo(
        product,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: index * 0.05,
          ease: 'power3.out',
        }
      );
    });
  }, [activeCategory]);

  return (
    <>
      <Navbar />
      <main
        style={{
          paddingTop: '15vh',
          minHeight: '100vh',
          background: '#000',
          paddingBottom: '10vh',
        }}
      >
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 5vw' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '8vh' }}>
            <h1
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '8vw',
                fontWeight: 800,
                color: '#E8E8E8',
                marginBottom: '2vw',
              }}
            >
              Store
            </h1>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.3vw',
                color: '#A8A8A8',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Digital products, tools, and creative assets ready to use.
            </p>
          </div>

          {/* Category Filter */}
          <div
            style={{
              display: 'flex',
              gap: '1.5vw',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '8vh',
            }}
            className="category-filter"
          >
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '0.8vw 2vw',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9vw',
                fontWeight: 500,
                background: activeCategory === 'all' ? '#E8E8E8' : 'transparent',
                color: activeCategory === 'all' ? '#000' : '#A8A8A8',
                border: '1px solid rgba(232, 232, 232, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== 'all') {
                  e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== 'all') {
                  e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
                }
              }}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.8vw 2vw',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.9vw',
                  fontWeight: 500,
                  background: activeCategory === cat.id ? '#E8E8E8' : 'transparent',
                  color: activeCategory === cat.id ? '#000' : '#A8A8A8',
                  border: '1px solid rgba(232, 232, 232, 0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (activeCategory !== cat.id) {
                    e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCategory !== cat.id) {
                    e.currentTarget.style.borderColor = 'rgba(232, 232, 232, 0.2)';
                  }
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
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
            {filtered.map((product, index) => (
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
                    onClick={() =>
                      dispatch({
                        type: 'ADD_ITEM',
                        payload: { ...product, quantity: 1 },
                      })
                    }
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

          {filtered.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '1.2vw',
                color: '#A8A8A8',
                marginTop: '8vh',
              }}
            >
              No products in this category yet.
            </p>
          )}
        </div>
      </main>
      <Footer />

      <style jsx>{`
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: 1fr !important;
            gap: 6vw !important;
          }
          .category-filter button {
            padding: 2.5vw 5vw !important;
            font-size: 3vw !important;
          }
          h1 {
            font-size: 16vw !important;
          }
          h3 {
            font-size: 5vw !important;
          }
          p {
            font-size: 3.5vw !important;
          }
        }
      `}</style>
    </>
  );
}
