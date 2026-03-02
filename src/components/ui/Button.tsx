import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    btn inline-flex items-center justify-center gap-2
    font-medium transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--color-electric-purple)] to-[var(--color-deep-purple)]
      text-white hover:shadow-[var(--glow-primary-md)] hover:-translate-y-0.5
      active:translate-y-0 focus-visible:ring-[var(--color-electric-purple)]
    `,
    secondary: `
      bg-transparent border-2 border-[var(--color-electric-purple)]
      text-[var(--color-electric-purple)] hover:bg-[rgba(139,92,246,0.1)]
      focus-visible:ring-[var(--color-electric-purple)]
    `,
    ghost: `
      bg-transparent text-[var(--color-text-muted)]
      hover:bg-[rgba(255,255,255,0.05)] hover:text-[var(--color-text-bright)]
      focus-visible:ring-[var(--color-text-muted)]
    `,
    danger: `
      bg-[var(--color-error)] text-white
      hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]
      focus-visible:ring-[var(--color-error)]
    `,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2.5 text-base rounded-md',
    lg: 'px-6 py-3 text-lg rounded-lg',
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && icon}
      {children}
      {icon && iconPosition === 'right' && !loading && icon}
    </button>
  );
}
