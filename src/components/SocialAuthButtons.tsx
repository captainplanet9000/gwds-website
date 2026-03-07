'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Provider } from '@supabase/supabase-js';

const providers: { id: Provider; label: string; icon: React.ReactNode; bg: string; bgHover: string; color: string }[] = [
  {
    id: 'google',
    label: 'Continue with Google',
    bg: '#ffffff',
    bgHover: '#f1f1f1',
    color: '#1f1f1f',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'Continue with GitHub',
    bg: '#24292f',
    bgHover: '#32383f',
    color: '#ffffff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: 'discord',
    label: 'Continue with Discord',
    bg: '#5865F2',
    bgHover: '#4752c4',
    color: '#ffffff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Continue with Apple',
    bg: '#000000',
    bgHover: '#1a1a1a',
    color: '#ffffff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
];

export default function SocialAuthButtons() {
  const { signInWithProvider } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleProvider = async (provider: Provider) => {
    setError('');
    setLoadingProvider(provider);
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {providers.map((p) => (
        <button
          key={p.id}
          onClick={() => handleProvider(p.id)}
          disabled={!!loadingProvider}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            width: '100%',
            padding: '12px 16px',
            borderRadius: 8,
            border: p.id === 'google' ? '1px solid #dadce0' : '1px solid transparent',
            background: loadingProvider === p.id ? p.bgHover : p.bg,
            color: p.color,
            fontFamily: 'var(--font-body)',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: loadingProvider ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loadingProvider && loadingProvider !== p.id ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!loadingProvider) e.currentTarget.style.background = p.bgHover; }}
          onMouseLeave={(e) => { if (!loadingProvider) e.currentTarget.style.background = p.bg; }}
        >
          {p.icon}
          <span>{loadingProvider === p.id ? 'Redirecting...' : p.label}</span>
        </button>
      ))}
      {error && (
        <div style={{
          padding: '10px 14px',
          borderRadius: 8,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          fontFamily: 'var(--font-body)',
          fontSize: '0.82rem',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
