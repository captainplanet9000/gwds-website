'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { products, categories, type Product } from '@/lib/products';

const categoryColors: Record<string, string> = {
  templates: '#8B5CF6', trading: '#10B981', prompts: '#F59E0B',
  wallpapers: '#EC4899', nfts: '#6366F1', animations: '#EF4444',
};

export default function AdminProducts() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchesCat = filter === 'all' || p.category === filter;
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalValue = products.reduce((s, p) => s + p.price, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#E8E8E8' }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 32px', borderBottom: '1px solid #1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <Link href="/admin" style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, textDecoration: 'none', color: '#E8E8E8' }}>
            GWDS Admin
          </Link>
          {['Dashboard', 'Products', 'Orders', 'Customers', 'Coupons', 'Subscribers', 'Messages'].map(item => (
            <Link
              key={item}
              href={item === 'Dashboard' ? '/admin' : `/admin/${item.toLowerCase()}`}
              style={{
                fontSize: '0.78rem',
                color: item === 'Products' ? '#E8E8E8' : '#888',
                textDecoration: 'none', fontFamily: 'var(--font-body)',
                fontWeight: item === 'Products' ? 700 : 500,
              }}
            >
              {item}
            </Link>
          ))}
        </div>
        <Link href="/" style={{ fontSize: '0.72rem', color: '#555', textDecoration: 'none' }}>← Back to site</Link>
      </nav>

      <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>
              Products
            </h1>
            <p style={{ fontSize: '0.78rem', color: '#555', fontFamily: 'var(--font-body)' }}>
              {products.length} products · Total catalog value: ${totalValue}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              padding: '10px 14px', background: '#111', border: '1px solid #222',
              borderRadius: 6, color: '#E8E8E8', fontSize: '0.8rem',
              fontFamily: 'var(--font-body)', outline: 'none', width: 250,
            }}
          />
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
              border: filter === 'all' ? '1px solid #E8E8E8' : '1px solid #222',
              background: filter === 'all' ? '#E8E8E8' : 'transparent',
              color: filter === 'all' ? '#000' : '#888', cursor: 'pointer',
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              style={{
                padding: '8px 16px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600,
                border: filter === cat.id ? `1px solid ${cat.color}` : '1px solid #222',
                background: filter === cat.id ? cat.color : 'transparent',
                color: filter === cat.id ? '#fff' : '#888', cursor: 'pointer',
              }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Product table */}
        <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Product', 'Category', 'Price', 'Badge', 'Features'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '0.65rem', color: '#555', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #111', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#111')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '1.3rem' }}>{product.emoji}</span>
                      <div>
                        <Link href={`/store/${product.id}`} style={{ textDecoration: 'none', color: '#E8E8E8', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                          {product.name}
                        </Link>
                        <p style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                          {product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: 4,
                      background: (categoryColors[product.category] || '#666') + '15',
                      color: categoryColors[product.category] || '#666',
                      fontSize: '0.65rem', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: product.price === 0 ? '#555' : '#E8E8E8' }}>
                    {product.price === 0 ? 'Free' : `$${product.price}`}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {product.badge ? (
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: '#8B5CF620', color: '#8B5CF6',
                        fontSize: '0.6rem', fontWeight: 700,
                        letterSpacing: '0.08em',
                      }}>
                        {product.badge}
                      </span>
                    ) : (
                      <span style={{ color: '#333', fontSize: '0.75rem' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.75rem', color: '#666' }}>
                    {product.features.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


