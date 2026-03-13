'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem('gwds-admin');
    if (saved === 'true') setAuthed(true);
  }, []);

  const login = () => {
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).then(r => r.json()).then(d => {
      if (d.ok) { 
        setAuthed(true); 
        sessionStorage.setItem('gwds-admin', 'true'); 
      } else {
        alert('Invalid password');
      }
    });
  };

  useEffect(() => {
    if (authed) {
      fetch('/api/admin/stats')
        .then(r => r.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [authed]);

  if (!authed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000' }}>
        <div style={{ maxWidth: 400, width: '100%', padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
              borderRadius: 16, 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: 16
            }}>🌊</div>
            <h1 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.8rem', 
              fontWeight: 800, 
              color: '#E8E8E8', 
              marginBottom: 8,
              letterSpacing: '-0.02em' 
            }}>GWDS Admin</h1>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>Sign in to access the dashboard</p>
          </div>
          
          <div style={{ 
            background: '#0a0a0a', 
            border: '1px solid #1a1a1a', 
            borderRadius: 12, 
            padding: 24 
          }}>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && login()} 
              placeholder="Enter password"
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                background: '#111', 
                border: '1px solid #222', 
                borderRadius: 8, 
                color: '#E8E8E8', 
                fontSize: '0.9rem', 
                fontFamily: 'var(--font-body)', 
                outline: 'none', 
                marginBottom: 16, 
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }} 
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
            <button 
              onClick={login}
              style={{ 
                width: '100%', 
                padding: '14px', 
                borderRadius: 8, 
                border: 'none', 
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
                color: '#fff', 
                fontSize: '0.88rem', 
                fontWeight: 700, 
                fontFamily: 'var(--font-display)', 
                cursor: 'pointer', 
                letterSpacing: '0.03em',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #9D6EFF, #F768AA)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ 
            width: 24, 
            height: 24, 
            border: '3px solid #1a1a1a', 
            borderTopColor: '#8B5CF6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const StatCard = ({ label, value, change, color, icon }: any) => (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #1a1a1a',
      borderRadius: 12,
      padding: 20,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#333';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#1a1a1a';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 100,
        height: 100,
        background: `radial-gradient(circle at top right, ${color}15, transparent)`,
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#666', 
            letterSpacing: '0.08em', 
            textTransform: 'uppercase', 
            fontFamily: 'var(--font-body)', 
            fontWeight: 600 
          }}>{label}</p>
          {icon && <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>{icon}</span>}
        </div>
        
        <p style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2rem', 
          fontWeight: 800, 
          color: color,
          letterSpacing: '-0.02em',
          marginBottom: 8
        }}>{value}</p>
        
        {change !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ 
              fontSize: '0.75rem', 
              color: change > 0 ? '#10B981' : change < 0 ? '#EF4444' : '#666',
              fontWeight: 600
            }}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '—'} {Math.abs(change)}%
            </span>
            <span style={{ fontSize: '0.7rem', color: '#555' }}>vs yesterday</span>
          </div>
        )}
      </div>
    </div>
  );

  const RevenueChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data.map(d => d.value));
    const width = 600;
    const height = 220;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - (d.value / max) * chartHeight;
      return { x, y, value: d.value, label: d.label };
    });
    
    const pathD = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');
    
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines with Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <g key={ratio}>
            <line
              x1={padding}
              y1={padding + chartHeight * (1 - ratio)}
              x2={width - padding}
              y2={padding + chartHeight * (1 - ratio)}
              stroke="#1a1a1a"
              strokeWidth="1"
            />
            <text
              x={padding - 10}
              y={padding + chartHeight * (1 - ratio) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#666"
            >
              ${Math.round(max * ratio)}
            </text>
          </g>
        ))}
        
        {/* Area */}
        <path d={areaD} fill="url(#revenueGradient)" />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="3" />
        
        {/* Points - larger */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="6" fill="#8B5CF6" />
            <circle cx={p.x} cy={p.y} r="12" fill="#8B5CF6" fillOpacity="0.2" />
          </g>
        ))}
        
        {/* Labels */}
        {points.map((p, i) => (
          i % Math.ceil(points.length / 6) === 0 && (
            <text
              key={i}
              x={p.x}
              y={height - padding + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#666"
            >
              {p.label}
            </text>
          )
        ))}
      </svg>
    );
  };

  // Generate sample revenue chart data
  const revenueData = stats?.revenueByDay || Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    value: Math.random() * 500 + 100
  }));

  // Top products (mock data - would come from stats.top_products)
  const topProducts = stats?.top_products || [
    { name: 'ClawdBot Pro', revenue: 1250, count: 8 },
    { name: 'Agent Toolkit', revenue: 980, count: 12 },
    { name: 'AI Bundle', revenue: 750, count: 5 },
    { name: 'Voice Pack', revenue: 580, count: 15 },
    { name: 'Pro Extension', revenue: 420, count: 7 }
  ];

  const maxProductRevenue = Math.max(...topProducts.map(p => p.revenue));

  // Recent activity (mock data - would come from stats.recent_activity)
  const recentActivity = stats?.recent_activity || [
    { type: 'order', message: 'New order from John Doe', time: '2 mins ago', icon: '🛒' },
    { type: 'subscriber', message: 'New subscriber: jane@example.com', time: '15 mins ago', icon: '📧' },
    { type: 'message', message: 'Message from Sarah Smith', time: '1 hour ago', icon: '💬' },
    { type: 'order', message: 'New order from Mike Johnson', time: '2 hours ago', icon: '🛒' },
    { type: 'subscriber', message: 'New subscriber: bob@example.com', time: '3 hours ago', icon: '📧' }
  ];

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
        }}>Dashboard</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Overview of your store performance
        </p>
      </div>

      {/* Primary Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        <StatCard 
          label="Total Revenue" 
          value={`$${parseFloat(stats?.totalRevenue || '0').toLocaleString()}`}
          change={12.5}
          color="#10B981"
          icon="💰"
        />
        <StatCard 
          label="Orders" 
          value={stats?.totalOrders || '0'}
          change={8.2}
          color="#8B5CF6"
          icon="🛒"
        />
        <StatCard 
          label="Customers" 
          value={stats?.totalCustomers || '0'}
          change={5.7}
          color="#EC4899"
          icon="👥"
        />
        <StatCard 
          label="Conversion Rate" 
          value="3.2%"
          change={-1.2}
          color="#F59E0B"
          icon="📊"
        />
      </div>

      {/* Revenue Chart */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.1rem', 
              fontWeight: 700,
              color: '#E8E8E8',
              marginBottom: 4
            }}>Revenue (Last 30 Days)</h2>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Daily revenue trend</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 4 }}>Total Period</div>
            <div style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.4rem', 
              fontWeight: 800,
              color: '#10B981'
            }}>
              ${(revenueData.reduce((s: number, d: any) => s + d.value, 0)).toFixed(0)}
            </div>
          </div>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Top Products & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
        {/* Top Products */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: 12,
          padding: 24
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: '#E8E8E8',
            marginBottom: 16
          }}>Top Products</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {topProducts.map((product, i) => (
              <div key={i} style={{ 
                padding: '12px 0',
                borderBottom: i < topProducts.length - 1 ? '1px solid #111' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: '#E8E8E8', fontWeight: 600, marginBottom: 2 }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#666' }}>
                      {product.count} sold
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 800, 
                    color: '#10B981',
                    fontFamily: 'var(--font-display)'
                  }}>
                    ${product.revenue.toLocaleString()}
                  </div>
                </div>
                {/* Revenue bar */}
                <div style={{ 
                  width: '100%', 
                  height: 6, 
                  background: '#1a1a1a', 
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${(product.revenue / maxProductRevenue) * 100}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, #8B5CF6, #10B981)',
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: 12,
          padding: 24
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: '#E8E8E8',
            marginBottom: 16
          }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentActivity.map((activity, i) => (
              <div key={i} style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                background: '#111',
                borderRadius: 8,
                borderLeft: `3px solid ${
                  activity.type === 'order' ? '#10B981' :
                  activity.type === 'subscriber' ? '#3B82F6' :
                  '#F59E0B'
                }`
              }}>
                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{activity.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', color: '#E8E8E8', fontWeight: 500, marginBottom: 2 }}>
                    {activity.message}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="admin-stat-grid-3" style={{ marginBottom: 24 }}>
        <Link href="/admin/subscribers" style={{ textDecoration: 'none' }}>
          <StatCard 
            label="Newsletter Subscribers" 
            value={stats?.totalSubscribers || '0'}
            color="#3B82F6"
            icon="📧"
          />
        </Link>
        <Link href="/admin/messages" style={{ textDecoration: 'none' }}>
          <StatCard 
            label="New Messages" 
            value={stats?.newMessages || '0'}
            color={stats?.newMessages > 0 ? '#EF4444' : '#666'}
            icon="💬"
          />
        </Link>
        <Link href="/admin/coupons" style={{ textDecoration: 'none' }}>
          <StatCard 
            label="Active Coupons" 
            value={stats?.activeCoupons || '0'}
            color="#F59E0B"
            icon="🎟️"
          />
        </Link>
      </div>

      {/* Recent Orders */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: '#E8E8E8'
          }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ 
            fontSize: '0.8rem', 
            color: '#8B5CF6', 
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'color 0.15s ease'
          }}>
            View all →
          </Link>
        </div>
        
        {!stats?.recentOrders?.length ? (
          <div style={{ 
            padding: 40, 
            textAlign: 'center', 
            color: '#555',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.5 }}>📦</div>
            No orders yet
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                  {['Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ 
                      padding: '12px', 
                      textAlign: 'left', 
                      fontSize: '0.72rem', 
                      color: '#666', 
                      fontWeight: 600, 
                      letterSpacing: '0.08em', 
                      textTransform: 'uppercase', 
                      fontFamily: 'var(--font-body)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.slice(0, 8).map((order: any, i: number) => (
                  <tr key={i} style={{ 
                    borderBottom: '1px solid #111',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0f0f0f'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#E8E8E8', fontWeight: 500, marginBottom: 2 }}>
                        {order.customer_name || 'Guest'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {order.customer_email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 700, 
                        color: '#10B981',
                        fontFamily: 'var(--font-display)'
                      }}>
                        ${((order.total_cents || 0) / 100).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        padding: '4px 10px', 
                        borderRadius: 6, 
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        background: order.status === 'completed' ? '#10B98115' : '#F59E0B15',
                        color: order.status === 'completed' ? '#10B981' : '#F59E0B',
                        textTransform: 'capitalize',
                        letterSpacing: '0.03em'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: '#666' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="admin-link-grid">
        {[
          { href: 'https://dashboard.stripe.com', icon: '💳', title: 'Stripe', desc: 'Payments & refunds', color: '#635BFF' },
          { href: 'https://supabase.com/dashboard/project/eglvktbuuhlyjpnoukkm', icon: '🗄️', title: 'Supabase', desc: 'Database & storage', color: '#3ECF8E' },
          { href: 'https://vercel.com/civals-projects/gwds-website', icon: '▲', title: 'Vercel', desc: 'Deployments & logs', color: '#000' },
          { href: 'https://analytics.google.com', icon: '📊', title: 'Analytics', desc: 'Traffic & engagement', color: '#F9AB00' },
        ].map(link => (
          <a 
            key={link.title} 
            href={link.href} 
            target="_blank" 
            rel="noopener" 
            style={{ 
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: 12,
              padding: 20,
              textDecoration: 'none', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 14, 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#333';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1a1a1a';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: `${link.color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem'
            }}>
              {link.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E8E8E8', marginBottom: 2 }}>{link.title}</p>
              <p style={{ fontSize: '0.75rem', color: '#666' }}>{link.desc}</p>
            </div>
            <span style={{ fontSize: '1.2rem', color: '#333' }}>→</span>
          </a>
        ))}
      </div>
    </>
  );
}
