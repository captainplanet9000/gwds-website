'use client';

import type { CSSProperties, ReactNode } from 'react';

// The same inline tokens /account/hosting uses, so the panel reads as part of that page.
export const card: CSSProperties = {
  padding: 'clamp(16px, 4vw, 22px)',
  background: 'var(--color-surface)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-lg)',
  minWidth: 0,
};
export const label: CSSProperties = {
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: 'var(--color-neutral-600)',
};
export const mono: CSSProperties = { fontFamily: 'var(--font-mono)', wordBreak: 'break-all' };
export const muted: CSSProperties = { color: 'var(--color-neutral-700)', fontSize: 14, lineHeight: 1.55, margin: '8px 0 0' };
export const field: CSSProperties = {
  width: '100%',
  background: 'var(--color-neutral-100)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-divider)',
  borderRadius: 'var(--radius-md)',
  padding: '12px 14px',
};
export const buttonRow: CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 14 };
export const autoGrid = (min: number): CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${min}px), 1fr))`,
  gap: 14,
});

const tones = {
  warning: { border: '1px solid #8a762d', background: '#1d1909', color: '#e7d991' },
  error: { border: '1px solid #783333', background: '#240d0d', color: '#ffb4b4' },
  info: { border: '1px solid var(--color-accent)', background: 'var(--color-surface)', color: 'var(--color-accent)' },
} as const;

export function Callout({ tone, title, children, role }: {
  tone: keyof typeof tones; title?: ReactNode; children?: ReactNode; role?: 'alert' | 'status';
}) {
  return (
    <div role={role} style={{ ...tones[tone], padding: 14, borderRadius: 'var(--radius-md)', fontSize: 13, lineHeight: 1.55 }}>
      {title && <strong style={{ display: 'block', marginBottom: children ? 4 : 0 }}>{title}</strong>}
      {children}
    </div>
  );
}

/** One wallet prompt at a time: while any action is waiting on the wallet, the others are disabled. */
export type BusyKey = 'verify' | 'deposit' | 'withdraw' | 'approve';
export type BusyProps = { busy: BusyKey | null; setBusy: (key: BusyKey | null) => void };

export type ActionStatus =
  | { kind: 'idle' }
  | { kind: 'working'; text: string }
  | { kind: 'done'; text: string; link?: { href: string; label: string } }
  | { kind: 'error'; text: string; link?: { href: string; label: string } };

/** Progress and results for one action. Announced politely; errors assertively. */
export function StatusLine({ status }: { status: ActionStatus }) {
  if (status.kind === 'idle') return <div aria-live="polite" />;
  const color = status.kind === 'error' ? '#ffb4b4' : status.kind === 'done' ? 'var(--color-accent)' : 'var(--color-neutral-700)';
  return (
    <div role={status.kind === 'error' ? 'alert' : 'status'} aria-live={status.kind === 'error' ? 'assertive' : 'polite'} style={{ color, fontSize: 13, lineHeight: 1.5, marginTop: 10 }}>
      {status.text}
      {status.kind !== 'working' && status.link && (
        <>
          {' '}
          <a href={status.link.href} target="_blank" rel="noreferrer">{status.link.label}</a>
        </>
      )}
    </div>
  );
}

export function BalanceTile({ title, value, note }: { title: string; value: string; note?: ReactNode }) {
  return (
    <div style={card}>
      <div style={label}>{title}</div>
      <div style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', marginTop: 8, fontFamily: 'var(--font-mono)', wordBreak: 'break-word' }}>{value}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 6 }}>{note}</div>}
    </div>
  );
}
