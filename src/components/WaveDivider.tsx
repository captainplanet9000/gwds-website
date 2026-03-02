'use client';

interface WaveDividerProps {
  flip?: boolean;
  color?: string;
  className?: string;
  height?: number;
  opacity?: number;
  variant?: 'simple' | 'multi' | 'spiky';
}

export function WaveDivider({
  flip = false,
  color = 'var(--color-void-black)',
  className,
  height = 80,
  opacity = 1,
  variant = 'simple',
}: WaveDividerProps) {
  const paths: Record<string, string> = {
    simple: 'M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,120 L0,120 Z',
    multi: 'M0,40 C180,100 360,0 540,50 C720,100 900,10 1080,60 C1260,110 1380,20 1440,50 L1440,120 L0,120 Z',
    spiky:
      'M0,60 L120,20 L240,80 L360,10 L480,70 L600,15 L720,75 L840,20 L960,65 L1080,15 L1200,70 L1320,25 L1440,60 L1440,120 L0,120 Z',
  };

  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height,
        transform: flip ? 'scaleY(-1)' : 'none',
        opacity,
      }}
    >
      <path d={paths[variant]} fill={color} />
    </svg>
  );
}

// Animated SVG wave that loops — good for section borders
export function AnimatedWaveBorder({
  color = 'oklch(0.65 0.29 295)',
  opacity = 0.3,
}: {
  color?: string;
  opacity?: number;
}) {
  return (
    <div style={{ position: 'relative', height: 60, overflow: 'hidden', width: '100%' }}>
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '200%',
          height: '100%',
          animation: 'wave-scroll 8s linear infinite',
          fill: 'none',
        }}
      >
        <path
          d="M0,30 C180,60 360,0 540,30 C720,60 900,0 1080,30 C1260,60 1440,0 1620,30 C1800,60 1980,0 2160,30"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity={opacity}
        />
        <path
          d="M0,40 C180,10 360,60 540,40 C720,10 900,60 1080,40 C1260,10 1440,60 1620,40 C1800,10 1980,60 2160,40"
          stroke={color}
          strokeWidth="1"
          strokeOpacity={opacity * 0.6}
        />
      </svg>
      <style>{`
        @keyframes wave-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
