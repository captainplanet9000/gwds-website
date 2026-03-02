import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = 'primary', dot = false, className = '' }: BadgeProps) {
  const variants = {
    primary: 'bg-[rgba(139,92,246,0.1)] text-[var(--color-electric-purple)] border-[rgba(139,92,246,0.3)]',
    success: 'bg-[rgba(34,197,94,0.1)] text-[var(--color-success)] border-[rgba(34,197,94,0.3)]',
    warning: 'bg-[rgba(245,158,11,0.1)] text-[var(--color-warning)] border-[rgba(245,158,11,0.3)]',
    error: 'bg-[rgba(239,68,68,0.1)] text-[var(--color-error)] border-[rgba(239,68,68,0.3)]',
    neutral: 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] border-[var(--color-border-dim)]',
  };

  const dotColors = {
    primary: 'bg-[var(--color-electric-purple)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error: 'bg-[var(--color-error)]',
    neutral: 'bg-[var(--color-text-muted)]',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        text-xs font-medium rounded-full
        border ${variants[variant]} ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
