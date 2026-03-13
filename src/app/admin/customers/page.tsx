'use client';
import { useState, useEffect } from 'react';

export default function AdminCustomers() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'spent' | 'orders' | 'recent'>('spent');

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
    fetch('/api/admin/customers')
      .then(r => r.json())
      .then(d => { 
        setCustomers(d.customers || []); 
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

  const filteredCustomers = customers.filter(c => 
    search === '' || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'spent') return (b.total_spent || 0) - (a.total_spent || 0);
    if (sortBy === 'orders') return (b.order_count || 0) - (a.order_count || 0);
    if (sortBy === 'recent') return new Date(b.last_order_at || 0).getTime() - new Date(a.last_order_at || 0).getTime();
    return 0;
  });

  const totalLTV = customers.reduce((s, c) => s + Number(c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.order_count || 0), 0);
  const avgLTV = customers.length > 0 ? totalLTV / customers.length : 0;
  const repeatCustomers = customers.filter(c => (c.order_count || 0) > 1).length;

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
        }}>Customers</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Customer relationships and lifetime value
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Customers', value: customers.length, color: '#EC4899', icon: '👥' },
          { label: 'Total LTV', value: `$${totalLTV.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, color: '#10B981', icon: '💰' },
          { label: 'Avg LTV', value: `$${avgLTV.toFixed(0)}`, color: '#8B5CF6', icon: '📊' },
          { label: 'Repeat Customers', value: `${repeatCustomers} (${customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0}%)`, color: '#F59E0B', icon: '🔄' },
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

      {/* Search & Sort */}
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
            placeholder="Search by name or email..."
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Sort by:</span>
          {[
            { key: 'spent', label: 'Total Spent' },
            { key: 'orders', label: 'Orders' },
            { key: 'recent', label: 'Recent' }
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key as any)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: sortBy === s.key ? '1px solid #8B5CF6' : '1px solid #1a1a1a',
                background: sortBy === s.key ? '#8B5CF610' : 'transparent',
                color: sortBy === s.key ? '#8B5CF6' : '#888',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (sortBy !== s.key) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#E8E8E8';
                }
              }}
              onMouseLeave={e => {
                if (sortBy !== s.key) {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
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
              <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading customers...</span>
            </div>
          </div>
        ) : sortedCustomers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>👥</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No customers found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>
              {search ? 'Try a different search term' : 'Your first customer will appear here'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
                  {['Customer', 'Orders', 'Total Spent', 'Avg Order', 'Last Order'].map(h => (
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
                {sortedCustomers.map((c: any) => {
                  const avgOrder = c.order_count > 0 ? Number(c.total_spent) / c.order_count : 0;
                  const isVIP = Number(c.total_spent) >= 500;
                  
                  return (
                    <tr 
                      key={c.id} 
                      style={{ 
                        borderBottom: '1px solid #111',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#fff'
                          }}>
                            {(c.name || c.email || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ 
                              fontSize: '0.88rem', 
                              color: '#E8E8E8', 
                              fontWeight: 500,
                              marginBottom: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}>
                              {c.name || 'Guest'}
                              {isVIP && (
                                <span style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                                  color: '#fff',
                                  fontWeight: 700,
                                  letterSpacing: '0.05em'
                                }}>
                                  VIP
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              {c.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 700, 
                          color: '#8B5CF6',
                          fontFamily: 'var(--font-display)'
                        }}>
                          {c.order_count}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: 700, 
                          color: '#10B981',
                          fontFamily: 'var(--font-display)'
                        }}>
                          ${Number(c.total_spent || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#888' }}>
                          ${avgOrder.toFixed(2)}
                        </span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '0.82rem', color: '#666' }}>
                        {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : '—'}
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
