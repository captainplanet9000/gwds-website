'use client';
import { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => { 
    if (sessionStorage.getItem('gwds-admin') === 'true') setAuthed(true); 
  }, []);

  const login = () => {
    fetch('/api/admin/auth', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ password }) 
    })
    .then(r => r.json())
    .then(d => { 
      if (d.ok) { 
        setAuthed(true); 
        sessionStorage.setItem('gwds-admin', 'true'); 
      } else {
        alert('Invalid password'); 
      }
    });
  };

  useEffect(() => {
    if (!authed) return;
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(d => { 
        setOrders(d.orders || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, [authed]);

  if (!authed) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 24, textAlign: 'center' }}>GWDS Admin</h1>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} placeholder="Password"
          style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
        <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Login</button>
      </div>
    </div>
  );

  const filteredOrders = orders.filter(o => {
    if (filter === 'completed' && o.status !== 'completed') return false;
    if (filter === 'pending' && o.status === 'completed') return false;
    if (search && !o.customer_email?.toLowerCase().includes(search.toLowerCase()) && !o.id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const completed = filteredOrders.filter(o => o.status === 'completed');
  const pending = filteredOrders.filter(o => o.status !== 'completed');
  const totalRev = completed.reduce((s, o) => s + ((o.total_cents || 0) / 100), 0);
  const avgOrder = completed.length > 0 ? totalRev / completed.length : 0;

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
        }}>Orders</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Manage and track all customer orders
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Revenue', value: `$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#10B981', icon: '💰' },
          { label: 'Completed', value: completed.length, color: '#10B981', icon: '✓' },
          { label: 'Pending', value: pending.length, color: '#F59E0B', icon: '⏱' },
          { label: 'Avg Order Value', value: `$${avgOrder.toFixed(2)}`, color: '#8B5CF6', icon: '📊' },
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

      {/* Filters & Search */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search by email or order ID..."
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
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'completed', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: filter === f ? '1px solid #8B5CF6' : '1px solid #1a1a1a',
                background: filter === f ? '#8B5CF610' : 'transparent',
                color: filter === f ? '#8B5CF6' : '#888',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (filter !== f) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#E8E8E8';
                }
              }}
              onMouseLeave={e => {
                if (filter !== f) {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                border: '3px solid #1a1a1a', 
                borderTopColor: '#8B5CF6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading orders...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>📦</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No orders found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>
              {search ? 'Try a different search term' : 'Orders will appear here once customers start purchasing'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
                  {['Customer', 'Amount', 'Coupon', 'Status', 'Date', ''].map(h => (
                    <th key={h} style={{ 
                      padding: '16px', 
                      textAlign: 'left', 
                      fontSize: '0.7rem', 
                      color: '#666', 
                      fontWeight: 600, 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase',
                      position: 'sticky',
                      top: 0,
                      background: '#0a0a0a'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o: any) => {
                  const gwdsId = o.stripe_session_id?.startsWith('local-') ? o.stripe_session_id.replace('local-', '') : null;
                  const isExpanded = expandedRow === o.id;
                  
                  return (
                    <tr 
                      key={o.id} 
                      style={{ 
                        borderBottom: '1px solid #111',
                        background: isExpanded ? '#0f0f0f' : 'transparent',
                        transition: 'background 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setExpandedRow(isExpanded ? null : o.id)}
                      onMouseEnter={e => {
                        if (!isExpanded) e.currentTarget.style.background = '#0d0d0d';
                      }}
                      onMouseLeave={e => {
                        if (!isExpanded) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontSize: '0.88rem', color: '#E8E8E8', fontWeight: 500, marginBottom: 4 }}>
                          {o.customer_name || 'Guest'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                          {o.customer_email}
                        </div>
                        {gwdsId && (
                          <div style={{ fontSize: '0.7rem', color: '#555', fontFamily: 'var(--font-mono, monospace)', marginTop: 4 }}>
                            ID: {gwdsId}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: 700, 
                          color: '#10B981',
                          fontFamily: 'var(--font-display)',
                          marginBottom: 2
                        }}>
                          ${((o.total_cents || 0) / 100).toFixed(2)}
                        </div>
                        {o.discount_cents > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#F59E0B' }}>
                            -{((o.discount_cents || 0) / 100).toFixed(2)} discount
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {o.coupon_code ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: '#F59E0B15',
                            color: '#F59E0B',
                            fontFamily: 'var(--font-mono, monospace)'
                          }}>
                            {o.coupon_code}
                          </span>
                        ) : (
                          <span style={{ color: '#333' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          padding: '5px 12px', 
                          borderRadius: 6, 
                          fontSize: '0.72rem', 
                          fontWeight: 600,
                          background: o.status === 'completed' ? '#10B98115' : o.status === 'pending' ? '#F59E0B15' : '#EF444415',
                          color: o.status === 'completed' ? '#10B981' : o.status === 'pending' ? '#F59E0B' : '#EF4444',
                          textTransform: 'capitalize',
                          letterSpacing: '0.03em'
                        }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.82rem', color: '#666' }}>
                        {new Date(o.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <span style={{ 
                          fontSize: '1rem', 
                          color: '#555',
                          transition: 'transform 0.2s ease',
                          display: 'inline-block',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
                        }}>
                          ▼
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
