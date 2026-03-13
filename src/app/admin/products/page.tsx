'use client';
import { useState } from 'react';
import Link from 'next/link';
import { products } from '@/lib/products';

export default function AdminProducts() {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    !search || 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = products.reduce((s, p) => s + p.price, 0);
  const avgPrice = products.length > 0 ? totalValue / products.length : 0;
  const bundles = products.filter(p => p.isBundle).length;
  const agents = products.filter(p => (p as any).productType === 'agent').length;

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2rem', 
          fontWeight: 800, 
          marginBottom: 8,
          letterSpacing: '-0.03em',
          color: '#E8E8E8'
        }}>Products</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Product catalog and pricing
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Products', value: products.length, color: '#8B5CF6', icon: '📦' },
          { label: 'Catalog Value', value: `$${totalValue.toLocaleString()}`, color: '#10B981', icon: '💰' },
          { label: 'Avg Price', value: `$${avgPrice.toFixed(0)}`, color: '#F59E0B', icon: '📊' },
          { label: 'Bundles', value: `${bundles} bundles · ${agents} agents`, color: '#EC4899', icon: '🎁' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: 12,
            padding: 20,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 80,
              height: 80,
              background: `radial-gradient(circle at top right, ${s.color}15, transparent)`
            }}></div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <p style={{ fontSize: '0.72rem', color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16
      }}>
        <input
          type="text"
          placeholder="Search products by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            background: '#111',
            border: '1px solid #1a1a1a',
            borderRadius: 8,
            color: '#E8E8E8',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={e => e.target.style.borderColor = '#8B5CF6'}
          onBlur={e => e.target.style.borderColor = '#1a1a1a'}
        />
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(product => {
          const productType = (product as any).productType || 'product';
          const typeColors: any = {
            flagship: '#8B5CF6',
            agent: '#10B981',
            extension: '#F59E0B',
            bundle: '#EC4899',
            product: '#666'
          };
          
          return (
            <div 
              key={product.id}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 12,
                padding: 20,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: '2.5rem' }}>{product.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Link 
                      href={`/store/${product.id}`}
                      style={{ 
                        fontSize: '1rem', 
                        fontWeight: 700, 
                        color: '#E8E8E8',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-display)'
                      }}
                    >
                      {product.name}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: `${typeColors[productType]}15`,
                      color: typeColors[productType],
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {productType}
                    </span>
                    {product.badge && (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: '#10B98115',
                        color: '#10B981',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p style={{ 
                fontSize: '0.82rem', 
                color: '#888', 
                lineHeight: 1.5,
                marginBottom: 16,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {product.description}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: 16,
                borderTop: '1px solid #1a1a1a'
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  color: '#10B981',
                  letterSpacing: '-0.02em'
                }}>
                  ${product.price}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link
                    href={`/store/${product.id}`}
                    target="_blank"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 6,
                      background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #9D6EFF, #F768AA)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    View →
                  </Link>
                </div>
              </div>

              {product.stripePriceId && (
                <div style={{ 
                  marginTop: 12, 
                  fontSize: '0.7rem', 
                  color: '#555',
                  fontFamily: 'var(--font-mono, monospace)'
                }}>
                  Stripe: {product.stripePriceId}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
