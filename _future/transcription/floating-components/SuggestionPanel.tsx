/**
 * @future TRANSCRIPTION_FEATURE
 * Arquivo isolado — não importar diretamente.
 * Ver _future/transcription/README.md para instruções de reintegração.
 * Movido em: 2026-03-16
 */

const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const GREEN = 'rgba(56, 217, 169,';

interface TekiSuggestion {
  id: string;
  title: string;
  content: string;
  actions?: Array<{ label: string; command: string }>;
}

interface Props {
  suggestion: TekiSuggestion;
  onExpand: () => void;
  onDismiss: () => void;
}

export default function SuggestionPanel({ suggestion, onExpand, onDismiss }: Props) {
  return (
    <div
      style={{
        margin: '0 12px 8px',
        borderRadius: 12,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: `${GREEN} 0.08)`,
        border: `1px solid ${GREEN} 0.25)`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13 }}>💡</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: `${GREEN} 0.9)`, fontFamily: FONT }}>
            {suggestion.title}
          </span>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', color: 'white',
            opacity: 0.4, cursor: 'pointer', fontSize: 12, flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content (2 lines max) */}
      <p
        style={{
          margin: 0, fontSize: 11, lineHeight: 1.5, fontFamily: FONT,
          color: 'rgba(255,255,255,0.65)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {suggestion.content}
      </p>

      {/* Quick actions */}
      {suggestion.actions && suggestion.actions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {suggestion.actions.slice(0, 2).map((action) => (
            <code
              key={action.command}
              style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(0,0,0,0.4)', color: `${GREEN} 0.8)`,
                fontFamily: FONT,
              }}
            >
              {action.command}
            </code>
          ))}
        </div>
      )}

      {/* Expand button */}
      <button
        onClick={onExpand}
        style={{
          width: '100%', fontSize: 11, padding: '6px 0', borderRadius: 8,
          background: `${GREEN} 0.15)`, color: `${GREEN} 0.9)`,
          border: `1px solid ${GREEN} 0.2)`, cursor: 'pointer',
          fontFamily: FONT, textAlign: 'center',
        }}
      >
        Ver detalhes completos →
      </button>
    </div>
  );
}
