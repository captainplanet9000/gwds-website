import { ReactNode, HTMLAttributes } from 'react';

type CardVariant = 'glass' | 'solid' | 'bordered';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'glass',
  children,
  hoverable = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-lg transition-all duration-300';

  const variants = {
    glass: `
      bg-[rgba(18,18,26,0.8)] backdrop-blur-xl
      border border-[rgba(139,92,246,0.1)]
      ${hoverable ? 'hover:border-[rgba(139,92,246,0.3)] hover:shadow-[var(--glow-primary-md)] hover:-translate-y-1' : ''}
    `,
    solid: `
      bg-[var(--color-space-dark)]
      border border-[var(--color-border-dim)]
      ${hoverable ? 'hover:border-[var(--color-electric-purple)] hover:shadow-lg' : ''}
    `,
    bordered: `
      bg-transparent
      border-2 border-[var(--color-border-dim)]
      ${hoverable ? 'hover:border-[var(--color-electric-purple)]' : ''}
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {children}
    </div>
  );
}
