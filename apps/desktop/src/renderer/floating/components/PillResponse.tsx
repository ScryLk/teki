import { useState, useEffect } from 'react';

const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const ACCENT = '#00d4ff';
const SURFACE = '#161b27';
const BORDER = '#1e293b';
const TEXT = '#e2e8f0';
const MUTED = '#64748b';
const DIM = '#334155';

interface PillResponseProps {
  response: string;
  transcript: string;
  onClose: () => void;
  onNew: () => void;
  /** Called when timer expires — goes back to idle instead of hiding */
  onDismiss: () => void;
  shortcut?: string;
}

export default function PillResponse({ response, transcript, onClose, onNew, onDismiss, shortcut = 'Ctrl+D' }: PillResponseProps) {
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const duration = 30000;
    const t = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.max(0, 100 - (elapsed / duration) * 100));
      if (elapsed >= duration) {
        clearInterval(t);
        onDismiss();
      }
    }, 100);
    return () => clearInterval(t);
  }, [onDismiss]);

  const copy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="28" height="28" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
          <circle cx="55" cy="54" r="28" fill="#2A8F9D" />
          <circle cx="55" cy="56" r="19" fill="#34a3b2" opacity="0.35" />
          <polygon points="30,40 20,8 46,30" fill="#2A8F9D" />
          <polygon points="32,36 25,14 43,31" fill="#237a86" opacity="0.6" />
          <polygon points="80,40 90,8 64,30" fill="#2A8F9D" />
          <polygon points="78,36 85,14 67,31" fill="#237a86" opacity="0.6" />
          <circle cx="42" cy="52" r="6" fill={ACCENT} />
          <circle cx="43" cy="52" r="3" fill="#0a0a0b" />
          <circle cx="44" cy="50.5" r="1.2" fill="#fff" opacity="0.7" />
          <circle cx="68" cy="52" r="6" fill={ACCENT} />
          <circle cx="69" cy="52" r="3" fill="#0a0a0b" />
          <circle cx="70" cy="50.5" r="1.2" fill="#fff" opacity="0.7" />
          <polygon points="53,62 57,62 55,65" fill="#1a6b75" />
          <path d="M50,66 Q55,70 60,66" fill="none" stroke="#1a6b75" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span
          style={{ fontSize: 11, color: ACCENT, fontFamily: FONT, flex: 1, fontWeight: 600 }}
        >
          Teki
        </span>
        <button
          onClick={copy}
          style={{
            background: 'none',
            border: 'none',
            color: copied ? '#22c55e' : MUTED,
            cursor: 'pointer',
            fontSize: 12,
            transition: 'color 0.2s',
          }}
        >
          {copied ? '✓' : '⎘'}
        </button>
        <button
          onClick={onNew}
          style={{
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}33`,
            color: ACCENT,
            cursor: 'pointer',
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 4,
            fontFamily: FONT,
          }}
        >
          {shortcut}
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: DIM,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          ×
        </button>
      </div>

      <p
        style={{
          margin: 0,
          padding: '6px 8px',
          background: SURFACE,
          borderRadius: 6,
          borderLeft: `2px solid ${BORDER}`,
          fontSize: 11,
          color: MUTED,
          fontFamily: FONT,
        }}
      >
        &ldquo;{transcript}&rdquo;
      </p>

      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: TEXT,
          fontFamily: FONT,
          lineHeight: 1.6,
          maxHeight: 90,
          overflowY: 'auto',
        }}
      >
        {response.length > 200 ? `${response.slice(0, 200)}…` : response}
      </p>

      {/* Progress bar */}
      <div
        style={{ height: 2, background: BORDER, borderRadius: 1, overflow: 'hidden' }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}88)`,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
}
