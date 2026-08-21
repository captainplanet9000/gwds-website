'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { products, EDITION_INCLUDES, type Product } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { STORE_SALES_ENABLED } from '@/lib/store-config';

const visibleProducts = products.filter((p) => !p.legacy);

const CATS = [
  { id: 'all', label: 'All' },
  { id: 'flagship', label: 'Verified releases' },
] as const;

function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}

export default function StorePage() {
  const { items, addItem } = useCart();
  const [cat, setCat] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'featured' | 'asc' | 'desc' | 'name'>('featured');

  const coveredBy = (id: string): string | null => {
    for (const line of items) {
      const inc = EDITION_INCLUDES[line.product.id];
      if (inc && inc.includes(id)) return line.product.name;
    }
    return null;
  };

  const filtered = useMemo(() => {
    let list = visibleProducts.filter((p) => {
      const okCat = cat === 'all' || (cat === 'flagship'
        ? p.productType === 'flagship' || p.productType === 'bundle'
        : p.productType === cat);
      const q = query.trim().toLowerCase();
      const okQ = !q || (p.name + ' ' + p.description).toLowerCase().includes(q);
      return okCat && okQ;
    });
    const order: Record<string, number> = { flagship: 0, bundle: 1, agent: 2, extension: 3 };
    if (sort === 'asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else list = [...list].sort((a, b) => (order[a.productType] - order[b.productType]) || (b.price - a.price));
    return list;
  }, [cat, query, sort]);

  const count = (id: string) => {
    if (id === 'all') return visibleProducts.length;
    if (id === 'flagship') return visibleProducts.filter((product) => product.productType === 'flagship' || product.productType === 'bundle').length;
    return visibleProducts.filter((product) => product.productType === id).length;
  };

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade" style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 28px 96px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap', marginBottom: 36, paddingTop: 66 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12 }}>
              Store · verified source releases
            </div>
            <h1 style={{ fontSize: 'clamp(40px,5vw,62px)', letterSpacing: '-0.018em', lineHeight: 1.08, margin: 0 }}>The catalogue.</h1>
          </div>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '40ch', margin: 0 }}>
            Cival Core 2.0 is the current verified release. Retired prototypes and incomplete add-ons are not listed or available for purchase.
          </p>
        </div>

        {!STORE_SALES_ENABLED && (
          <div role="status" style={{ marginBottom: 28, padding: '18px 22px', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-900)', lineHeight: 1.6 }}>
            <strong>Release verification is in progress.</strong> Checkout stays closed until every archive, account login, and private download path passes the launch checks. You can review the catalogue now; no payment can be taken.
          </div>
        )}

        <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 1, background: 'var(--color-divider)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 28 }}>
          <div style={{ background: 'var(--color-neutral-100)', padding: '24px 26px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 11 }}>One verified release</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginBottom: 7, lineHeight: 1.25 }}>Cival Core 2.0 · $99</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>A clean, versioned source package with paper-only execution and a public demo.</div>
          </div>
          <div style={{ background: 'var(--color-neutral-100)', padding: '24px 26px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 11 }}>Safe by default</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginBottom: 7, lineHeight: 1.25 }}>Paper orders only</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>No exchange connector, wallet secret form, withdrawal flow, or live-order endpoint.</div>
          </div>
          <div style={{ background: 'var(--color-neutral-100)', padding: '24px 26px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 11 }}>Account-bound licenses</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginBottom: 7, lineHeight: 1.25 }}>Re-download securely</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>Purchases stay attached to your verified account, with short-lived links generated when you need them.</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', padding: '16px 0', borderTop: '1px solid var(--color-divider)', borderBottom: '1px solid var(--color-divider)', position: 'sticky', top: 66, background: 'var(--color-bg)', zIndex: 40 }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-600)" strokeWidth="2.75" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /><path d="m21 21-4.3-4.3" /></svg>
            <input className="input" type="search" placeholder="Search verified releases…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginRight: 'auto' }}>
            {CATS.map((c) => {
              const on = cat === c.id;
              return (
                <button key={c.id} data-cv-chip onClick={() => setCat(c.id)} style={{
                  cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                  padding: '9px 16px', borderRadius: 999,
                  border: `1px solid ${on ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  background: on ? 'var(--color-accent)' : 'transparent',
                  color: on ? 'var(--color-bg)' : 'var(--color-text)',
                }}>
                  {c.label} <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{count(c.id)}</span>
                </button>
              );
            })}
          </div>
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ width: 'auto', cursor: 'pointer' }}>
            <option value="featured">Featured</option>
            <option value="asc">Price: low to high</option>
            <option value="desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20, marginTop: 32 }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} covered={coveredBy(p.id)} onAdd={() => addItem(p)} />
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '80px 0', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 10px' }}>Nothing matches that.</h3>
            <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 20px' }}>Try a different word, or clear the filter.</p>
            <button onClick={() => { setQuery(''); setCat('all'); setSort('featured'); }} className="btn btn-secondary">Reset filters</button>
          </div>
        )}

        <p style={{ marginTop: 56, fontSize: 12.5, lineHeight: 1.6, color: 'var(--color-neutral-600)', maxWidth: '78ch' }}>
          All products are source code and development templates sold as starting points. They are not financial advice and do not
          guarantee performance. Trading involves substantial risk of loss, including loss of all capital. <Link href="/disclaimer">Read the full disclaimer</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}

function ProductCard({ product, covered, onAdd }: { product: Product; covered: string | null; onAdd: () => void }) {
  const tagClass = product.productType === 'flagship' || product.productType === 'bundle' ? 'tag-accent' : product.productType === 'extension' ? 'tag-accent-2' : 'tag-neutral';
  return (
    <motion.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', overflow: 'hidden' }}>
      <Link href={`/store/${product.id}`} style={{ display: 'block', position: 'relative', aspectRatio: '5/2', background: 'var(--color-neutral-200)', textDecoration: 'none' }}>
        {product.image && <img src={product.image} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />}
      </Link>
      <div style={{ padding: '24px 24px 26px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className={`tag ${tagClass}`}>{product.badge || product.productType}</span>
          {product.requiresDashboard && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Needs an edition</span>}
        </div>
        <Link href={`/store/${product.id}`} style={{ fontFamily: 'var(--font-heading)', fontSize: 21, letterSpacing: '-0.015em', textDecoration: 'none', color: 'var(--color-text)', lineHeight: 1.15 }}>
          {product.name}
        </Link>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)', margin: 0, flex: 1 }}>{product.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 8, paddingTop: 16, borderTop: '1px solid var(--color-divider)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>{money(product.price)}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onAdd} disabled={!!covered || !STORE_SALES_ENABLED} className="btn btn-secondary" style={{ fontSize: 13, height: 40, padding: '0 14px', opacity: covered || !STORE_SALES_ENABLED ? 0.5 : 1 }}>
              {covered ? `In ${covered.replace(' Edition', '')}` : STORE_SALES_ENABLED ? 'Add' : 'Verifying'}
            </button>
            <Link href={`/store/${product.id}`} className="btn btn-primary" style={{ fontSize: 13, height: 40, padding: '0 16px' }}>Details</Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
