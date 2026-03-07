'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { products, getProduct } from '@/lib/products';

export default function CartDrawer() {
  const { state, dispatch, totalPrice, totalItems } = useCart();
  const { items, isOpen } = state;

  // Check if cart has plugins that require dashboard
  const hasPluginRequiringDashboard = items.some(item => item.product.requiresDashboard);
  const hasDashboard = items.some(item => item.product.id === 'trading-dashboard-template');
  const showDashboardWarning = hasPluginRequiringDashboard && !hasDashboard;
  
  const dashboardProduct = getProduct('trading-dashboard-template');

  const handleAddDashboard = () => {
    if (dashboardProduct && !hasDashboard) {
      dispatch({ type: 'ADD_ITEM', product: dashboardProduct });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'CLOSE_CART' })}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 420,
              maxWidth: '90vw',
              background: '#0a0a0a',
              borderLeft: '1px solid #1a1a1a',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#E8E8E8',
                letterSpacing: '-0.02em',
              }}>
                Cart ({totalItems})
              </h2>
              <button
                onClick={() => dispatch({ type: 'CLOSE_CART' })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>🛒</p>
                  <p style={{ fontSize: '0.9rem', marginBottom: 8 }}>Your cart is empty</p>
                  <Link
                    href="/store"
                    onClick={() => dispatch({ type: 'CLOSE_CART' })}
                    style={{ fontSize: '0.8rem', color: '#8B5CF6', textDecoration: 'none' }}
                  >
                    Browse products →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Dashboard warning */}
                  {showDashboardWarning && (
                    <div
                      style={{
                        backgroundColor: "#1a0a00",
                        border: "2px solid #F59E0B",
                        borderRadius: "8px",
                        padding: "14px 16px",
                        marginBottom: "16px",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: "#fff", fontSize: "14px", lineHeight: "1.5", marginBottom: "8px" }}>
                            Some items require the AI Trading Dashboard. Make sure you own it or add it to your cart.
                          </div>
                          {dashboardProduct && (
                            <button
                              onClick={handleAddDashboard}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "none",
                                background: "#F59E0B",
                                color: "#000",
                                fontSize: "13px",
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "var(--font-display)",
                              }}
                            >
                              Add Dashboard (${dashboardProduct.price})
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {items.map(item => (
                    <div
                      key={item.product.id}
                      style={{
                        display: 'flex',
                        gap: 16,
                        padding: 16,
                        borderRadius: 10,
                        background: '#111',
                        border: '1px solid #1a1a1a',
                      }}
                    >
                      {/* Emoji */}
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 8,
                        background: '#0a0a0a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        flexShrink: 0,
                      }}>
                        {item.product.emoji}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: '#E8E8E8',
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {item.product.name}
                        </h4>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#E8E8E8',
                          }}>
                            ${item.product.price}
                          </span>
                          <button
                            onClick={() => dispatch({ type: 'REMOVE_ITEM', productId: item.product.id })}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#555',
                              fontSize: '0.72rem',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontFamily: 'var(--font-body)',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div style={{
                padding: 24,
                borderTop: '1px solid #1a1a1a',
              }}>
                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#888', fontFamily: 'var(--font-body)' }}>Total</span>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: '#E8E8E8',
                  }}>
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => dispatch({ type: 'CLOSE_CART' })}
                  style={{ textDecoration: 'none' }}
                >
                  <button style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#8B5CF6',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}>
                    Checkout — ${totalPrice.toFixed(2)}
                  </button>
                </Link>

                <button
                  onClick={() => dispatch({ type: 'CLEAR_CART' })}
                  style={{
                    width: '100%',
                    marginTop: 8,
                    padding: '10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'transparent',
                    color: '#555',
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-body)',
                    cursor: 'pointer',
                  }}
                >
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
