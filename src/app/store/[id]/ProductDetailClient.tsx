'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductVideo from '@/components/ProductVideo';
import RequiresDashboardBanner from '@/components/RequiresDashboardBanner';
import { useCart } from '@/contexts/CartContext';
import { EDITION_INCLUDES, type Product } from '@/lib/products';
import { STORE_SALES_ENABLED } from '@/lib/store-config';

function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const { items, dispatch } = useCart();
  const [added, setAdded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const imageCount = product.images?.length || 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight' && lightboxIndex < imageCount - 1) setLightboxIndex(lightboxIndex + 1);
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [lightboxIndex, product.images]);

  const coveredBy = (() => {
    for (const line of items) {
      const inc = EDITION_INCLUDES[line.product.id];
      if (inc && inc.includes(product.id)) return line.product.name;
    }
    return null;
  })();

  const addToCart = () => {
    if (!STORE_SALES_ENABLED) return;
    dispatch({ type: 'ADD_ITEM', product });
    dispatch({ type: 'OPEN_CART' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    if (!STORE_SALES_ENABLED) return;
    dispatch({ type: 'CLEAR_CART' });
    dispatch({ type: 'ADD_ITEM', product });
  };

  const tagClass = product.productType === 'flagship' || product.productType === 'bundle' ? 'tag-accent' : product.productType === 'extension' ? 'tag-accent-2' : 'tag-neutral';

  return (
    <div className="cival">
      <Navbar />
      <main className="cival-fade">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 28px 0', fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-neutral-600)', display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/store" style={{ color: 'var(--color-accent-700)', textDecoration: 'none' }}>Store</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
        </div>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 28px 0' }}>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,0.85fr)', gap: 48, alignItems: 'start' }}>
            <div style={{ position: 'relative', borderRadius: 'calc(var(--radius-lg) * 1.15)', overflow: 'hidden', aspectRatio: '16/10', background: 'var(--color-neutral-200)', boxShadow: 'var(--shadow-md)' }}>
              {product.image && (
                <button
                  type="button"
                  aria-label={`Open ${product.name} screenshot gallery`}
                  onClick={() => (product.images?.length || 0) > 0 && setLightboxIndex(0)}
                  style={{ all: 'unset', position: 'absolute', inset: 0, display: 'block', cursor: (product.images?.length || 0) > 0 ? 'zoom-in' : 'default' }}
                >
                  <img src={product.image} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                </button>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                <span className={`tag ${tagClass}`}>{product.badge || product.productType}</span>
                {product.requiresDashboard && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-neutral-600)' }}>Add-on · needs an edition</span>}
              </div>
              <h1 style={{ fontSize: 'clamp(31px,3.4vw,44px)', lineHeight: 1.1, letterSpacing: '-0.015em', margin: '0 0 16px' }}>{product.name}</h1>
              <p style={{ fontSize: 16.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', margin: '0 0 24px' }}>{product.description}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 22 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 38, fontWeight: 500, letterSpacing: '-0.02em' }}>{money(product.price)}</span>
                {product.wasPrice && <span style={{ fontSize: 14, color: 'var(--color-neutral-600)', textDecoration: 'line-through', fontFamily: 'var(--font-mono)' }}>{money(product.wasPrice)}</span>}
                <span style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>one-time product license</span>
              </div>

              {product.requiresDashboard && <RequiresDashboardBanner />}
              {product.isBundle && (
                <div style={{ background: 'var(--color-accent-2-100)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>✅</span>
                  <span style={{ color: 'var(--color-accent-2-800)', fontSize: 14, fontWeight: 600 }}>Includes the full platform — no additional purchase needed</span>
                </div>
              )}

              {!STORE_SALES_ENABLED ? (
                <div role="status" style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-900)', fontSize: 14, lineHeight: 1.55, marginBottom: 14 }}>
                  Release verification is in progress. Checkout remains closed and no payment can be taken.
                </div>
              ) : coveredBy ? (
                <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-2-100)', color: 'var(--color-accent-2-800)', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
                  Already included in your {coveredBy}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <button onClick={addToCart} className="btn btn-primary" style={{ height: 50, padding: '0 26px', fontSize: 15 }}>
                    {added ? '✓ Added to cart' : 'Add to cart'}
                  </button>
                  <Link href="/checkout" onClick={buyNow} className="btn btn-secondary" style={{ height: 50, padding: '0 22px', fontSize: 15 }}>
                    Buy now
                  </Link>
                </div>
              )}

              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, marginBottom: 26 }}>
                  View the live demo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
                </a>
              )}

              <div style={{ display: 'grid', gap: 2, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-divider)' }}>
                {['Verified release archive', 'Account-bound perpetual license', 'Short-lived private download links', 'One year of compatible updates where specified'].map((a) => (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', background: 'var(--color-neutral-100)', fontSize: 14 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-2-700)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M20 6 9 17l-5-5" /></svg>
                    {a}
                  </div>
                ))}
              </div>

              {product.techStack && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 20 }}>
                  {product.techStack.map((s: string) => (
                    <span key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '5px 12px', borderRadius: 999, border: '1px solid var(--color-divider)', color: 'var(--color-neutral-700)' }}>{s}</span>
                  ))}
                </div>
              )}

              <p style={{ marginTop: 20, fontSize: 12, lineHeight: 1.55, color: 'var(--color-neutral-600)' }}>
                You are purchasing software source code — not financial advice or guaranteed returns. Trading involves substantial risk of loss.{' '}
                <a href="/disclaimer">Full disclaimer →</a>
              </p>
            </div>
          </div>
        </section>

        {product.videoUrl && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
            <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 24px' }}>Product demo</h2>
            <ProductVideo videoUrl={product.videoUrl} productName={product.name} accent="var(--color-accent)" poster={product.images?.[0] || product.image} />
          </section>
        )}

        {product.images && product.images.length > 1 && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
            <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 24px' }}>Screenshots</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
              {product.images.map((img: string, i: number) => {
                const label = img.split('/').pop()?.replace('gw-shot-', '').replace('gw-card-', '').replace(/\.(png|jpg)$/, '').replace(/-/g, ' ') || '';
                return (
                  <button
                    key={img}
                    type="button"
                    aria-label={`Open screenshot ${i + 1} of ${product.images?.length}: ${label}`}
                    onClick={() => setLightboxIndex(i)}
                    style={{ all: 'unset', display: 'block', width: '100%', cursor: 'zoom-in' }}
                  >
                    <figure style={{ margin: 0 }}>
                      <div style={{ position: 'relative', aspectRatio: '16/10', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-neutral-200)', boxShadow: 'var(--shadow-sm)' }}>
                        <img src={img} alt={label} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                      </div>
                      <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 9, textAlign: 'left' }}>{label}</figcaption>
                    </figure>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.25fr)', gap: 56, alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 20px' }}>What&apos;s included</h2>
              <div style={{ display: 'grid', gap: 11 }}>
                {(product.features ?? []).map((f: string) => (
                  <div key={f} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', fontSize: 14.5, lineHeight: 1.5 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}><path d="M20 6 9 17l-5-5" /></svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 20px' }}>About this product</h2>
              {(product.longDescription || '').split('\n\n').map((p: string, i: number) => (
                <p key={i} style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--color-neutral-800)' }}>{p}</p>
              ))}
              <div style={{ marginTop: 24, padding: '22px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-accent-2-100)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, marginBottom: 8, color: 'var(--color-accent-2-900)' }}>Not included</div>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-accent-2-900)', margin: 0 }}>
                  API keys, exchange accounts, funded capital, or signals. You bring your keys, your capital, and your own risk limits. This is software, not advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 0' }}>
          <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>Running in under ten minutes</h2>
          <p style={{ fontSize: 15.5, color: 'var(--color-neutral-700)', margin: '0 0 28px' }}>Full documentation ships in the download.</p>
          <div data-cv-2col style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 1, background: 'var(--color-divider)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[
              { n: '01', t: 'Download & extract', d: 'Grab the zip from your download page and unpack it wherever you keep projects.' },
              { n: '02', t: 'Run QUICK-START', d: 'Double-click the script. It installs dependencies, writes your config, and opens the dashboard.' },
              { n: '03', t: 'Add your keys', d: 'The setup wizard walks through Hyperliquid, Supabase, and your AI provider.' },
              { n: '04', t: 'Go live', d: 'Create an agent, set risk limits, and let it trade. Or stay in demo mode as long as you like.' },
            ].map((s) => (
              <div key={s.n} style={{ background: 'var(--color-neutral-100)', padding: '28px 26px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-accent)', marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 19, marginBottom: 8 }}>{s.t}</div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--color-neutral-800)' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 800, margin: '80px auto 0', padding: '0 28px' }}>
          <div style={{ padding: '24px 28px', background: 'var(--color-accent-100)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, color: 'var(--color-accent-900)', marginBottom: 4 }}>Join the Cival Systems Discord</div>
              <div style={{ fontSize: 14, color: 'var(--color-accent-800)', lineHeight: 1.5 }}>Setup help, plugin sharing, strategy arguments at 3am.</div>
            </div>
            <a href="https://discord.gg/EZk6gTx57k" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Join Discord →</a>
          </div>
        </section>

        {related.length > 0 && (
          <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 96px' }}>
            <h2 style={{ fontSize: 'clamp(26px,2.6vw,34px)', letterSpacing: '-0.02em', margin: '0 0 24px' }}>Pairs well with</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
              {related.map((p) => (
                <Link key={p.id} href={`/store/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '22px 24px', borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', textDecoration: 'none', color: 'var(--color-text)' }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 999, background: 'var(--color-neutral-100)', display: 'grid', placeItems: 'center', fontSize: 20 }}>{p.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, lineHeight: 1.2 }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-neutral-700)', marginTop: 4 }}>{money(p.price)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      <AnimatePresence>
        {lightboxIndex !== null && product.images && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxIndex(null)}
            role="dialog" aria-modal="true" aria-label={`${product.name} screenshot ${lightboxIndex + 1} of ${product.images.length}`}
            style={{ position: 'fixed', inset: 0, zIndex: 20000, background: 'rgba(15,18,25,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
            <button aria-label="Close screenshot gallery" onClick={() => setLightboxIndex(null)} style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: '1.2rem', width: 44, height: 44, cursor: 'pointer' }}>✕</button>
            {lightboxIndex > 0 && (
              <button aria-label="Previous screenshot" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: '1.4rem', width: 48, height: 48, cursor: 'pointer' }}>‹</button>
            )}
            {lightboxIndex < product.images.length - 1 && (
              <button aria-label="Next screenshot" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }} style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontSize: '1.4rem', width: 48, height: 48, cursor: 'pointer' }}>›</button>
            )}
            <motion.img key={lightboxIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
              src={product.images[lightboxIndex]} alt={product.name} onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 80px rgba(0,0,0,0.6)' }} />
            <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: '#ccc', fontSize: '0.8rem' }}>{lightboxIndex + 1} / {product.images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
