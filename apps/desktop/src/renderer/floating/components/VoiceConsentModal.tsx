const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const ACCENT = '#00d4ff';
const MUTED = '#64748b';
const BORDER = '#1e293b';

interface VoiceConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function VoiceConsentModal({ onAccept, onDecline }: VoiceConsentModalProps) {
  return (
    <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>🎧</span>
        <span style={{ fontSize: 12, color: '#e2e8f0', fontFamily: FONT, fontWeight: 600, flex: 1 }}>
          Permitir que o Teki escute a chamada?
        </span>
      </div>

      <div style={{ fontSize: 11, color: MUTED, fontFamily: FONT, lineHeight: 1.6, flex: 1, overflowY: 'auto' }}>
        <p style={{ margin: '0 0 8px' }}>
          O Teki vai ouvir o áudio da chamada (a voz do relator) para sugerir
          soluções da base de conhecimento em tempo real.
        </p>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          <li>O áudio é processado em memória e <strong style={{ color: '#94a3b8' }}>nunca é gravado</strong>.</li>
          <li>Um indicador “Teki está ouvindo” fica sempre visível.</li>
          <li>Você pode parar a escuta a qualquer momento com 1 clique.</li>
          <li>O consentimento fica registrado e pode ser revogado nas configurações.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onDecline}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${BORDER}`,
            background: 'transparent',
            color: MUTED,
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: FONT,
          }}
        >
          Agora não
        </button>
        <button
          onClick={onAccept}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: `1px solid ${ACCENT}44`,
            background: `${ACCENT}15`,
            color: ACCENT,
            cursor: 'pointer',
            fontSize: 11,
            fontFamily: FONT,
            fontWeight: 600,
          }}
        >
          Permitir e ativar
        </button>
      </div>
    </div>
  );
}
