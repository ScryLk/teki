import type { VoiceSuggestion } from '@teki/shared';

const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const MUTED = '#64748b';
const BORDER = '#1e293b';
const SURFACE = '#161b27';
const LIVE = '#f31260';
const SUCCESS = '#17c964';
const WARNING = '#f5a524';

interface ListeningPillProps {
  suggestion: VoiceSuggestion | null;
  hasBadge: boolean;
  onExpandBadge: () => void;
  onDismissSuggestion: () => void;
  onStop: () => void;
}

function classificationColor(classification: VoiceSuggestion['classification']): string {
  if (classification === 'BASE_LOCAL') return SUCCESS;
  if (classification === 'INFERIDO') return WARNING;
  return MUTED;
}

// Persistent transparency indicator ("Teki está ouvindo") + non-intrusive
// suggestion surface. Pushed cards expand below the indicator; INFERIDO only
// shows a discreet badge the technician expands — speech is never interrupted.
export default function ListeningPill({
  suggestion,
  hasBadge,
  onExpandBadge,
  onDismissSuggestion,
  onStop,
}: ListeningPillProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Indicator row — always visible while capturing */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 16px',
          minHeight: 52,
          // @ts-expect-error electron webkit
          WebkitAppRegion: 'drag',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: LIVE,
            flexShrink: 0,
            animation: 'tekiPulse 1.4s ease-in-out infinite',
          }}
        />
        <span style={{ flex: 1, fontSize: 11, color: '#e2e8f0', fontFamily: FONT }}>
          Teki está ouvindo
        </span>

        {hasBadge && !suggestion && (
          <button
            onClick={onExpandBadge}
            title="O Teki tem uma ideia — clique para ver"
            style={{
              // @ts-expect-error electron webkit
              WebkitAppRegion: 'no-drag',
              padding: '3px 8px',
              borderRadius: 999,
              border: `1px solid ${WARNING}55`,
              background: `${WARNING}15`,
              color: WARNING,
              cursor: 'pointer',
              fontSize: 10,
              fontFamily: FONT,
            }}
          >
            💡 tenho uma ideia
          </button>
        )}

        <button
          onClick={onStop}
          title="Parar escuta"
          style={{
            // @ts-expect-error electron webkit
            WebkitAppRegion: 'no-drag',
            padding: '3px 10px',
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: 'transparent',
            color: MUTED,
            cursor: 'pointer',
            fontSize: 10,
            fontFamily: FONT,
          }}
        >
          ■ parar
        </button>
      </div>

      {/* Suggestion card (pushed automatically or expanded from the badge) */}
      {suggestion && (
        <div
          style={{
            margin: '0 12px 12px',
            padding: '10px 12px',
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            background: SURFACE,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: FONT,
                fontWeight: 700,
                color: classificationColor(suggestion.classification),
              }}
            >
              {suggestion.confidenceLabel} {suggestion.confidencePercentage}%
            </span>
            <span style={{ fontSize: 9, color: MUTED, fontFamily: FONT, flex: 1 }}>
              · STT {suggestion.sttOrigin === 'cloud' ? 'em nuvem (opt-in)' : 'local'}
            </span>
            <button
              onClick={onDismissSuggestion}
              style={{
                background: 'transparent',
                border: 'none',
                color: MUTED,
                cursor: 'pointer',
                fontSize: 13,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              fontSize: 11,
              color: '#cbd5e1',
              fontFamily: FONT,
              lineHeight: 1.55,
              overflowY: 'auto',
              flex: 1,
              whiteSpace: 'pre-wrap',
            }}
          >
            {suggestion.text}
          </div>

          {suggestion.sources.length > 0 && (
            <div style={{ fontSize: 9, color: MUTED, fontFamily: FONT }}>
              Fontes: {suggestion.sources.slice(0, 3).join(' · ')}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes tekiPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
