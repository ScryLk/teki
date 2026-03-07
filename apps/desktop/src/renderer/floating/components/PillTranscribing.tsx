const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const ACCENT = '#00d4ff';
const BORDER = '#1e293b';
const MUTED = '#64748b';

interface PillTranscribingProps {
  transcript: string;
}

export default function PillTranscribing({ transcript }: PillTranscribingProps) {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 16,
          height: 16,
          flexShrink: 0,
          border: `2px solid ${BORDER}`,
          borderTopColor: ACCENT,
          borderRadius: '50%',
          animation: 'tekiSpin 0.7s linear infinite',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, color: MUTED, fontFamily: FONT }}>Processando...</p>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 12,
            color: '#94a3b8',
            fontFamily: FONT,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          &ldquo;{transcript}&rdquo;
        </p>
      </div>
    </div>
  );
}
