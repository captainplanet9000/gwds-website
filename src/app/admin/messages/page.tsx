'use client';
import { useState, useEffect } from 'react';

export default function MessagesAdmin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const fetchContacts = () => { 
    setLoading(true);
    fetch('/api/admin/contacts')
      .then(r => r.json())
      .then(d => { 
        setContacts(d.contacts || []); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { if (authed) fetchContacts(); }, [authed]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/contacts', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id, status }) 
    });
    fetchContacts();
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

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    new: { bg: '#EF444420', text: '#EF4444', dot: '#EF4444' },
    read: { bg: '#F59E0B20', text: '#F59E0B', dot: '#F59E0B' },
    replied: { bg: '#10B98120', text: '#10B981', dot: '#10B981' },
    archived: { bg: '#55555520', text: '#555', dot: '#555' },
  };

  const filteredContacts = contacts.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && 
        !c.name?.toLowerCase().includes(search.toLowerCase()) && 
        !c.email?.toLowerCase().includes(search.toLowerCase()) &&
        !c.subject?.toLowerCase().includes(search.toLowerCase()) &&
        !c.message?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Group messages by sender email for thread view
  const groupedContacts = filteredContacts.reduce((acc: any, c: any) => {
    if (!acc[c.email]) acc[c.email] = [];
    acc[c.email].push(c);
    return acc;
  }, {});

  const threads = Object.values(groupedContacts).map((messages: any) => ({
    email: messages[0].email,
    name: messages[0].name,
    count: messages.length,
    latest: messages.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0],
    messages: messages.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  })).sort((a, b) => 
    new Date(b.latest.created_at).getTime() - new Date(a.latest.created_at).getTime()
  );

  const newMessages = contacts.filter(c => c.status === 'new').length;
  const repliedMessages = contacts.filter(c => c.status === 'replied').length;
  
  // Calculate avg response time (mock - would need actual reply timestamps)
  const avgResponseTime = '2h 15m';

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
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
        }}>Messages</h1>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Customer support and contact submissions
        </p>
      </div>

      {/* Stats */}
      <div className="admin-stat-grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Messages', value: contacts.length, color: '#8B5CF6', icon: '💬' },
          { label: 'New (Unread)', value: newMessages, color: '#EF4444', icon: '🔴' },
          { label: 'Replied', value: repliedMessages, color: '#10B981', icon: '✓' },
          { label: 'Avg Response Time', value: avgResponseTime, color: '#F59E0B', icon: '⏱' },
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

      {/* Filter Tabs & Search */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Filter:</span>
          {[
            { key: 'all', label: 'All', count: contacts.length },
            { key: 'new', label: 'New', count: newMessages },
            { key: 'read', label: 'Read', count: contacts.filter(c => c.status === 'read').length },
            { key: 'replied', label: 'Replied', count: repliedMessages },
            { key: 'archived', label: 'Archived', count: contacts.filter(c => c.status === 'archived').length }
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '10px 18px',
                borderRadius: 8,
                border: filter === f.key ? '1px solid #8B5CF6' : '1px solid #1a1a1a',
                background: filter === f.key ? '#8B5CF610' : 'transparent',
                color: filter === f.key ? '#8B5CF6' : '#888',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onMouseEnter={e => {
                if (filter !== f.key) {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.color = '#E8E8E8';
                }
              }}
              onMouseLeave={e => {
                if (filter !== f.key) {
                  e.currentTarget.style.borderColor = '#1a1a1a';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              {f.label}
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '2px 6px', 
                borderRadius: 4, 
                background: filter === f.key ? '#8B5CF620' : '#1a1a1a',
                minWidth: 20,
                textAlign: 'center'
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by name, email, subject, or message content..."
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

      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ 
            background: '#0a0a0a', 
            border: '1px solid #1a1a1a', 
            borderRadius: 12, 
            padding: 40, 
            textAlign: 'center' 
          }}>
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
              <span style={{ color: '#666', fontSize: '0.9rem' }}>Loading messages...</span>
            </div>
          </div>
        ) : threads.length === 0 ? (
          <div style={{ 
            background: '#0a0a0a', 
            border: '1px solid #1a1a1a', 
            borderRadius: 12, 
            padding: 60, 
            textAlign: 'center', 
            color: '#555' 
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, opacity: 0.3 }}>💬</div>
            <p style={{ fontSize: '1rem', marginBottom: 8 }}>No messages found</p>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>
              {search || filter !== 'all' ? 'Try adjusting your filters' : 'Messages from your contact form will appear here'}
            </p>
          </div>
        ) : (
          threads.map((thread: any) => {
            const message = thread.latest;
            const isExpanded = expandedId === message.id;
            const statusColor = statusColors[message.status] || statusColors.new;
            
            return (
              <div 
                key={message.id} 
                style={{ 
                  background: '#0a0a0a', 
                  border: message.status === 'new' ? '1px solid #8B5CF640' : '1px solid #1a1a1a',
                  borderRadius: 12, 
                  padding: 20,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  boxShadow: message.status === 'new' ? '0 0 20px rgba(139, 92, 246, 0.1)' : 'none'
                }}
                onClick={() => setExpandedId(isExpanded ? null : message.id)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = message.status === 'new' ? '#8B5CF640' : '#1a1a1a';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = message.status === 'new' ? '0 0 20px rgba(139, 92, 246, 0.1)' : 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    {/* Priority Indicator */}
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: statusColor.dot,
                      boxShadow: `0 0 8px ${statusColor.dot}`,
                      flexShrink: 0
                    }}></div>
                    
                    {/* Sender Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ 
                          fontSize: '0.95rem', 
                          fontWeight: 700, 
                          color: '#E8E8E8',
                          fontFamily: 'var(--font-display)'
                        }}>
                          {message.name || 'Anonymous'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                          {message.email}
                        </span>
                        {thread.count > 1 && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: '#8B5CF615',
                            color: '#8B5CF6',
                            fontWeight: 600
                          }}>
                            {thread.count} messages
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {getRelativeTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: 6, 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    background: statusColor.bg, 
                    color: statusColor.text, 
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                    flexShrink: 0
                  }}>
                    {message.status}
                  </span>
                </div>

                {/* Subject */}
                <div style={{ 
                  fontSize: '0.88rem', 
                  color: '#F59E0B', 
                  marginBottom: 10,
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)'
                }}>
                  {message.subject || 'No subject'}
                </div>

                {/* Message Preview */}
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: isExpanded ? '#ccc' : '#888', 
                  lineHeight: 1.6, 
                  whiteSpace: isExpanded ? 'pre-wrap' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: isExpanded ? 16 : 12,
                  maxWidth: '100%'
                }}>
                  {isExpanded ? message.message : message.message?.substring(0, 200) + (message.message?.length > 200 ? '...' : '')}
                </div>

                {/* Show all messages in thread if expanded */}
                {isExpanded && thread.messages.length > 1 && (
                  <div style={{ 
                    marginTop: 16, 
                    paddingTop: 16, 
                    borderTop: '1px solid #1a1a1a' 
                  }}>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#666', 
                      marginBottom: 12,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600
                    }}>
                      Thread History ({thread.messages.length - 1} earlier)
                    </div>
                    {thread.messages.slice(1).map((m: any) => (
                      <div key={m.id} style={{ 
                        marginBottom: 12, 
                        padding: 12, 
                        background: '#111', 
                        borderRadius: 8,
                        borderLeft: '3px solid #333'
                      }}>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 6 }}>
                          {getRelativeTime(m.created_at)} • {m.subject || 'No subject'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#999', lineHeight: 1.5 }}>
                          {m.message?.substring(0, 150)}{m.message?.length > 150 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ 
                  display: 'flex', 
                  gap: 8, 
                  flexWrap: 'wrap',
                  paddingTop: 12,
                  borderTop: '1px solid #1a1a1a'
                }}
                onClick={e => e.stopPropagation()}>
                  {['read', 'replied', 'archived'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => updateStatus(message.id, s)} 
                      disabled={message.status === s}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: 6, 
                        border: '1px solid #333', 
                        background: message.status === s ? '#222' : 'transparent', 
                        color: message.status === s ? '#555' : '#888', 
                        fontSize: '0.72rem', 
                        cursor: message.status === s ? 'default' : 'pointer', 
                        textTransform: 'capitalize',
                        fontWeight: 600,
                        transition: 'all 0.15s ease',
                        opacity: message.status === s ? 0.5 : 1
                      }}
                      onMouseEnter={e => {
                        if (message.status !== s) {
                          e.currentTarget.style.borderColor = '#555';
                          e.currentTarget.style.color = '#E8E8E8';
                        }
                      }}
                      onMouseLeave={e => {
                        if (message.status !== s) {
                          e.currentTarget.style.borderColor = '#333';
                          e.currentTarget.style.color = '#888';
                        }
                      }}
                    >
                      {s === 'read' ? '👁 Mark Read' : s === 'replied' ? '✓ Replied' : '📦 Archive'}
                    </button>
                  ))}
                  <a 
                    href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || 'Your message')}&body=${encodeURIComponent(`\n\n---\nOriginal message from ${message.name}:\n${message.message}`)}`}
                    style={{ 
                      padding: '6px 14px', 
                      borderRadius: 6, 
                      border: '1px solid #8B5CF640', 
                      background: 'transparent',
                      color: '#8B5CF6', 
                      fontSize: '0.72rem', 
                      textDecoration: 'none',
                      fontWeight: 600,
                      display: 'inline-block',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#8B5CF610';
                      e.currentTarget.style.borderColor = '#8B5CF6';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = '#8B5CF640';
                    }}
                  >
                    ↗ Reply via Email
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
