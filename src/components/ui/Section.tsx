import { ReactNode, CSSProperties } from 'react';

interface SectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
  background?: 'default' | 'dark' | 'grid';
}

export function Section({ 
  children, 
  id, 
  className = '', 
  style,
  background = 'default' 
}: SectionProps) {
  const backgrounds = {
    default: '',
    dark: 'var(--color-void-black)',
    grid: 'var(--color-void-black)',
  };

  const bgClass = background === 'grid' ? 'bg-grid-pattern' : '';

  return (
    <section 
      id={id} 
      className={`${bgClass} ${className}`}
      style={{
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
        background: backgrounds[background],
        ...style
      }}
    >
      {children}
    </section>
  );
}
