'use client';

export function AnimatedCat({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Teki - gato mascote"
    >
      {/* Glow behind cat */}
      <defs>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#17c964" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#17c964" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Tail */}
      <g style={{ transformOrigin: '145px 155px', animation: 'tail-wag 3s ease-in-out infinite' }}>
        <path
          d="M 145 155 Q 175 140 180 110 Q 185 90 175 80"
          fill="none"
          stroke="#3f3f46"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Body */}
      <ellipse cx="100" cy="160" rx="40" ry="30" fill="#27272a" />

      {/* Front paws */}
      <ellipse cx="78" cy="175" rx="10" ry="6" fill="#27272a" />
      <ellipse cx="122" cy="175" rx="10" ry="6" fill="#27272a" />

      {/* Head */}
      <circle cx="100" cy="105" r="35" fill="#27272a" />

      {/* Left ear */}
      <polygon points="72,82 60,50 85,72" fill="#27272a" />
      <polygon points="75,78 66,56 83,74" fill="#18181b" />

      {/* Right ear */}
      <polygon points="128,82 140,50 115,72" fill="#27272a" />
      <polygon points="125,78 134,56 117,74" fill="#18181b" />

      {/* Eye glow */}
      <circle cx="86" cy="100" r="12" fill="url(#eyeGlow)" />
      <circle cx="114" cy="100" r="12" fill="url(#eyeGlow)" />

      {/* Eyes */}
      <g style={{ transformOrigin: '86px 100px', animation: 'blink 4s ease-in-out infinite' }}>
        <ellipse cx="86" cy="100" rx="6" ry="6.5" fill="#17c964" filter="url(#glow)" />
        <ellipse cx="86" cy="100" rx="2.5" ry="5" fill="#09090b" />
      </g>
      <g style={{ transformOrigin: '114px 100px', animation: 'blink 4s ease-in-out infinite' }}>
        <ellipse cx="114" cy="100" rx="6" ry="6.5" fill="#17c964" filter="url(#glow)" />
        <ellipse cx="114" cy="100" rx="2.5" ry="5" fill="#09090b" />
      </g>

      {/* Nose */}
      <polygon points="100,112 97,116 103,116" fill="#71717a" />

      {/* Mouth */}
      <path d="M 93 118 Q 100 123 107 118" fill="none" stroke="#71717a" strokeWidth="1.2" />

      {/* Whiskers */}
      <line x1="60" y1="108" x2="80" y2="112" stroke="#3f3f46" strokeWidth="0.8" />
      <line x1="58" y1="115" x2="79" y2="115" stroke="#3f3f46" strokeWidth="0.8" />
      <line x1="120" y1="112" x2="140" y2="108" stroke="#3f3f46" strokeWidth="0.8" />
      <line x1="121" y1="115" x2="142" y2="115" stroke="#3f3f46" strokeWidth="0.8" />

      {/* Chest patch */}
      <ellipse cx="100" cy="145" rx="15" ry="12" fill="#3f3f46" opacity="0.3" />
    </svg>
  );
}
