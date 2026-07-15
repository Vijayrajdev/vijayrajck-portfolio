// Custom space-themed VJ monogram: gradient strokes, an orbit ring with a
// satellite, and a star sparkle. Pure geometry — no font dependency.
export default function LogoVJ({ className = 'h-9 w-9', withBackground = false }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="VJ logo">
      <defs>
        <linearGradient id="vj-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {withBackground && <rect x="0" y="0" width="64" height="64" rx="14" fill="#0b0620" />}
      {/* Orbit ring with satellite */}
      <g transform="rotate(-18 32 33)">
        <ellipse cx="32" cy="33" rx="27" ry="10.5" fill="none" stroke="url(#vj-grad)" strokeWidth="1.4" opacity="0.55" />
        <circle cx="59" cy="33" r="2.4" fill="#22d3ee" />
      </g>
      {/* V */}
      <polyline
        points="15,20 25,44 35,20"
        fill="none"
        stroke="url(#vj-grad)"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* J */}
      <path
        d="M46 20 v16.5 a6.8 6.8 0 0 1 -12.4 3.9"
        fill="none"
        stroke="url(#vj-grad)"
        strokeWidth="4.6"
        strokeLinecap="round"
      />
      {/* Star sparkle */}
      <path d="M51 8 l1.6 3.9 3.9 1.6 -3.9 1.6 -1.6 3.9 -1.6 -3.9 -3.9 -1.6 3.9 -1.6 z" fill="#e0f2fe" opacity="0.95" />
      <circle cx="10" cy="12" r="1.1" fill="#a5b4fc" opacity="0.8" />
      <circle cx="55" cy="52" r="1.3" fill="#f0abfc" opacity="0.8" />
    </svg>
  )
}
