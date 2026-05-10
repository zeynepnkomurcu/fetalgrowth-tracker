// Decorative empty-state illustration: a stylised fetal profile with an
// echo-style audio waveform overlay on a subtle dotted grid. Inline SVG
// so it scales cleanly and inherits no external assets.
export default function FetalHero() {
  // Pre-generate waveform bar heights — a smooth amplitude envelope
  // that swells in the middle, like an ultrasound waveform.
  const bars = Array.from({ length: 56 }, (_, i) => {
    const x = (i - 28) / 28; // -1 .. 1
    const envelope = Math.exp(-x * x * 2.2); // Gaussian fall-off
    const noise = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.7));
    const h = 6 + envelope * noise * 90;
    return { x: 30 + i * 7.5, h };
  });

  return (
    <svg
      viewBox="0 0 480 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md mx-auto select-none pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        {/* Subtle dotted grid */}
        <pattern id="fh-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#e2e8f0" />
        </pattern>
        {/* Waveform gradient — fades at edges */}
        <linearGradient id="fh-wave" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="20%" stopColor="#06b6d4" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#0891b2" stopOpacity="0.95" />
          <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
        {/* Fetus stroke fade */}
        <linearGradient id="fh-fetus" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Background dotted grid */}
      <rect width="480" height="320" fill="url(#fh-grid)" />

      {/* Stylised fetus silhouette (profile, head + curled body) */}
      <g
        fill="none"
        stroke="url(#fh-fetus)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Head + back curve */}
        <path d="M 215 95
                 C 255 92, 295 108, 308 145
                 C 318 178, 305 208, 278 224
                 C 252 240, 218 238, 198 220" />
        {/* Body curl */}
        <path d="M 198 220
                 C 178 200, 178 168, 198 152
                 C 218 138, 250 142, 262 158" />
        {/* Inner cheek/jaw line */}
        <path d="M 244 124
                 C 256 130, 262 142, 258 156" opacity="0.65" />
        {/* Tiny ear */}
        <circle cx="240" cy="130" r="2.2" fill="#0f172a" opacity="0.4" stroke="none" />
        {/* Spine arc detail */}
        <path d="M 215 175 C 235 170, 252 178, 260 195"
              strokeDasharray="2 3" opacity="0.4" />
      </g>

      {/* Echo waveform — vertical amplitude bars centred mid-height */}
      <g>
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={160 - b.h / 2}
            width="2.2"
            height={b.h}
            rx="1.1"
            fill="url(#fh-wave)"
          />
        ))}
      </g>

      {/* Soft horizontal centre line behind waveform for grounding */}
      <line
        x1="20" y1="160" x2="460" y2="160"
        stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.5"
      />
    </svg>
  );
}
