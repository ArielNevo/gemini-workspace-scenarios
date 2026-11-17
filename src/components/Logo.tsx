/**
 * "Ariel Nevo" wordmark as periodic-table tiles: Ar · Iel · Ne · vo, with the blue arc
 * linking the first two (the studio brand, as in the ROI Simulator and My PR Studio).
 * Pure SVG; the draw-in animation is CSS and respects prefers-reduced-motion.
 */
const TILES = [
  { text: 'Ar', bg: '#bcdcf7', fg: '#14161a' },
  { text: 'Iel', bg: '#cdeedd', fg: '#14161a' },
  { text: 'Ne', bg: '#0f6d62', fg: '#f6f3ec' },
  { text: 'vo', bg: '#b8651b', fg: '#f6f3ec' },
];

export function Logo({ size = 26, className = '' }: { size?: number; className?: string }) {
  const gap = Math.max(3, Math.round(size / 9));
  const r = Math.round(size / 4.3);
  const width = TILES.length * size + (TILES.length - 1) * gap;
  const lift = Math.round(size * 0.42);
  return (
    <svg
      viewBox={`0 ${-lift} ${width} ${size + lift}`}
      width={width}
      height={size + lift}
      className={`logo ${className}`}
      role="img"
      aria-label="Ariel Nevo"
      direction="ltr"
    >
      {TILES.map((t, i) => {
        const x = i * (size + gap);
        return (
          <g key={t.text} className={`logo-tile logo-tile-${i}`}>
            <rect x={x} y={0} width={size} height={size} rx={r} fill={t.bg} />
            <text
              x={x + size / 2}
              y={size / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={t.fg}
              fontFamily="'Heebo Variable', Heebo, system-ui, sans-serif"
              fontWeight={800}
              fontSize={size * 0.5}
              letterSpacing={-0.3}
            >
              {t.text}
            </text>
          </g>
        );
      })}
      <path
        className="logo-arc"
        d={`M ${size * 0.55} 0 C ${size * 0.75} ${-lift}, ${size + gap + size * 0.25} ${-lift}, ${size + gap + size * 0.45} 0`}
        fill="none"
        stroke="#2b3cff"
        strokeWidth={Math.max(1.4, size / 18)}
        strokeLinecap="round"
      />
      <circle cx={size * 0.55} cy={0} r={Math.max(1.6, size / 16)} fill="#2b3cff" />
      <circle cx={size + gap + size * 0.45} cy={0} r={Math.max(1.6, size / 16)} fill="#2b3cff" />
    </svg>
  );
}
