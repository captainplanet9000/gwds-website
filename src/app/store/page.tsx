'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { products } from '@/lib/products';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const productTypeFilters = [
  { id: 'all', label: 'All Products', emoji: '🏪', color: '#E8E8E8' },
  { id: 'flagship', label: 'Dashboard', emoji: '📊', color: '#8B5CF6' },
  { id: 'extension', label: 'Extensions', emoji: '🧩', color: '#06B6D4' },
  { id: 'agent', label: 'Trading Agents', emoji: '🤖', color: '#10B981' },
  { id: 'bundle', label: 'Bundles', emoji: '📦', color: '#F59E0B' },
];

const typeColors: Record<string, string> = {
  flagship: '#8B5CF6',
  extension: '#06B6D4',
  agent: '#10B981',
  bundle: '#F59E0B',
};

const typeBadgeLabels: Record<string, string> = {
  flagship: 'FLAGSHIP',
  extension: 'EXTENSION',
  agent: 'AI AGENT',
  bundle: 'BUNDLE',
};

export default function StorePage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = products.filter(p => {
    const matchesType = activeFilter === 'all' || p.productType === activeFilter;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Default sort: flagship → extensions → agents → bundles
  const typeOrder: Record<string, number> = { flagship: 0, extension: 1, agent: 2, bundle: 3 };
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    const aOrder = typeOrder[a.productType || 'agent'] ?? 9;
    const bOrder = typeOrder[b.productType || 'agent'] ?? 9;
    if (aOrder !== bOrder) return aOrder - bOrder;
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  // Group products by type for section headers (only in default view)
  const showSections = activeFilter === 'all' && sortBy === 'default' && !searchQuery;

  useEffect(() => {
    const init = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.product-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 80%' } }
        );
      }
    };
    init().catch(console.error);
  }, [activeFilter, searchQuery]);

  // Section rendering with headers
  const renderGroupedProducts = () => {
    const groups = [
      { type: 'flagship', title: 'AI Trading Dashboard', subtitle: 'The foundation — deploy your own trading command center' },
      { type: 'extension', title: 'Dashboard Extensions', subtitle: 'Add-on modules that plug into your dashboard' },
      { type: 'agent', title: 'Trading Agents', subtitle: 'Autonomous strategies that trade while you sleep' },
      { type: 'bundle', title: 'Bundles', subtitle: 'Save big — get multiple products at a discount' },
    ];

    return groups.map(group => {
      const groupProducts = sorted.filter(p => p.productType === group.type);
      if (groupProducts.length === 0) return null;
      return (
        <div key={group.type} style={{ marginBottom: 56 }}>
          <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${typeColors[group.type]}15` }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: typeColors[group.type],
              marginBottom: 4,
              letterSpacing: '-0.02em',
            }}>
              {group.title}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666', fontFamily: 'var(--font-body)' }}>
              {group.subtitle}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: group.type === 'flagship'
              ? '1fr'  
              : 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {groupProducts.map((product, i) => (
              group.type === 'flagship'
                ? <FlagshipCard key={product.id} product={product} />
                : <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 120 }}>
        <section style={{ padding: '0 24px 32px', maxWidth: 1400, margin: '0 auto' }}>
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
            Store
          </motion.h1>

          {/* Search + Sort */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                style={{
                  width: '100%', padding: '12px 16px 12px 40px',
                  background: '#111', border: '1px solid #222', borderRadius: 8,
                  color: '#E8E8E8', fontSize: '0.85rem', fontFamily: 'var(--font-body)', outline: 'none',
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
                padding: '12px 16px', background: '#111', border: '1px solid #222', borderRadius: 8,
                color: '#999', fontSize: '0.8rem', fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none',
              }}
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Product Type Filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #1a1a1a', paddingBottom: 16 }}>
            {productTypeFilters.map(filter => {
              const count = filter.id === 'all' ? products.length : products.filter(p => p.productType === filter.id).length;
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    padding: '8px 20px', borderRadius: 6,
                    border: isActive ? `1px solid ${filter.color}` : '1px solid #222',
                    background: isActive ? (filter.id === 'all' ? '#E8E8E8' : filter.color) : 'transparent',
                    color: isActive ? (filter.id === 'all' ? '#000' : '#fff') : '#888',
                    fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                    cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.02em',
                  }}
                >
                  {filter.emoji} {filter.label} ({count})
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Grid */}
        <section ref={gridRef} style={{ padding: '0 24px 64px', maxWidth: 1400, margin: '0 auto', paddingTop: 32 }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: 8 }}>No products found</p>
              <p style={{ fontSize: '0.85rem' }}>Try a different search or filter</p>
            </div>
          ) : showSections ? (
            renderGroupedProducts()
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              <AnimatePresence mode="popLayout">
                {sorted.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div style={{
          maxWidth: 900, margin: '48px auto 0', padding: '16px 24px',
          background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 8, textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6, margin: 0 }}>
            All products are software source code and development templates sold as starting points for building trading systems. 
            They are not financial advice and do not guarantee trading performance or returns. 
            Trading involves substantial risk of loss including potential loss of all invested capital.{' '}
            <a href="/disclaimer" style={{ color: '#8B5CF6', textDecoration: 'none' }}>Read full disclaimer →</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ============ FLAGSHIP CARD — wide hero layout ============ */
function FlagshipCard({ product }: { product: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="product-card"
    >
      <Link href={`/store/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: '#0a0a0a',
            border: `1px solid ${hovered ? '#8B5CF640' : '#1a1a1a'}`,
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
            boxShadow: hovered ? '0 20px 60px rgba(139,92,246,0.1), 0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            minHeight: 320,
          }}
        >
          {/* Image */}
          <div style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #1a0a2e 0%, #0d1117 50%, #1a1a2e 100%)',
          }}>
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left',
                  transition: 'transform 0.4s ease',
                  transform: hovered ? 'scale(1.03)' : 'scale(1)',
                }}
              />
            )}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              padding: '6px 14px', borderRadius: 6,
              background: '#8B5CF6', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em',
            }}>
              ★ FLAGSHIP PRODUCT
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.6rem', fontWeight: 800, color: '#E8E8E8',
              marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '0.85rem', color: '#777', lineHeight: 1.6,
              marginBottom: 20, fontFamily: 'var(--font-body)',
            }}>
              {product.description.substring(0, 200)}...
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
              {['1 Agent Included', '44 Themes', '2,400+ Files', 'Hyperliquid Ready'].map(tag => (
                <span key={tag} style={{
                  padding: '4px 10px', borderRadius: 4,
                  background: '#8B5CF610', border: '1px solid #8B5CF620',
                  color: '#A78BFA', fontSize: '0.7rem', fontWeight: 600,
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2rem', fontWeight: 800, color: '#E8E8E8',
              }}>
                ${product.price}
              </span>
              <span style={{
                padding: '6px 16px', borderRadius: 6,
                background: '#8B5CF6', color: '#fff',
                fontSize: '0.78rem', fontWeight: 700,
                transition: 'transform 0.2s',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
              }}>
                View Details →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ============ STANDARD PRODUCT CARD ============ */
function ProductCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const color = typeColors[product.productType] || '#8B5CF6';
  const typeLabel = typeBadgeLabels[product.productType] || product.badge;

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
            border: `1px solid ${hovered ? color + '40' : '#1a1a1a'}`,
            borderRadius: 12,
            overflow: 'hidden',
            transition: 'all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: hovered ? `0 20px 60px ${color}15, 0 8px 24px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.2)',
          }}
        >
          {/* Image */}
          <div style={{
            height: 220,
            background: 'linear-gradient(135deg, #0a1a15 0%, #0d1117 50%, #0a2e1a 100%)',
            position: 'relative', overflow: 'hidden',
          }}>
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left',
                  transition: 'transform 0.4s ease',
                  transform: hovered ? 'scale(1.05)' : 'scale(1)',
                }}
              />
            ) : (
              <span style={{
                fontSize: '4rem', position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}>
                {product.emoji}
              </span>
            )}

            {/* Type badge (top-left) */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              padding: '4px 10px', borderRadius: 4,
              background: color + '20', backdropFilter: 'blur(8px)',
              border: `1px solid ${color}30`,
              color: color, fontSize: '0.6rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {typeLabel}
            </div>

            {/* Savings badge (top-right) for bundles */}
            {product.badge && product.isBundle && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                padding: '4px 10px', borderRadius: 4,
                background: '#F59E0B', color: '#000',
                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
              }}>
                {product.badge}
              </div>
            )}

            {/* Requires dashboard badge for extensions */}
            {product.requiresDashboard && product.productType !== 'flagship' && (
              <div style={{
                position: 'absolute', bottom: 12, left: 12,
                padding: '3px 8px', borderRadius: 4,
                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                color: '#8B5CF6', fontSize: '0.58rem', fontWeight: 600,
              }}>
                Requires Dashboard
              </div>
            )}

            {/* Bottom accent line */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
              background: color,
              transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
              transformOrigin: 'left', transition: 'transform 0.4s',
            }} />
          </div>

          {/* Info */}
          <div style={{ padding: '20px 20px 24px' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem', fontWeight: 700, color: '#E8E8E8',
              marginBottom: 8, lineHeight: 1.3, letterSpacing: '-0.01em',
            }}>
              {product.name}
            </h3>
            <p style={{
              fontSize: '0.78rem', color: '#777', lineHeight: 1.5,
              marginBottom: 16, fontFamily: 'var(--font-body)',
              display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
            }}>
              {product.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem', fontWeight: 800, color: '#E8E8E8',
              }}>
                ${product.price}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#555', fontFamily: 'var(--font-body)' }}>
                {product.features.length} features
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
