export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gwds-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="0.5" stopColor="#6D28D9" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="gwds-inner" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" />
          <stop offset="1" stopColor="#22D3EE" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer rounded square */}
      <rect x="4" y="4" width="112" height="112" rx="24" fill="url(#gwds-grad)" />
      {/* Inner dark area */}
      <rect x="12" y="12" width="96" height="96" rx="18" fill="#0A0A0F" fillOpacity="0.85" />
      {/* Wave form - the "gamma wave" */}
      <path
        d="M28 60 Q38 30, 48 60 Q58 90, 68 60 Q78 30, 88 60"
        stroke="url(#gwds-inner)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow)"
      />
      {/* G letterform integrated with wave */}
      <path
        d="M42 38 C30 38, 24 48, 24 60 C24 72, 30 82, 42 82 C50 82, 56 78, 58 72 L58 62 L48 62"
        stroke="url(#gwds-inner)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Dot accent */}
      <circle cx="92" cy="40" r="4" fill="#06B6D4" opacity="0.8" />
      <circle cx="92" cy="40" r="6" fill="#06B6D4" opacity="0.2" />
    </svg>
  );
}

export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lm-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="24" fill="url(#lm-grad)" />
      <path
        d="M28 60 Q38 30, 48 60 Q58 90, 68 60 Q78 30, 88 60"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
