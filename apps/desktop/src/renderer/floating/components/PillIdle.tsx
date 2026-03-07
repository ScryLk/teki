const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const ACCENT = '#00d4ff';
const SURFACE = '#161b27';
const BORDER = '#1e293b';
const DIM = '#334155';
const MUTED = '#64748b';

interface PillIdleProps {
  onStart: () => void;
  onClose: () => void;
}

export default function PillIdle({ onStart, onClose }: PillIdleProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        padding: '0 16px',
        gap: 10,
        // @ts-expect-error electron webkit
        WebkitAppRegion: 'drag',
      }}
    >
      <svg width="32" height="32" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
        {/* Head */}
        <circle cx="55" cy="54" r="28" fill="#2A8F9D" />
        <circle cx="55" cy="56" r="19" fill="#34a3b2" opacity="0.35" />
        {/* Ears */}
        <polygon points="30,40 20,8 46,30" fill="#2A8F9D" />
        <polygon points="32,36 25,14 43,31" fill="#237a86" opacity="0.6" />
        <polygon points="80,40 90,8 64,30" fill="#2A8F9D" />
        <polygon points="78,36 85,14 67,31" fill="#237a86" opacity="0.6" />
        {/* Eyes */}
        <circle cx="42" cy="52" r="6" fill={ACCENT} />
        <circle cx="43" cy="52" r="3" fill="#0a0a0b" />
        <circle cx="44" cy="50.5" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="68" cy="52" r="6" fill={ACCENT} />
        <circle cx="69" cy="52" r="3" fill="#0a0a0b" />
        <circle cx="70" cy="50.5" r="1.2" fill="#fff" opacity="0.7" />
        {/* Nose */}
        <polygon points="53,62 57,62 55,65" fill="#1a6b75" />
        {/* Mouth */}
        <path d="M50,66 Q55,70 60,66" fill="none" stroke="#1a6b75" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span style={{ flex: 1, fontSize: 11, color: MUTED, fontFamily: FONT }}>
        Teki — <span style={{ color: ACCENT }}>Ctrl+D</span> para falar
      </span>
      <button
        onClick={onStart}
        style={{
          // @ts-expect-error electron webkit
          WebkitAppRegion: 'no-drag',
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: `1px solid ${BORDER}`,
          background: SURFACE,
          color: ACCENT,
          cursor: 'pointer',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        🎙
      </button>
      <button
        onClick={onClose}
        style={{
          // @ts-expect-error electron webkit
          WebkitAppRegion: 'no-drag',
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          color: DIM,
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
