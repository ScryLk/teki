import { useEffect, useRef, useState, useCallback } from 'react';

const FONT = "'JetBrains Mono', 'Fira Code', monospace";
const ACCENT = '#00d4ff';
const MUTED = '#64748b';
const SURFACE = '#161b27';
const BORDER = '#1e293b';

interface PillRecordingProps {
  onTranscriptReady: (text: string) => void;
  onCancel: () => void;
}

export default function PillRecording({ onTranscriptReady, onCancel }: PillRecordingProps) {
  const [inputText, setInputText] = useState('');
  const [speechAvailable, setSpeechAvailable] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Try Web Speech API
    const SR = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (SR) {
      try {
        const rec = new SR();
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: SpeechRecognitionEvent) => {
          let text = '';
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          if (text.trim()) {
            setInputText(text.trim());
            setSpeechAvailable(true);
          }
        };
        rec.onerror = (e) => {
          console.warn('[Floating] Speech API not available:', e.error);
        };
        rec.start();
        recognitionRef.current = rec;
      } catch {
        console.warn('[Floating] Speech API failed to start');
      }
    }

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 200);

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    recognitionRef.current?.stop();
    onTranscriptReady(text);
  }, [inputText, onTranscriptReady]);

  return (
    <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: speechAvailable ? ACCENT : '#ef4444',
            boxShadow: speechAvailable ? `0 0 8px ${ACCENT}88` : '0 0 8px #ef444488',
            animation: 'tekiPulse 1s infinite',
          }}
        />
        <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: FONT }}>
          {speechAvailable ? 'Ouvindo...' : 'Fale ou digite'}
        </span>
        <button
          onClick={onCancel}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: MUTED,
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          ref={inputRef}
          autoFocus
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder={speechAvailable ? 'Ou digite aqui...' : 'Digite sua pergunta...'}
          style={{
            flex: 1,
            padding: '5px 10px',
            borderRadius: 6,
            border: `1px solid ${BORDER}`,
            background: SURFACE,
            color: '#e2e8f0',
            fontSize: 11,
            fontFamily: FONT,
            outline: 'none',
            // @ts-expect-error electron webkit
            WebkitAppRegion: 'no-drag',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          style={{
            fontSize: 10,
            padding: '5px 12px',
            borderRadius: 6,
            border: `1px solid ${ACCENT}44`,
            background: inputText.trim() ? ACCENT : `${ACCENT}15`,
            color: inputText.trim() ? '#0f1117' : ACCENT,
            cursor: inputText.trim() ? 'pointer' : 'default',
            fontFamily: FONT,
            fontWeight: 600,
            opacity: inputText.trim() ? 1 : 0.5,
            // @ts-expect-error electron webkit
            WebkitAppRegion: 'no-drag',
          }}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
