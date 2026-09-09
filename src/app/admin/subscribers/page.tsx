'use client';
import { useState, useEffect } from 'react';

/* Retained in source history only; do not use the legacy promotional drafts.
const EMAIL_TEMPLATES = {
  'product-launch': {
    subject: '🚀 New Product Launch - Check It Out!',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: var(--admin-text); padding: 40px 20px;">
  <h1 style="color: var(--admin-accent); font-size: 32px; margin-bottom: 16px;">Big News! 🎉</h1>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 24px;">We just launched something incredible that we think you'll love.</p>
  <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="color: var(--admin-accent); font-size: 24px; margin-bottom: 12px;">Featured Product</h2>
    <p style="font-size: 16px; line-height: 1.6; color: #ccc;">An amazing description of your newest product goes here...</p>
  </div>
  <a href="https://gwds-website.vercel.app/store" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, var(--admin-accent), var(--admin-accent)); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Shop Now →</a>
  <p style="font-size: 14px; color: var(--admin-text-dim); margin-top: 40px;">Thanks for being part of our community!</p>
</div>`
  },
  'sale': {
    subject: '🔥 Flash Sale - Limited Time Only!',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: var(--admin-text); padding: 40px 20px;">
  <h1 style="color: var(--admin-warning); font-size: 32px; margin-bottom: 16px;">Flash Sale! 🔥</h1>
  <p style="font-size: 18px; line-height: 1.6; margin-bottom: 24px;">For the next 24 hours only, get massive discounts on select products.</p>
  <div style="background: linear-gradient(135deg, var(--admin-accent)20, var(--admin-accent)20); border: 1px solid var(--admin-accent)40; border-radius: 12px; padding: 32px; margin-bottom: 24px; text-align: center;">
    <h2 style="color: var(--admin-success); font-size: 48px; margin: 0; font-weight: 800;">25% OFF</h2>
    <p style="font-size: 18px; color: #ccc; margin-top: 8px;">Use code: <span style="background: var(--admin-accent); padding: 4px 12px; border-radius: 6px; font-family: monospace; font-weight: 700;">FLASH25</span></p>
  </div>
  <a href="https://gwds-website.vercel.app/store" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, var(--admin-accent), var(--admin-accent)); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Shop Sale →</a>
  <p style="font-size: 12px; color: var(--admin-text-dim); margin-top: 32px;">⏰ Sale ends in 24 hours. Don't miss out!</p>
</div>`
  },
  'newsletter': {
    subject: '📬 Your Monthly Newsletter',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: var(--admin-text); padding: 40px 20px;">
  <h1 style="color: #4ade9f; font-size: 28px; margin-bottom: 24px;">What's New at Cival Systems 📬</h1>
  
  <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
    <h3 style="color: var(--admin-accent); font-size: 18px; margin-bottom: 8px;">✨ This Month's Highlights</h3>
    <ul style="font-size: 15px; line-height: 1.8; color: #ccc;">
      <li>New products added to the store</li>
      <li>Customer success stories</li>
      <li>Upcoming events and announcements</li>
    </ul>
  </div>
  
  <div style="background: var(--admin-surface); border: 1px solid var(--admin-border); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <h3 style="color: var(--admin-success); font-size: 18px; margin-bottom: 8px;">🎯 Featured This Month</h3>
    <p style="font-size: 15px; line-height: 1.6; color: #ccc;">Spotlight on our most popular products and services...</p>
  </div>
  
  <a href="https://gwds-website.vercel.app/store" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, var(--admin-accent), var(--admin-accent)); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Browse Store →</a>
  
  <p style="font-size: 14px; color: var(--admin-text-dim); margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--admin-border);">Stay sharp,<br/>The Cival Systems Team</p>
</div>`
  },
  'update': {
    subject: '📣 Important Update from Cival Systems',
    content: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: var(--admin-text); padding: 40px 20px;">
  <h1 style="color: #4ade9f; font-size: 28px; margin-bottom: 16px;">Update from Cival Systems 📣</h1>
  <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">We wanted to share some important information with you...</p>
  
  <div style="background: var(--admin-surface); border-left: 4px solid var(--admin-accent); padding: 20px; margin-bottom: 24px;">
    <h3 style="color: var(--admin-accent); font-size: 18px; margin-bottom: 12px;">What's Changed</h3>
    <p style="font-size: 15px; line-height: 1.6; color: #ccc;">Details about your update, improvements, or announcements go here...</p>
  </div>
  
  <p style="font-size: 15px; line-height: 1.6; color: #ccc; margin-bottom: 24px;">If you have any questions, feel free to reach out to our support team.</p>
  
  <a href="https://gwds-website.vercel.app/contact" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, var(--admin-accent), var(--admin-accent)); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Contact Support →</a>
  
  <p style="font-size: 14px; color: var(--admin-text-dim); margin-top: 40px;">Thanks for your continued support!</p>
</div>`
  }
};
*/

const EMAIL_TEMPLATES = {
  'product-launch': {
    subject: 'Cival Core 2.0 is available',
    content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#020806;color:#e8fff5;padding:36px 24px"><h1 style="color:#4ade9f;font-size:30px">Cival Core 2.0</h1><p style="font-size:17px;line-height:1.65;color:#b5d6c8">A clean, documented paper-trading dashboard template with simulated orders, agent workspaces, and a production build you can inspect before purchase.</p><p style="font-size:14px;line-height:1.6;color:#91b5a5">Software source code only. No live execution, financial advice, signals, or promised returns.</p><a href="https://www.civalsystems.com/store/trading-dashboard-template" style="display:inline-block;padding:14px 22px;background:#4ade9f;color:#03110b;text-decoration:none;border-radius:999px;font-weight:800">View Cival Core 2.0</a></div>`,
  },
  'availability': {
    subject: 'Cival Systems availability update',
    content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#020806;color:#e8fff5;padding:36px 24px"><h1 style="color:#4ade9f;font-size:30px">Availability update</h1><p style="font-size:17px;line-height:1.65;color:#b5d6c8">Add the exact product or service availability change, effective date, affected customers, and any action required here.</p><a href="https://www.civalsystems.com/contact" style="display:inline-block;padding:14px 22px;background:#4ade9f;color:#03110b;text-decoration:none;border-radius:999px;font-weight:800">Contact support</a></div>`,
  },
  'newsletter': {
    subject: 'Cival Systems product notes',
    content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#020806;color:#e8fff5;padding:36px 24px"><h1 style="color:#4ade9f;font-size:30px">Product notes</h1><p style="font-size:17px;line-height:1.65;color:#b5d6c8">Add verified release notes, documentation updates, and product availability here. Remove every unused section before sending.</p><a href="https://www.civalsystems.com/store" style="display:inline-block;padding:14px 22px;background:#4ade9f;color:#03110b;text-decoration:none;border-radius:999px;font-weight:800">Browse the store</a></div>`,
  },
  'service-update': {
    subject: 'Important service update from Cival Systems',
    content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#020806;color:#e8fff5;padding:36px 24px"><h1 style="color:#4ade9f;font-size:30px">Service update</h1><p style="font-size:17px;line-height:1.65;color:#b5d6c8">State what changed, when it changed, which customers are affected, and whether any action is required. Include only confirmed information.</p><a href="https://www.civalsystems.com/contact" style="display:inline-block;padding:14px 22px;background:#4ade9f;color:#03110b;text-decoration:none;border-radius:999px;font-weight:800">Contact support</a></div>`,
  },
};

export default function SubscribersAdmin() {
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
    fetch('/api/admin/subscribers')
      .then(r => r.json())
      .then(d => {
        setSubscribers(d.subscribers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  const active = subscribers.filter(s => s.is_active);
  const inactive = subscribers.filter(s => !s.is_active);
  
  const growthData = Array.from({ length: 30 }, (_, i) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (29 - i));
    cutoff.setHours(23, 59, 59, 999);
    return {
      day: i + 1,
      count: subscribers.filter((subscriber) => new Date(subscriber.subscribed_at || subscriber.created_at || 0) <= cutoff).length,
    };
  });
  
  const growthRate = active.length > 0 ? ((active.length / (active.length + inactive.length)) * 100).toFixed(1) : '0';

  const filteredSubscribers = subscribers.filter(s =>
    !search || s.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderGrowthChart = (data: any[]) => {
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
            <stop offset="0%" stopColor="var(--admin-success)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--admin-success)" stopOpacity="0" />
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
            stroke="var(--admin-border)"
            strokeWidth="1"
          />
        ))}
        
        {/* Area */}
        <path d={areaD} fill="url(#growthGradient)" />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke="var(--admin-success)" strokeWidth="2.5" />
        
        {/* Points */}
        {points.filter((_, i) => i % 5 === 0).map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--admin-success)" />
            <circle cx={p.x} cy={p.y} r="8" fill="var(--admin-success)" fillOpacity="0.2" />
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
          color: 'var(--admin-text)'
        }}>Subscribers</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--admin-text-dim)' }}>
          Manage email subscribers and send broadcasts
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Subscribers', value: subscribers.length, color: 'var(--admin-accent)', icon: '📧' },
          { label: 'Active', value: active.length, color: 'var(--admin-success)', icon: '✓' },
          { label: 'Unsubscribed', value: inactive.length, color: 'var(--admin-danger)', icon: '✕' },
          { label: 'Growth Rate', value: `${growthRate}%`, color: 'var(--admin-warning)', icon: '📈' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--admin-surface)',
            border: '1px solid var(--admin-border)',
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
                <p style={{ fontSize: '0.72rem', color: 'var(--admin-text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</p>
                <span style={{ fontSize: '1.3rem', opacity: 0.5 }}>{s.icon}</span>
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Chart */}
      <div style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 12,
        padding: 24,
        marginBottom: 24
      }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: 'var(--admin-text)',
            marginBottom: 4
          }}>Subscriber Growth (Last 30 Days)</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--admin-text-dim)' }}>Daily subscriber count trend</p>
        </div>
        {renderGrowthChart(growthData)}
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
            background: showBroadcast ? 'var(--admin-border-strong)' : 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent))', 
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
              e.currentTarget.style.background = 'linear-gradient(135deg, var(--admin-accent), var(--admin-accent))';
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
          background: 'var(--admin-surface)', 
          border: '1px solid var(--admin-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <h2 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.1rem', 
            fontWeight: 700,
            color: 'var(--admin-text)',
            marginBottom: 20
          }}>Email Broadcast</h2>

          {/* Templates */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: 'var(--admin-text-dim)', 
              marginBottom: 10, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              fontWeight: 600 
            }}>Quick Templates</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { key: 'product-launch', label: '🚀 Product Launch', color: 'var(--admin-accent)' },
                { key: 'availability', label: 'Availability Update', color: 'var(--admin-warning)' },
                { key: 'newsletter', label: '📬 Newsletter', color: 'var(--admin-accent)' },
                { key: 'service-update', label: 'Service Update', color: 'var(--admin-success)' }
              ].map(template => (
                <button
                  key={template.key}
                  onClick={() => applyTemplate(template.key)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid var(--admin-border)',
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
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
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
              color: 'var(--admin-text-dim)', 
              marginBottom: 6, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              fontWeight: 600 
            }}>Subject Line</label>
            <input 
              value={bcSubject} 
              onChange={e => setBcSubject(e.target.value)} 
              placeholder="Verified product or service update"
              style={{ 
                width: '100%', 
                padding: '12px 14px', 
                background: 'var(--admin-surface-raised)', 
                border: '1px solid #222', 
                borderRadius: 8, 
                color: 'var(--admin-text)', 
                fontSize: '0.88rem', 
                outline: 'none', 
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }} 
              onFocus={e => e.target.style.borderColor = 'var(--admin-accent)'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.7rem', 
              color: 'var(--admin-text-dim)', 
              marginBottom: 6, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              fontWeight: 600 
            }}>Email Content (HTML)</label>
            <textarea 
              value={bcContent} 
              onChange={e => setBcContent(e.target.value)} 
              rows={12}
              placeholder='<h1>Verified update</h1><p>State exactly what changed and when.</p>'
              style={{ 
                width: '100%', 
                padding: '14px', 
                background: 'var(--admin-surface-raised)', 
                border: '1px solid #222', 
                borderRadius: 8, 
                color: 'var(--admin-text)', 
                fontSize: '0.8rem', 
                outline: 'none', 
                resize: 'vertical', 
                fontFamily: 'var(--font-mono, monospace)', 
                boxSizing: 'border-box',
                lineHeight: 1.5,
                transition: 'border-color 0.15s ease'
              }} 
              onFocus={e => e.target.style.borderColor = 'var(--admin-accent)'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
          </div>

          {/* Preview */}
          {showPreview && bcContent && (
            <div style={{ 
              marginBottom: 16, 
              padding: 20, 
              background: '#fff', 
              border: '2px solid var(--admin-accent)', 
              borderRadius: 8,
              maxHeight: 400,
              overflow: 'auto'
            }}>
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--admin-accent)', 
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
              background: bcResult.error ? '#1a0a0a' : 'var(--admin-success)10', 
              border: `1px solid ${bcResult.error ? 'var(--admin-danger)40' : 'var(--admin-success)30'}`, 
              fontSize: '0.85rem', 
              color: bcResult.error ? 'var(--admin-danger)' : 'var(--admin-success)',
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
                border: '1px solid var(--admin-border-strong)', 
                background: showPreview ? 'var(--admin-accent)10' : 'transparent', 
                color: showPreview ? 'var(--admin-accent)' : '#ccc', 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                cursor: bcContent ? 'pointer' : 'not-allowed',
                opacity: bcContent ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (bcContent && !showPreview) {
                  e.currentTarget.style.borderColor = 'var(--admin-accent)';
                  e.currentTarget.style.color = 'var(--admin-accent)';
                }
              }}
              onMouseLeave={e => {
                if (bcContent && !showPreview) {
                  e.currentTarget.style.borderColor = 'var(--admin-border-strong)';
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
                border: '1px solid var(--admin-warning)', 
                background: 'transparent', 
                color: 'var(--admin-warning)', 
                fontSize: '0.82rem', 
                fontWeight: 600, 
                cursor: (bcSubject && bcContent) ? 'pointer' : 'not-allowed',
                opacity: (bcSubject && bcContent) ? 1 : 0.5,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = 'var(--admin-warning)15';
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
                background: (bcSubject && bcContent) ? 'linear-gradient(135deg, var(--admin-success), #059669)' : 'var(--admin-border-strong)', 
                color: '#fff', 
                fontSize: '0.82rem', 
                fontWeight: 700, 
                cursor: (bcSubject && bcContent) ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--admin-success), var(--admin-success))';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }
              }}
              onMouseLeave={e => {
                if (bcSubject && bcContent) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, var(--admin-success), #059669)';
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
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
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
            background: 'var(--admin-surface-raised)',
            border: '1px solid var(--admin-border)',
            borderRadius: 8,
            color: 'var(--admin-text)',
            fontSize: '0.85rem',
            outline: 'none',
            transition: 'border-color 0.15s ease'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--admin-accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--admin-border)'}
        />
      </div>

      {/* Subscribers Table */}
      <div style={{
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 12,
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 12, alignItems: 'center' }}>
              <div style={{ 
                width: 24, 
                height: 24, 
                border: '3px solid var(--admin-border)', 
                borderTopColor: 'var(--admin-accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ color: 'var(--admin-text-dim)', fontSize: '0.9rem' }}>Loading subscribers...</span>
            </div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-dim)' }}>
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
                <tr style={{ borderBottom: '1px solid var(--admin-border)', background: 'var(--admin-surface)' }}>
                  {['Email', 'Source', 'Status', 'Subscribed'].map(h => (
                    <th key={h} style={{ 
                      padding: '16px', 
                      textAlign: 'left', 
                      fontSize: '0.7rem', 
                      color: 'var(--admin-text-dim)', 
                      fontWeight: 600, 
                      letterSpacing: '0.1em', 
                      textTransform: 'uppercase',
                      position: 'sticky',
                      top: 0,
                      background: 'var(--admin-surface)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((s: any) => (
                  <tr 
                    key={s.id} 
                    style={{ 
                      borderBottom: '1px solid var(--admin-surface-raised)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#0d0d0d'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px', fontSize: '0.88rem', color: 'var(--admin-text)', fontWeight: 500 }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: 'var(--admin-accent)15',
                        color: 'var(--admin-accent)',
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
                        background: s.is_active ? 'var(--admin-success)20' : 'var(--admin-text-dim)20', 
                        color: s.is_active ? 'var(--admin-success)' : 'var(--admin-text-dim)', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em'
                      }}>
                        {s.is_active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '0.82rem', color: 'var(--admin-text-dim)' }}>
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
