'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { getProduct, EDITION_INCLUDES } from '@/lib/products';

function money(n: number) {
  return '$' + n.toLocaleString('en-US');
}

export default function CartDrawer() {
  const { state, dispatch, totalItems, totalPrice } = useCart();
  const { items, isOpen } = state;

  // Informational only — every line is still charged and downloadable at full
  // price. This just nudges the shopper away from buying the same agent twice.
  const coveredBy = (id: string): string | null => {
    for (const line of items) {
      const inc = EDITION_INCLUDES[line.product.id];
      if (inc && inc.includes(id) && line.product.id !== id) return line.product.name;
    }
    return null;
  };

  const hasPluginRequiringDashboard = items.some(item => item.product.requiresDashboard);
  const hasDashboard = items.some(item => item.product.id === 'trading-dashboard-template');
  const showDashboardWarning = hasPluginRequiringDashboard && !hasDashboard;
  const dashboardProduct = getProduct('trading-dashboard-template');

  const handleAddDashboard = () => {
    if (dashboardProduct && !hasDashboard) dispatch({ type: 'ADD_ITEM', product: dashboardProduct });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,18,25,0.6)', backdropFilter: 'blur(4px)', zIndex: 999 }} />

          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="cival"
            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, maxWidth: '90vw', background: 'var(--color-bg)', borderLeft: '1px solid var(--color-divider)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 24, borderBottom: '1px solid var(--color-divider)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', margin: 0 }}>Your cart ({totalItems})</h2>
              <button onClick={() => dispatch({ type: 'CLOSE_CART' })} style={{ background: 'none', border: 'none', color: 'var(--color-neutral-600)', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {items.length === 0 ? (
                <div style={{ padding: '64px 20px', borderRadius: 'calc(var(--radius-lg) * 1.15)', background: 'var(--color-surface)', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px' }}>Nothing in here yet.</h3>
                  <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 22px', fontSize: 14 }}>Start with the dashboard — every agent plugs into it.</p>
                  <Link href="/store" onClick={() => dispatch({ type: 'CLOSE_CART' })} className="btn btn-primary">Browse the store</Link>
                </div>
              ) : (
                <>
                  {showDashboardWarning && (
                    <div style={{ background: 'var(--color-accent-2-100)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 16 }}>
                      <div style={{ color: 'var(--color-accent-2-900)', fontSize: 14, lineHeight: 1.5, marginBottom: 8 }}>
                        Some items require Core Edition. Make sure you own it or add it to your cart.
                      </div>
                      {dashboardProduct && (
                        <button onClick={handleAddDashboard} className="btn btn-primary" style={{ height: 34, padding: '0 14px', fontSize: 13 }}>
                          Add Core Edition ({money(dashboardProduct.price)})
                        </button>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid var(--color-divider)' }}>
                    {items.map((item) => {
                      const covered = coveredBy(item.product.id);
                      return (
                        <div key={item.product.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '18px 0', borderBottom: '1px solid var(--color-divider)' }}>
                          <div style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 99, background: 'var(--color-surface)', display: 'grid', placeItems: 'center', fontSize: '1.3rem' }}>
                            {item.product.emoji}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16, lineHeight: 1.2 }}>{item.product.name}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: covered ? 'var(--color-accent-2-700)' : 'var(--color-neutral-600)', marginTop: 4 }}>
                              {covered ? `Included in ${covered}` : item.product.badge || item.product.productType}
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
                            {money(item.product.price)}
                          </div>
                          <button onClick={() => dispatch({ type: 'REMOVE_ITEM', productId: item.product.id })} className="btn btn-icon btn-ghost" aria-label="Remove">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div style={{ padding: 24, borderTop: '1px solid var(--color-divider)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Total</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500 }}>{money(totalPrice)}</span>
                </div>
                <Link href="/checkout" onClick={() => dispatch({ type: 'CLOSE_CART' })} className="btn btn-primary btn-block" style={{ height: 48, fontSize: 15 }}>
                  Checkout
                </Link>
                <button onClick={() => dispatch({ type: 'CLEAR_CART' })} className="btn btn-ghost btn-block" style={{ marginTop: 8, fontSize: 13, height: 36 }}>
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
