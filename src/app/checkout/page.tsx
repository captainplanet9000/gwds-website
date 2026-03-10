'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const { state, dispatch, totalPrice, totalItems } = useCart();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPluginDisclaimer, setAgreedToPluginDisclaimer] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; discount_type: string; discount_value: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Check if cart has plugins that require dashboard
  const hasPluginRequiringDashboard = state.items.some(item => item.product.requiresDashboard);
  const hasDashboard = state.items.some(item => item.product.id === 'trading-dashboard-template');
  const showPluginWarning = hasPluginRequiringDashboard && !hasDashboard;

  const discountedTotal = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), total: totalPrice }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.coupon.code,
          discount: data.discount,
          discount_type: data.coupon.discount_type,
          discount_value: data.coupon.discount_value,
        });
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!email || !name) {
      setError('Please fill in all fields');
      return;
    }
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Service and Trading Disclaimer to proceed');
      return;
    }
    if (hasPluginRequiringDashboard && !agreedToPluginDisclaimer) {
      setError('You must acknowledge that plugin products require the AI Trading Dashboard');
      return;
    }
    if (state.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
          email,
          name,
          couponCode: appliedCoupon?.code || undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Server error (${res.status}) — please try again`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.free) {
        // Free order (100% coupon) — go straight to success
        dispatch({ type: 'CLEAR_CART' });
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else if (data.stripeUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.stripeUrl;
      } else if (data.orderId) {
        // Direct completion
        dispatch({ type: 'CLEAR_CART' });
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        setError(data.error || 'Checkout failed — please try again');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out — please try again');
      } else {
        setError('Network error — please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#111',
    border: '1px solid #222',
    borderRadius: 8,
    color: '#E8E8E8',
    fontSize: '0.88rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const canCheckout = agreedToTerms && (!hasPluginRequiringDashboard || agreedToPluginDisclaimer) && !loading;

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 120 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 64px' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 800,
            color: '#E8E8E8',
            marginBottom: 48,
            letterSpacing: '-0.03em',
          }}>
            Checkout
          </h1>

          {/* Plugin warning banner */}
          {showPluginWarning && (
            <div
              style={{
                backgroundColor: "#1a0a00",
                border: "2px solid #F59E0B",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "32px",
                fontFamily: "var(--font-body)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ fontSize: "24px", lineHeight: "1", flexShrink: 0 }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: "15px", lineHeight: "1.6", marginBottom: "8px" }}>
                    Your cart contains plugin products that require the AI Trading Dashboard. They cannot function independently.
                  </div>
                  <a
                    href="/store/trading-dashboard-template"
                    style={{
                      color: "#F59E0B",
                      textDecoration: "underline",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    View AI Trading Dashboard →
                  </a>
                </div>
              </div>
            </div>
          )}

          {state.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: 16 }}>Your cart is empty</p>
              <Link href="/store" style={{ color: '#8B5CF6', textDecoration: 'none', fontSize: '0.9rem' }}>
                ← Back to store
              </Link>
            </div>
          ) : (
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
              {/* Left — form */}
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#888',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 24,
                }}>
                  Your Information
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                      Full Name
                    </label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                    <p style={{ fontSize: '0.7rem', color: '#555', marginTop: 6, fontFamily: 'var(--font-body)' }}>
                      Download links will be sent to this email
                    </p>
                  </div>
                </div>

                {/* Coupon Code */}
                <div style={{ marginTop: 24, padding: '16px 20px', border: '1px solid #1a1a1a', borderRadius: 10, background: '#0a0a0a' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#666', marginBottom: 10, fontFamily: 'var(--font-body)', letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontWeight: 600 }}>
                    Coupon Code
                  </label>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#10B98110', border: '1px solid #10B98130', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1rem' }}>🎉</span>
                        <div>
                          <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.85rem', color: '#10B981', fontWeight: 700, letterSpacing: '0.05em' }}>
                            {appliedCoupon.code}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#10B981', marginLeft: 8 }}>
                            {appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}% off` : `$${appliedCoupon.discount_value} off`}
                          </span>
                        </div>
                      </div>
                      <button onClick={removeCoupon}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.78rem', padding: '4px 8px' }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={couponCode}
                        onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Enter code"
                        style={{ ...inputStyle, flex: 1, textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.08em' }}
                      />
                      <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                        style={{
                          padding: '12px 20px', borderRadius: 8, border: '1px solid #333',
                          background: couponCode.trim() ? '#1a1a1a' : 'transparent',
                          color: couponCode.trim() ? '#E8E8E8' : '#555',
                          fontSize: '0.82rem', fontWeight: 600, fontFamily: 'var(--font-body)',
                          cursor: couponCode.trim() ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}>
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {couponError && (
                    <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: 8, fontFamily: 'var(--font-body)' }}>
                      {couponError}
                    </p>
                  )}
                </div>

                {/* TOS Agreement Checkbox */}
                <div
                  style={{
                    marginTop: 24,
                    padding: '16px 20px',
                    border: '1px solid #1a1a1a',
                    borderRadius: 10,
                    background: '#0a0a0a',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={e => setAgreedToTerms(e.target.checked)}
                      style={{
                        width: 18,
                        height: 18,
                        marginTop: 2,
                        accentColor: '#8B5CF6',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: '#94A3B8',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      I agree to the{' '}
                      <Link href="/terms" style={{ color: '#8B5CF6', textDecoration: 'none' }}>
                        Terms of Service
                      </Link>{' '}
                      and acknowledge the{' '}
                      <Link href="/disclaimer" style={{ color: '#8B5CF6', textDecoration: 'none' }}>
                        Trading Disclaimer
                      </Link>
                      . I understand I am purchasing software source code and architecture, not financial advice or guaranteed returns.
                    </span>
                  </label>
                </div>

                {/* Plugin Dependency Checkbox — only show if cart has requiresDashboard items */}
                {hasPluginRequiringDashboard && (
                  <div
                    style={{
                      marginTop: 16,
                      padding: '16px 20px',
                      border: '2px solid #F59E0B',
                      borderRadius: 10,
                      background: 'rgba(245, 158, 11, 0.05)',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={agreedToPluginDisclaimer}
                        onChange={e => setAgreedToPluginDisclaimer(e.target.checked)}
                        style={{
                          width: 18,
                          height: 18,
                          marginTop: 2,
                          accentColor: '#F59E0B',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.82rem',
                          color: '#F59E0B',
                          lineHeight: 1.6,
                          fontFamily: 'var(--font-body)',
                          fontWeight: 600,
                        }}
                      >
                        I understand that plugin products require the AI Trading Dashboard and cannot function independently.
                      </span>
                    </label>
                  </div>
                )}

                {error && (
                  <div style={{
                    marginTop: 16,
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: '#1a0a0a',
                    border: '1px solid #EF444440',
                    color: '#EF4444',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-body)',
                  }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  style={{
                    marginTop: 32,
                    width: '100%',
                    padding: '18px 32px',
                    borderRadius: 8,
                    border: 'none',
                    background: !canCheckout ? '#333' : '#8B5CF6',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: !canCheckout ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: !canCheckout ? 0.5 : 1,
                  }}
                >
                  {loading ? 'Processing...' : discountedTotal === 0 ? 'Complete Order (Free)' : `Pay $${discountedTotal.toFixed(2)}`}
                </button>

                <p style={{ fontSize: '0.7rem', color: '#444', marginTop: 12, textAlign: 'center', fontFamily: 'var(--font-body)' }}>
                  Secure payment via Stripe. Your card details never touch our servers.
                </p>
              </div>

              {/* Right — order summary */}
              <div style={{
                padding: 24,
                borderRadius: 12,
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                position: 'sticky',
                top: 120,
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#888',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}>
                  Order Summary
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {state.items.map(item => (
                    <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>{item.product.emoji}</span>
                        <span style={{ fontSize: '0.82rem', color: '#ccc', fontFamily: 'var(--font-body)' }}>
                          {item.product.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: '#E8E8E8', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
                        ${item.product.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #1a1a1a', marginTop: 20, paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888', fontFamily: 'var(--font-body)' }}>Subtotal</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600, color: appliedCoupon ? '#666' : '#E8E8E8', textDecoration: appliedCoupon ? 'line-through' : 'none' }}>
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <span style={{ fontSize: '0.82rem', color: '#10B981', fontFamily: 'var(--font-body)' }}>
                        Discount ({appliedCoupon.code})
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: '#10B981' }}>
                        -${appliedCoupon.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: appliedCoupon ? 12 : 0, paddingTop: appliedCoupon ? 12 : 0, borderTop: appliedCoupon ? '1px solid #1a1a1a' : 'none' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888', fontFamily: 'var(--font-body)' }}>Total</span>
                    <span style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: discountedTotal === 0 ? '#10B981' : '#E8E8E8',
                    }}>
                      {discountedTotal === 0 ? 'FREE' : `$${discountedTotal.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
