'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { getProduct } from '@/lib/products';

interface DownloadInfo {
  id: string;
  product_id: string;
  download_token: string;
  expires_at: string;
  downloaded_count: number;
  max_downloads: number;
}

interface OrderItemInfo {
  id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  downloads: DownloadInfo[];
}

interface OrderInfo {
  id: string;
  customer_email: string;
  customer_name: string | null;
  total_cents: number;
  status: string;
  created_at: string;
  items: OrderItemInfo[];
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut, session } = useAuth();

  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/account/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingOrders(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && session) {
      fetchOrders();
    }
  }, [user, session, fetchOrders]);

  const handleRegenerateDownload = async (orderId: string, productId: string) => {
    const key = `${orderId}-${productId}`;
    setRegenerating(key);
    try {
      const res = await fetch('/api/account/regenerate-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ orderId, productId }),
      });
      if (!res.ok) throw new Error('Failed to regenerate download');
      await fetchOrders();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRegenerating(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (authLoading) {
    return (
      <>
        <Navbar />
        <main style={{ background: '#000', minHeight: '100vh', paddingTop: 160, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', color: '#555', paddingTop: 100 }}>Loading...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main style={{ background: '#000', minHeight: '100vh', paddingTop: 140, paddingBottom: 80 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.6rem, 3.5vw, 2rem)',
                  fontWeight: 800,
                  color: '#E8E8E8',
                  letterSpacing: '-0.03em',
                  marginBottom: 4,
                }}
              >
                Your Account
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem',
                  color: '#666',
                }}
              >
                {user.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: '1px solid #1a1a1a',
                background: 'transparent',
                color: '#888',
                fontFamily: 'var(--font-body)',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.color = '#E8E8E8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1a1a1a';
                e.currentTarget.style.color = '#888';
              }}
            >
              Sign Out
            </button>
          </div>

          {/* Purchases */}
          <section style={{ marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#E8E8E8',
                marginBottom: 20,
                paddingBottom: 12,
                borderBottom: '1px solid #1a1a1a',
              }}
            >
              Your Purchases
            </h2>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', color: '#555', padding: '40px 0' }}>
                Loading your orders...
              </div>
            ) : error ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.85rem',
                }}
              >
                {error}
              </div>
            ) : orders.length === 0 ? (
              <div
                style={{
                  padding: 40,
                  borderRadius: 10,
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>🛒</div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem',
                    color: '#666',
                    marginBottom: 20,
                  }}
                >
                  No purchases yet
                </p>
                <Link
                  href="/store"
                  style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    borderRadius: 8,
                    background: '#8B5CF6',
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  Browse Store
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: 24,
                      borderRadius: 10,
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                    }}
                  >
                    {/* Order header */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16,
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.75rem',
                            color: '#555',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#E8E8E8',
                          }}
                        >
                          {formatCurrency(order.total_cents)}
                        </span>
                        <span
                          style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            background: order.status === 'completed'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                            color: order.status === 'completed' ? '#10B981' : '#F59E0B',
                            fontFamily: 'var(--font-body)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {order.items.map((item) => {
                        const product = getProduct(item.product_id);
                        const download = item.downloads?.[0];
                        const expired = download ? isExpired(download.expires_at) : false;
                        const maxedOut = download
                          ? download.downloaded_count >= download.max_downloads
                          : false;
                        const canDownload = download && !expired && !maxedOut;
                        const regKey = `${order.id}-${item.product_id}`;

                        return (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '12px 16px',
                              borderRadius: 8,
                              background: '#111',
                              border: '1px solid #1a1a1a',
                              flexWrap: 'wrap',
                              gap: 12,
                            }}
                          >
                            <div style={{ flex: 1, minWidth: 200 }}>
                              <div
                                style={{
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '0.88rem',
                                  fontWeight: 600,
                                  color: '#E8E8E8',
                                  marginBottom: 4,
                                }}
                              >
                                {product?.emoji || '📦'} {product?.name || item.product_id}
                              </div>
                              {download && (
                                <div
                                  style={{
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.75rem',
                                    color: '#555',
                                  }}
                                >
                                  Downloaded {download.downloaded_count}/{download.max_downloads} times
                                  {expired && (
                                    <span style={{ color: '#F59E0B', marginLeft: 8 }}>
                                      • Link expired
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                              {canDownload ? (
                                <a
                                  href={`/api/downloads/${order.id}/${item.product_id}?token=${download.download_token}`}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    background: '#8B5CF6',
                                    color: '#fff',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Download
                                </a>
                              ) : (
                                <button
                                  onClick={() => handleRegenerateDownload(order.id, item.product_id)}
                                  disabled={regenerating === regKey}
                                  style={{
                                    padding: '8px 16px',
                                    borderRadius: 6,
                                    background: 'transparent',
                                    border: '1px solid #8B5CF6',
                                    color: '#8B5CF6',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: regenerating === regKey ? 'not-allowed' : 'pointer',
                                    opacity: regenerating === regKey ? 0.5 : 1,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {regenerating === regKey ? 'Regenerating...' : 'New Download Link'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Browse more */}
          {orders.length > 0 && (
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/store"
                style={{
                  display: 'inline-block',
                  padding: '12px 28px',
                  borderRadius: 8,
                  border: '1px solid #1a1a1a',
                  background: 'transparent',
                  color: '#E8E8E8',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                }}
              >
                Browse More Products
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
