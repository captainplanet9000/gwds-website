# GWDS Design System
**Technical Implementation Guide**

---

## Design Tokens

### CSS Custom Properties
Copy these into your `globals.css` or theme configuration:

```css
:root {
  /* ========================================
     COLOR TOKENS
     ======================================== */
  
  /* Primary Palette */
  --color-electric-purple: oklch(0.65 0.29 295);
  --color-deep-purple: oklch(0.58 0.32 290);
  --color-light-purple: oklch(0.75 0.20 295);
  
  /* Accent Palette */
  --color-cyan-bright: oklch(0.75 0.15 195);
  --color-cyan-deep: oklch(0.65 0.18 195);
  
  /* Neutral Palette */
  --color-void-black: oklch(0.08 0 0);
  --color-space-dark: oklch(0.12 0.01 270);
  --color-slate-medium: oklch(0.15 0.02 270);
  --color-border-dim: oklch(0.20 0.03 260);
  --color-text-bright: oklch(0.98 0 0);
  --color-text-muted: oklch(0.68 0.01 250);
  
  /* Semantic Colors */
  --color-success: oklch(0.70 0.18 145);
  --color-warning: oklch(0.75 0.20 85);
  --color-error: oklch(0.65 0.25 25);
  --color-info: oklch(0.70 0.15 235);
  
  /* Legacy Support (fallback for older browsers) */
  --color-primary: #8B5CF6;
  --color-primary-dark: #7C3AED;
  --color-accent: #06B6D4;
  --color-bg-dark: #0A0A0F;
  --color-bg-card: #12121A;
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #94A3B8;

  /* ========================================
     TYPOGRAPHY
     ======================================== */
  
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
  --font-body: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  
  /* Type Scale (1.250 - Major Third) */
  --text-xs: 0.64rem;      /* 10px */
  --text-sm: 0.8rem;       /* 13px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.25rem;      /* 20px */
  --text-xl: 1.563rem;     /* 25px */
  --text-2xl: 1.953rem;    /* 31px */
  --text-3xl: 2.441rem;    /* 39px */
  --text-4xl: 3.052rem;    /* 49px */
  --text-5xl: 3.815rem;    /* 61px */
  --text-6xl: 4.768rem;    /* 76px */
  
  /* Font Weights */
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;

  /* ========================================
     SPACING
     ======================================== */
  
  --space-0: 0;
  --space-px: 1px;
  --space-0_5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1_5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2_5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3_5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-28: 7rem;        /* 112px */
  --space-32: 8rem;        /* 128px */
  --space-36: 9rem;        /* 144px */
  --space-40: 10rem;       /* 160px */
  --space-44: 11rem;       /* 176px */
  --space-48: 12rem;       /* 192px */
  --space-52: 13rem;       /* 208px */
  --space-56: 14rem;       /* 224px */
  --space-60: 15rem;       /* 240px */
  --space-64: 16rem;       /* 256px */

  /* ========================================
     BORDERS & RADIUS
     ======================================== */
  
  --border-width-0: 0;
  --border-width-1: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;
  
  --radius-none: 0;
  --radius-sm: 0.375rem;   /* 6px */
  --radius-md: 0.5rem;     /* 8px */
  --radius-lg: 0.75rem;    /* 12px */
  --radius-xl: 1rem;       /* 16px */
  --radius-2xl: 1.5rem;    /* 24px */
  --radius-3xl: 2rem;      /* 32px */
  --radius-full: 9999px;

  /* ========================================
     SHADOWS & ELEVATION
     ======================================== */
  
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.6);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.7);
  
  --glow-primary-sm: 0 0 20px rgba(139, 92, 246, 0.15);
  --glow-primary-md: 0 0 30px rgba(139, 92, 246, 0.25);
  --glow-primary-lg: 0 0 40px rgba(139, 92, 246, 0.35);
  
  --glow-accent-sm: 0 0 20px rgba(6, 182, 212, 0.15);
  --glow-accent-md: 0 0 30px rgba(6, 182, 212, 0.25);
  --glow-accent-lg: 0 0 40px rgba(6, 182, 212, 0.35);

  /* ========================================
     TRANSITIONS & ANIMATIONS
     ======================================== */
  
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;
  --duration-slowest: 600ms;
  
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* ========================================
     Z-INDEX SCALE
     ======================================== */
  
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;
  --z-max: 999;

  /* ========================================
     BREAKPOINTS (for reference, use in @media)
     ======================================== */
  
  --breakpoint-xs: 375px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* ========================================
     CONTAINER WIDTHS
     ======================================== */
  
  --container-xs: 20rem;     /* 320px */
  --container-sm: 24rem;     /* 384px */
  --container-md: 28rem;     /* 448px */
  --container-lg: 32rem;     /* 512px */
  --container-xl: 36rem;     /* 576px */
  --container-2xl: 42rem;    /* 672px */
  --container-3xl: 48rem;    /* 768px */
  --container-4xl: 56rem;    /* 896px */
  --container-5xl: 64rem;    /* 1024px */
  --container-6xl: 72rem;    /* 1152px */
  --container-7xl: 80rem;    /* 1280px */
  --container-full: 100%;
}
```

---

## Component Library

### Button Component

```tsx
// components/ui/Button.tsx
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
    inline-flex items-center justify-center gap-2
    font-medium transition-all duration-200
    focus-visible:outline-none focus-visible:ring-2 
    focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-dark)]
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
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
    md: 'px-4 py-2 text-base rounded-md',
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
      `}
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
```

### Card Component

```tsx
// components/ui/Card.tsx
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
      `}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Input Component

```tsx
// components/ui/Input.tsx
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconPosition = 'left', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              bg-[rgba(255,255,255,0.03)]
              border border-[var(--color-border-dim)]
              rounded-md
              text-[var(--color-text-bright)]
              placeholder:text-[var(--color-text-muted)]
              transition-all duration-200
              focus:outline-none focus:border-[var(--color-electric-purple)]
              focus:ring-2 focus:ring-[rgba(139,92,246,0.1)]
              ${error ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[rgba(239,68,68,0.1)]' : ''}
              ${className}
            `}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--color-error)]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Badge Component

```tsx
// components/ui/Badge.tsx
import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({ children, variant = 'primary', dot = false }: BadgeProps) {
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
        border ${variants[variant]}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
```

---

## Layout Patterns

### Container

```tsx
// components/layout/Container.tsx
import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({ children, size = 'xl', className = '' }: ContainerProps) {
  const sizes = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}>
      {children}
    </div>
  );
}
```

### Section

```tsx
// components/layout/Section.tsx
import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  background?: 'default' | 'dark' | 'grid';
}

export function Section({ 
  children, 
  id, 
  className = '', 
  background = 'default' 
}: SectionProps) {
  const backgrounds = {
    default: '',
    dark: 'bg-[var(--color-void-black)]',
    grid: 'bg-[var(--color-void-black)] bg-grid-pattern',
  };

  return (
    <section 
      id={id} 
      className={`py-16 md:py-24 ${backgrounds[background]} ${className}`}
    >
      {children}
    </section>
  );
}
```

---

## Animation Utilities

### Scroll Reveal

```tsx
// components/animations/ScrollReveal.tsx
'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  threshold?: number;
}

export function ScrollReveal({ 
  children, 
  delay = 0, 
  threshold = 0.1 
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
        }
      `}
    >
      {children}
    </div>
  );
}
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Extra Small Devices (phones, <640px) */
/* Default styles */

/* Small Devices (landscape phones, ≥640px) */
@media (min-width: 640px) {
  /* sm: prefix in Tailwind */
}

/* Medium Devices (tablets, ≥768px) */
@media (min-width: 768px) {
  /* md: prefix */
}

/* Large Devices (desktops, ≥1024px) */
@media (min-width: 1024px) {
  /* lg: prefix */
}

/* Extra Large Devices (large desktops, ≥1280px) */
@media (min-width: 1280px) {
  /* xl: prefix */
}

/* 2X Large Devices (larger desktops, ≥1536px) */
@media (min-width: 1536px) {
  /* 2xl: prefix */
}
```

---

## Usage Examples

### Hero Section

```tsx
<Section background="grid">
  <Container>
    <div className="text-center max-w-4xl mx-auto">
      <Badge variant="primary" dot>New Release</Badge>
      <h1 className="mt-6 text-5xl md:text-6xl font-bold">
        <span className="gradient-text">Autonomous Systems</span>
        <br />
        for Creators
      </h1>
      <p className="mt-6 text-xl text-[var(--color-text-muted)]">
        Build trading agents, content pipelines, and productivity tools
        that work while you sleep.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <Button variant="primary" size="lg">
          Get Started
        </Button>
        <Button variant="secondary" size="lg">
          View Demo
        </Button>
      </div>
    </div>
  </Container>
</Section>
```

### Feature Grid

```tsx
<Section>
  <Container>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, i) => (
        <ScrollReveal key={i} delay={i * 100}>
          <Card variant="glass" hoverable padding="lg">
            <div className="text-[var(--color-electric-purple)] mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {feature.title}
            </h3>
            <p className="text-[var(--color-text-muted)]">
              {feature.description}
            </p>
          </Card>
        </ScrollReveal>
      ))}
    </div>
  </Container>
</Section>
```

---

*Refer to BRAND-GUIDE.md for visual identity and voice/tone guidelines.*
