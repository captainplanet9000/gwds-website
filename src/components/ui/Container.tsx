import { ReactNode, CSSProperties } from 'react';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  style?: CSSProperties;
}

export function Container({ children, size = 'xl', className = '', style }: ContainerProps) {
  const sizes = {
    sm: '48rem',     // 768px
    md: '64rem',     // 1024px
    lg: '72rem',     // 1152px
    xl: '80rem',     // 1280px
    full: '100%',
  };

  return (
    <div 
      className={className}
      style={{ 
        maxWidth: sizes[size], 
        marginLeft: 'auto', 
        marginRight: 'auto',
        paddingLeft: 'var(--space-6)',
        paddingRight: 'var(--space-6)',
        ...style
      }}
    >
      {children}
    </div>
  );
}
