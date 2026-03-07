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

  // Check if cart has plugins that require dashboard
  const hasPluginRequiringDashboard = state.items.some(item => item.product.requiresDashboard);
  const hasDashboard = state.items.some(item => item.product.id === 'trading-dashboard-template');
  const showPluginWarning = hasPluginRequiringDashboard && !hasDashboard;

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

      if (data.stripeUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.stripeUrl;
      } else if (data.orderId) {
        // Free order or direct completion
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
                  {loading ? 'Processing...' : `Pay $${totalPrice.toFixed(2)}`}
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
