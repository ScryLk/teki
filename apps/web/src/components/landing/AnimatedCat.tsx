'use client';

export function AnimatedCat({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Teki - gato mascote"
    >
      <defs>
        <radialGradient id="bodyGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#34D8C0" />
          <stop offset="55%" stopColor="#2A8F9D" />
          <stop offset="100%" stopColor="#1E6B75" />
        </radialGradient>
        <radialGradient id="headGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3EEBD0" />
          <stop offset="55%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#1F7A85" />
        </radialGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#17c964" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#17c964" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="behindGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2A8F9D" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2A8F9D" stopOpacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E6B75" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Ambient glow behind cat */}
      <circle cx="100" cy="135" r="80" fill="url(#behindGlow)" />

      {/* Tail */}
      <g style={{ transformOrigin: '145px 155px', animation: 'tail-wag 3s ease-in-out infinite' }}>
        <path
          d="M 145 155 Q 175 140 180 110 Q 185 90 175 80"
          fill="none"
          stroke="#2A8F9D"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.85"
        />
      </g>

      {/* Body */}
      <ellipse cx="100" cy="160" rx="42" ry="32" fill="url(#bodyGrad)" filter="url(#softShadow)" />

      {/* Belly highlight */}
      <ellipse cx="100" cy="155" rx="22" ry="16" fill="#34D8C0" opacity="0.25" />

      {/* Front paws */}
      <ellipse cx="76" cy="177" rx="10" ry="6" fill="#2A8F9D" />
      <ellipse cx="124" cy="177" rx="10" ry="6" fill="#2A8F9D" />

      {/* Head */}
      <circle cx="100" cy="105" r="37" fill="url(#headGrad)" filter="url(#softShadow)" />

      {/* Left ear outer */}
      <polygon points="72,82 60,50 85,72" fill="#2A8F9D" />
      {/* Left ear inner */}
      <polygon points="75,78 66,56 83,74" fill="#1E6B75" />

      {/* Right ear outer */}
      <polygon points="128,82 140,50 115,72" fill="#2A8F9D" />
      {/* Right ear inner */}
      <polygon points="125,78 134,56 117,74" fill="#1E6B75" />

      {/* Eye halos */}
      <circle cx="86" cy="100" r="14" fill="url(#eyeGlow)" />
      <circle cx="114" cy="100" r="14" fill="url(#eyeGlow)" />

      {/* Eyes */}
      <g style={{ transformOrigin: '86px 100px', animation: 'blink 4s ease-in-out infinite' }}>
        <ellipse cx="86" cy="100" rx="7" ry="7.5" fill="#17c964" filter="url(#glow)" />
        <ellipse cx="86" cy="100" rx="2.5" ry="5" fill="#09090b" />
        <circle cx="89" cy="97" r="1.8" fill="#ffffff" opacity="0.7" />
      </g>
      <g style={{ transformOrigin: '114px 100px', animation: 'blink 4s ease-in-out infinite' }}>
        <ellipse cx="114" cy="100" rx="7" ry="7.5" fill="#17c964" filter="url(#glow)" />
        <ellipse cx="114" cy="100" rx="2.5" ry="5" fill="#09090b" />
        <circle cx="117" cy="97" r="1.8" fill="#ffffff" opacity="0.7" />
      </g>

      {/* Nose */}
      <polygon points="100,112 97,116 103,116" fill="#1E6B75" />

      {/* Mouth */}
      <path d="M 93 118 Q 100 123 107 118" fill="none" stroke="#1E6B75" strokeWidth="1.2" />

      {/* Whiskers */}
      <line x1="60" y1="108" x2="80" y2="112" stroke="#1E6B75" strokeWidth="0.8" opacity="0.7" />
      <line x1="58" y1="115" x2="79" y2="115" stroke="#1E6B75" strokeWidth="0.8" opacity="0.7" />
      <line x1="120" y1="112" x2="140" y2="108" stroke="#1E6B75" strokeWidth="0.8" opacity="0.7" />
      <line x1="121" y1="115" x2="142" y2="115" stroke="#1E6B75" strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}
