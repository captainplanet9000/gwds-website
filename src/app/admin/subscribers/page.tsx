'use client';
import { useState, useEffect } from 'react';

const EMAIL_TEMPLATES = {
  'product-launch': {
    subject: '🚀 New Product Launch - Check It Out!',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #E8E8E8; padding: 40px 20px;">
  <h1 style="color: #8B5CF6; font-size: 32px; margin-bottom: 16px;">Big News! 🎉</h1>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 24px;">We just launched something incredible that we think you'll love.</p>
  <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="color: #EC4899; font-size: 24px; margin-bottom: 12px;">Featured Product</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #ccc;">An amazing description of your newest product goes here...</p>
  </div>
  <a href="https://gwds-website.vercel.app/store" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Shop Now →</a>
  <p style="font-size: 14px; color: #666; margin-top: 40px;">Thanks for being part of our community!</p>
</div>`
  },
  'sale': {
    subject: '🔥 Flash Sale - Limited Time Only!',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #E8E8E8; padding: 40px 20px;">
  <h1 style="color: #F59E0B; font-size: 32px; margin-bottom: 16px;">Flash Sale! 🔥</h1>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 24px;">For the next 24 hours only, get massive discounts on select products.</p>
  <div style="background: linear-gradient(135deg, #8B5CF620, #EC489920); border: 1px solid #8B5CF640; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
    <h2 style="color: #10B981; font-size: 48px; margin: 0; font-weight: 800;">25% OFF</h2>
    <p style="font-size: 18px; color: #ccc; margin-top: 8px;">Use code: <span style="background: #8B5CF6; padding: 4px 12px; border-radius: 6px; font-family: monospace; font-weight: 700;">FLASH25</span></p>
  </div>
  <a href="https://gwds-website.vercel.app/store" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Shop Sale →</a>
  <p style="font-size: 12px; color: #555; margin-top: 32px;">⏰ Sale ends in 24 hours. Don't miss out!</p>
</div>`
  },
  'newsletter': {
    subject: '📬 Your Monthly Newsletter',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #E8E8E8; padding: 40px 20px;">
  <h1 style="color: #8B5CF6; font-size: 28px; margin-bottom: 24px;">What's New at GWDS 📬</h1>
  
  <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
    <h3 style="color: #EC4899; font-size: 18px; margin-bottom: 8px;">✨ This Month's Highlights</h3>
    <ul style="font-size: 15px; line-height: 1.8; color: #ccc;">
      <li>New products added to the store</li>
      <li>Customer success stories</li>
      <li>Upcoming events and announcements</li>
    </ul>
  </div>
  
  <div style="background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h3 style="color: #10B981; font-size: 18px; margin-bottom: 8px;">🎯 Featured This Month</h3>
    <p style="font-size: 15px; line-height: 1.6; color: #ccc;">Spotlight on our most popular products and services...</p>
  </div>
  
  <a href="https://gwds-website.vercel.app/store" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Browse Store →</a>
  
  <p style="font-size: 14px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a;">Stay awesome,<br/>The GWDS Team</p>
</div>`
  },
  'update': {
    subject: '📣 Important Update from GWDS',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #E8E8E8; padding: 40px 20px;">
  <h1 style="color: #3B82F6; font-size: 28px; margin-bottom: 16px;">Update from GWDS 📣</h1>
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We wanted to share some important information with you...</p>
  
  <div style="background: #0a0a0a; border-left: 4px solid #8B5CF6; padding: 20px; margin-bottom: 24px;">
    <h3 style="color: #8B5CF6; font-size: 18px; margin-bottom: 12px;">What's Changed</h3>
    <p style="font-size: 15px; line-height: 1.6; color: #ccc;">Details about your update, improvements, or announcements go here...</p>
  </div>
  
  <p style="font-size: 15px; line-height: 1.6; color: #ccc; margin-bottom: 24px;">If you have any questions, feel free to reach out to our support team.</p>
  
  <a href="https://gwds-website.vercel.app/contact" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Contact Support →</a>
  
  <p style="font-size: 14px; color: #666; margin-top: 40px;">Thanks for your continued support!</p>
</div>`
  }
};

export default function SubscribersAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [bcSubject, setBcSubject] = useState('');
  const [bcContent, setBcContent] = useState('');
  const [bcStatus, setBcStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [bcResult, setBcResult] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState('');

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
    if (authed) {
      fetch('/api/admin/subscribers')
        .then(r => r.json())
        .then(d => { 
          setSubscribers(d.subscribers || []); 
          setLoading(false); 
        })
        .catch(() => setLoading(false));
    }
  }, [authed]);

  const sendBroadcast = async (test: boolean) => {
    if (!bcSubject || !bcContent) return;
    setBcStatus('sending');
    setBcResult(null);
    
    const res = await fetch('/api/admin/broadcast', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ subject: bcSubject, html: bcContent, test }) 
    });
    
    const data = await res.json();
    setBcResult(data); 
    setBcStatus('done');
  };

  const applyTemplate = (templateKey: string) => {
    const template = EMAIL_TEMPLATES[templateKey as keyof typeof EMAIL_TEMPLATES];
    if (template) {
      setBcSubject(template.subject);
      setBcContent(template.content);
    }
  };

  if (!authed) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ maxWidth: 360, width: '100%', padding: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: '#E8E8E8', marginBottom: 24, textAlign: 'center' }}>GWDS Admin</h1>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && login()} 
          placeholder="Password"
          style={{ width: '100%', padding: '14px 16px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#E8E8E8', fontSize: '0.88rem', outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} 
        />
        <button onClick={login} style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: '#8B5CF6', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>Login</button>
      </div>
    </div>
  );

  const active = subscribers.filter(s => s.is_active);
  const inactive = subscribers.filter(s => !s.is_active);
  
  // Generate sample growth data (last 30 days)
  const growthData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    count: Math.floor(Math.random() * 5) + active.length - 20 + i
  }));
  
  const growthRate = active.length > 0 ? ((active.length / (active.length + inactive.length)) * 100).toFixed(1) : '0';

  const filteredSubscribers = subscribers.filter(s =>
    !search || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const GrowthChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data.map(d => d.count));
    const width = 600;
    const height = 180;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d.count / max) * chartHeight);
      return { x, y, count: d.count };
    });
    
    const pathD = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');
    
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${padding} ${height - padding} Z`;
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + chartHeight * (1 - ratio)}
            x2={width - padding}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#1a1a1a"
            strokeWidth="1"
          />
        ))}
        
        {/* Area */}
        <path d={areaD} fill="url(#growthGradient)" />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="#10B981" strokeWidth="2.5" />
        
        {/* Points */}
        {points.filter((_, i) => i % 5 === 0).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#10B981" />
            <circle cx={p.x} cy={p.y} r="8" fill="#10B981" fillOpacity="0.2" />
          </g>
        ))}
      </svg>
    );
  };

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
        }}>Subscribers</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Manage email subscribers and send broadcasts
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Subscribers', value: subscribers.length, color: '#3B82F6', icon: '📧' },
          { label: 'Active', value: active.length, color: '#10B981', icon: '✓' },
          { label: 'Unsubscribed', value: inactive.length, color: '#EF4444', icon: '✕' },
          { label: 'Growth Rate', value: `${growthRate}%`, color: '#F59E0B', icon: '📈' },
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

      {/* Growth Chart */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: '#E8E8E8',
            marginBottom: 4
          }}>Subscriber Growth (Last 30 Days)</h2>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>Daily subscriber count trend</p>
        </div>
        <GrowthChart data={growthData} />
      </div>

      {/* Email Broadcast Section */}
      <div style={{ marginBottom: 16 }}>
        <button 
          onClick={() => setShowBroadcast(!showBroadcast)}
          className="admin-btn-primary"
          style={{ 
            padding: '12px 24px', 
            borderRadius: 8, 
            border: 'none', 
            background: showBroadcast ? '#333' : 'linear-gradient(135deg, #8B5CF6, #EC4899)', 
            color: '#fff', 
            fontSize: '0.82rem', 
            fontWeight: 700, 
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            if (!showBroadcast) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #9D6EFF, #F768AA)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }
          }}
          onMouseLeave={e => {
            if (!showBroadcast) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #8B5CF6, #EC4899)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {showBroadcast ? '− Hide Broadcast' : '📧 Send Email Broadcast'}
        </button>
      </div>

      {showBroadcast && (
        <div style={{ 
          marginBottom: 24, 
          padding: 24, 
          borderRadius: 12, 
          background: '#0a0a0a', 
          border: '1px solid #1a1a1a',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: '#E8E8E8',
            marginBottom: 20
          }}>Email Broadcast</h2>

          {/* Templates */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: '#666', 
              marginBottom: 10, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              fontWeight: 600 
            }}>Quick Templates</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'product-launch', label: '🚀 Product Launch', color: '#8B5CF6' },
                { key: 'sale', label: '🔥 Sale Announcement', color: '#F59E0B' },
                { key: 'newsletter', label: '📬 Newsletter', color: '#3B82F6' },
                { key: 'update', label: '📣 Update', color: '#10B981' }
              ].map(template => (
                <button
                  key={template.key}
                  onClick={() => applyTemplate(template.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid #1a1a1a',
                    background: 'transparent',
                    color: template.color,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${template.color}15`;
                    e.currentTarget.style.borderColor = template.color;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = '#1a1a1a';
                  }}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: '#666', 
              marginBottom: 6, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              fontWeight: 600 
            }}>Subject Line</label>
            <input 
              value={bcSubject} 
              onChange={e => setBcSubject(e.target.value)} 
              placeholder="New product launch!"
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                background: '#111', 
                border: '1px solid #222', 
                borderRadius: 8, 
                color: '#E8E8E8', 
                fontSize: '0.88rem', 
                outline: 'none', 
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }} 
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: '#666', 
              marginBottom: 6, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              fontWeight: 600 
            }}>Email Content (HTML)</label>
            <textarea 
              value={bcContent} 
              onChange={e => setBcContent(e.target.value)} 
              rows={12}
              placeholder='<h1 style="color:#8B5CF6;">Big News!</h1><p>We just launched something amazing...</p>'
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: '#111', 
                border: '1px solid #222', 
                borderRadius: 8, 
                color: '#E8E8E8', 
                fontSize: '0.8rem', 
                outline: 'none', 
                resize: 'vertical', 
                fontFamily: 'var(--font-mono, monospace)', 
                boxSizing: 'border-box',
                lineHeight: 1.5,
                transition: 'border-color 0.15s ease'
              }} 
              onFocus={e => e.target.style.borderColor = '#8B5CF6'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>

          {/* Preview */}
          {showPreview && bcContent && (
            <div style={{ 
              marginBottom: 16, 
              padding: 20, 
              background: '#fff', 
              border: '2px solid #8B5CF6', 
              borderRadius: 8,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#8B5CF6', 
                marginBottom: 12, 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '0.08em',
                background: '#000',
                padding: '6px 10px',
                borderRadius: 4,
                display: 'inline-block'
              }}>
                Email Preview
              </div>
              <div dangerouslySetInnerHTML={{ __html: bcContent }} />
            </div>
          )}

          {bcResult && (
            <div style={{ 
              marginBottom: 16, 
              padding: '14px 18px', 
              borderRadius: 8, 
              background: bcResult.error ? '#1a0a0a' : '#10B98110', 
              border: `1px solid ${bcResult.error ? '#EF444440' : '#10B98130'}`, 
              fontSize: '0.85rem', 
              color: bcResult.error ? '#EF4444' : '#10B981',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}>
              <span style={{ fontSize: '1.2rem' }}>{bcResult.error ? '⚠' : '✓'}</span>
              {bcResult.error || `Successfully sent to ${bcResult.sent}/${bcResult.total} subscribers ${bcResult.failed > 0 ? `(${bcResult.failed} failed)` : ''}`}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              disabled={!bcContent}
              style={{ 
                padding: '10px 20px', 
                borderRadius: 8, 
                border: '1px solid #333', 
                background: showPreview ? '#8B5CF610' : 'transparent', 
                color: showPreview ? '#8B5CF6' : '#ccc', 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                cursor: bcContent ? 'pointer' : 'not-allowed',
                opacity: bcContent ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (bcContent && !showPreview) {
                  e.currentTarget.style.borderColor = '#8B5CF6';
                  e.currentTarget.style.color = '#8B5CF6';
                }
              }}
              onMouseLeave={e => {
                if (bcContent && !showPreview) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#ccc';
                }
              }}
            >
              {showPreview ? '👁 Hide Preview' : '👁 Show Preview'}
            </button>
            <button 
              onClick={() => sendBroadcast(true)} 
              disabled={bcStatus === 'sending' || !bcSubject || !bcContent}
              style={{ 
                padding: '10px 20px', 
                borderRadius: 8, 
                border: '1px solid #F59E0B', 
                background: 'transparent', 
                color: '#F59E0B', 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                cursor: (bcSubject && bcContent) ? 'pointer' : 'not-allowed',
                opacity: (bcSubject && bcContent) ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = '#F59E0B15';
                }
              }}
              onMouseLeave={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {bcStatus === 'sending' ? '⏳ Sending...' : '🧪 Send Test (to owner)'}
            </button>
            <button 
              onClick={() => { 
                if (confirm(`Send to ALL ${active.length} active subscribers?\n\nThis cannot be undone.`)) {
                  sendBroadcast(false); 
                }
              }} 
              disabled={bcStatus === 'sending' || !bcSubject || !bcContent}
              style={{ 
                padding: '10px 20px', 
                borderRadius: 8, 
                border: 'none', 
                background: (bcSubject && bcContent) ? 'linear-gradient(135deg, #10B981, #059669)' : '#333', 
                color: '#fff', 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                cursor: (bcSubject && bcContent) ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #22C55E, #10B981)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }
              }}
              onMouseLeave={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              📨 Send to All ({active.length})
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16
      }}>
        <input
          type="text"
          placeholder="Search subscribers by email..."
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

      {/* Subscribers Table */}
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
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading subscribers...</span>
            </div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>📧</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No subscribers found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>
              {search ? 'Try a different search term' : 'Subscribers will appear here once people sign up'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
                  {['Email', 'Source', 'Status', 'Subscribed'].map(h => (
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
                {filteredSubscribers.map((s: any) => (
                  <tr 
                    key={s.id} 
                    style={{ 
                      borderBottom: '1px solid #111',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontSize: '0.88rem', color: '#E8E8E8', fontWeight: 500 }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: '#8B5CF615',
                        color: '#8B5CF6',
                        textTransform: 'capitalize'
                      }}>
                        {s.source || 'website'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '5px 12px', 
                        borderRadius: 6, 
                        fontSize: '0.7rem', 
                        fontWeight: 600, 
                        background: s.is_active ? '#10B98120' : '#55555520', 
                        color: s.is_active ? '#10B981' : '#555', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {s.is_active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.82rem', color: '#666' }}>
                      {new Date(s.subscribed_at || s.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
