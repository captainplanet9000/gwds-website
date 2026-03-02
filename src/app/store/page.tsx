'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { products, categories, type ProductCategory } from '@/lib/products';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categoryColors: Record<string, string> = {
  templates: '#8B5CF6',
  trading: '#10B981',
  prompts: '#F59E0B',
  wallpapers: '#EC4899',
  nfts: '#6366F1',
  animations: '#EF4444',
};

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // default: featured first, then by category order
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  // GSAP scroll reveal
  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.product-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 60 },
          {
            opacity: 1, y: 0,
            stagger: 0.06,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%' }
          }
        );
      }
    };
    init().catch(console.error);
  }, [activeCategory, searchQuery]);

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 120 }}>
        {/* Header */}
        <section style={{ padding: '0 5vw 4vw', maxWidth: 1400, margin: '0 auto' }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#666', marginBottom: 16, fontFamily: 'var(--font-body)' }}
          >
            Store · {products.length} products
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: '#E8E8E8',
              marginBottom: 32,
            }}
          >
            Digital Products
          </motion.h1>

          {/* Search + Sort row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  background: '#111',
                  border: '1px solid #222',
                  borderRadius: 8,
                  color: '#E8E8E8',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#444'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '0.9rem' }}>⌕</span>
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                padding: '12px 16px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: 8,
                color: '#999',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #1a1a1a', paddingBottom: 16 }}>
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: activeCategory === 'all' ? '1px solid #E8E8E8' : '1px solid #222',
                background: activeCategory === 'all' ? '#E8E8E8' : 'transparent',
                color: activeCategory === 'all' ? '#000' : '#888',
                fontSize: '0.78rem',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              All ({products.length})
            </button>
            {categories.map(cat => {
              const count = products.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 6,
                    border: activeCategory === cat.id ? `1px solid ${cat.color}` : '1px solid #222',
                    background: activeCategory === cat.id ? cat.color : 'transparent',
                    color: activeCategory === cat.id ? '#fff' : '#888',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.02em',
                  }}
                >
                  {cat.emoji} {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Grid — gallery style */}
        <section style={{ padding: '0 5vw 8vw', maxWidth: 1400, margin: '0 auto' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: 8 }}>No products found</p>
              <p style={{ fontSize: '0.85rem' }}>Try a different search or category</p>
            </div>
          ) : (
            <div
              ref={gridRef}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 20,
                paddingTop: 32,
              }}
            >
              <AnimatePresence mode="popLayout">
                {sorted.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProductCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const catColor = categoryColors[product.category] || '#8B5CF6';

  // Generate a gradient based on category for visual variety
  const gradients: Record<string, string> = {
    templates: 'linear-gradient(135deg, #1a0a2e 0%, #0d1117 50%, #1a1a2e 100%)',
    trading: 'linear-gradient(135deg, #0a1a15 0%, #0d1117 50%, #0a2e1a 100%)',
    prompts: 'linear-gradient(135deg, #1a150a 0%, #0d1117 50%, #2e2a0a 100%)',
    wallpapers: 'linear-gradient(135deg, #1a0a1a 0%, #0d1117 50%, #2e0a2e 100%)',
    nfts: 'linear-gradient(135deg, #0a0a2e 0%, #0d1117 50%, #1a1a3e 100%)',
    animations: 'linear-gradient(135deg, #1a0a0a 0%, #0d1117 50%, #2e1a1a 100%)',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.5 }}
      className="product-card"
    >
      <Link href={`/store/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: '#0a0a0a',
            border: `1px solid ${hovered ? catColor + '40' : '#1a1a1a'}`,
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: hovered ? `0 20px 60px ${catColor}15, 0 8px 24px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.2)',
            cursor: 'pointer',
          }}
        >
          {/* Product visual area */}
          <div style={{
            height: 220,
            background: gradients[product.category] || gradients.templates,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Product image or emoji fallback */}
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top left',
                  transition: 'transform 0.4s ease',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            ) : (
              <span style={{
                fontSize: '4rem',
                filter: hovered ? 'none' : 'grayscale(0.3)',
                transition: 'all 0.4s ease',
                transform: hovered ? 'scale(1.15) rotate(-3deg)' : 'scale(1)',
              }}>
                {product.emoji}
              </span>
            )}

            {/* Badge */}
            {product.badge && (
              <div style={{
                position: 'absolute',
                top: 12,
                right: 12,
                padding: '4px 10px',
                borderRadius: 4,
                background: catColor,
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
              }}>
                {product.badge}
              </div>
            )}

            {/* Category tag */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              padding: '3px 8px',
              borderRadius: 4,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              color: catColor,
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-body)',
            }}>
              {product.category}
            </div>

            {/* Hover overlay line */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
              background: catColor,
              transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left',
              transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }} />
          </div>

          {/* Info */}
          <div style={{ padding: '20px 20px 24px' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#E8E8E8',
              marginBottom: 8,
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '0.78rem',
              color: '#777',
              lineHeight: 1.5,
              marginBottom: 16,
              fontFamily: 'var(--font-body)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as any,
              overflow: 'hidden',
            }}>
              {product.description}
            </p>

            {/* Price + features count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: product.price === 0 ? '#666' : '#E8E8E8',
                letterSpacing: '-0.02em',
              }}>
                {product.price === 0 ? 'Free' : `$${product.price}`}
              </span>
              <span style={{
                fontSize: '0.68rem',
                color: '#555',
                fontFamily: 'var(--font-body)',
              }}>
                {product.features.length} features
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
