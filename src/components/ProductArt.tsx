"use client";

const artStyles: Record<string, { colors: string[]; pattern: string }> = {
  templates: {
    colors: ["#8B5CF6", "#6D28D9", "#4C1D95"],
    pattern: "grid",
  },
  trading: {
    colors: ["#06B6D4", "#0891B2", "#155E75"],
    pattern: "waves",
  },
  prompts: {
    colors: ["#F59E0B", "#D97706", "#92400E"],
    pattern: "dots",
  },
  wallpapers: {
    colors: ["#EC4899", "#BE185D", "#831843"],
    pattern: "gradient",
  },
  nfts: {
    colors: ["#10B981", "#059669", "#064E3B"],
    pattern: "hexagons",
  },
  animations: {
    colors: ["#F97316", "#EA580C", "#9A3412"],
    pattern: "circles",
  },
};

export default function ProductArt({ category, seed }: { category: string; seed: string }) {
  const style = artStyles[category] || artStyles.templates;
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  return (
    <svg width="100%" height="100%" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="400" y2="240" gradientUnits="userSpaceOnUse">
          <stop stopColor={style.colors[0]} stopOpacity="0.15" />
          <stop offset="0.5" stopColor={style.colors[1]} stopOpacity="0.08" />
          <stop offset="1" stopColor={style.colors[2]} stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={`orb-${seed}`} cx="50%" cy="50%" r="50%">
          <stop stopColor={style.colors[0]} stopOpacity="0.3" />
          <stop offset="1" stopColor={style.colors[0]} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${seed}`}>
          <feGaussianBlur stdDeviation="20" />
        </filter>
      </defs>

      <rect width="400" height="240" fill="#0A0A0F" />
      <rect width="400" height="240" fill={`url(#bg-${seed})`} />

      {/* Orbs */}
      <circle cx={100 + (hash % 200)} cy={60 + (hash % 120)} r="80" fill={`url(#orb-${seed})`} filter={`url(#blur-${seed})`} />
      <circle cx={300 - (hash % 150)} cy={180 - (hash % 100)} r="60" fill={style.colors[1]} opacity="0.12" filter={`url(#blur-${seed})`} />

      {/* Pattern overlay */}
      {style.pattern === "grid" && (
        <g opacity="0.08">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`v${i}`} x1={i * 36} y1="0" x2={i * 36} y2="240" stroke={style.colors[0]} strokeWidth="0.5" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 34} x2="400" y2={i * 34} stroke={style.colors[0]} strokeWidth="0.5" />
          ))}
        </g>
      )}
      {style.pattern === "waves" && (
        <g opacity="0.15">
          {Array.from({ length: 5 }, (_, i) => (
            <path
              key={i}
              d={`M0 ${80 + i * 30} Q100 ${60 + i * 30 + (hash % 20)}, 200 ${80 + i * 30} Q300 ${100 + i * 30 - (hash % 20)}, 400 ${80 + i * 30}`}
              stroke={style.colors[0]}
              strokeWidth="1"
              fill="none"
            />
          ))}
        </g>
      )}
      {style.pattern === "dots" && (
        <g opacity="0.1">
          {Array.from({ length: 80 }, (_, i) => (
            <circle
              key={i}
              cx={((i * 47 + hash) % 400)}
              cy={((i * 31 + hash) % 240)}
              r={1 + (i % 3)}
              fill={style.colors[i % 2 === 0 ? 0 : 1]}
            />
          ))}
        </g>
      )}
      {style.pattern === "hexagons" && (
        <g opacity="0.08" stroke={style.colors[0]} strokeWidth="0.5" fill="none">
          {Array.from({ length: 12 }, (_, i) => {
            const cx = (i % 4) * 110 + 50;
            const cy = Math.floor(i / 4) * 90 + 40;
            return (
              <polygon
                key={i}
                points={`${cx},${cy - 30} ${cx + 26},${cy - 15} ${cx + 26},${cy + 15} ${cx},${cy + 30} ${cx - 26},${cy + 15} ${cx - 26},${cy - 15}`}
              />
            );
          })}
        </g>
      )}
      {style.pattern === "circles" && (
        <g opacity="0.08">
          {Array.from({ length: 6 }, (_, i) => (
            <circle
              key={i}
              cx={200}
              cy={120}
              r={30 + i * 25}
              stroke={style.colors[0]}
              strokeWidth="0.5"
              fill="none"
            />
          ))}
        </g>
      )}
      {style.pattern === "gradient" && (
        <g opacity="0.12">
          {Array.from({ length: 20 }, (_, i) => (
            <rect
              key={i}
              x={i * 20}
              y="0"
              width="20"
              height="240"
              fill={style.colors[i % 3]}
              opacity={0.05 + (i % 5) * 0.02}
            />
          ))}
        </g>
      )}

      {/* Accent line */}
      <line x1="0" y1="239" x2="400" y2="239" stroke={style.colors[0]} strokeWidth="2" opacity="0.3" />
    </svg>
  );
}
