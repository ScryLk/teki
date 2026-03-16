import { useState, useEffect, useCallback } from 'react';
import PillIdle from './components/PillIdle';
import PillRecording from './components/PillRecording';
import PillResponse from './components/PillResponse';

type State = 'idle' | 'no-window' | 'recording' | 'transcribing' | 'responding';

const SIZES: Record<State, { w: number; h: number }> = {
  idle: { w: 280, h: 52 },
  'no-window': { w: 380, h: 80 },
  recording: { w: 380, h: 90 },
  transcribing: { w: 380, h: 80 },
  responding: { w: 420, h: 210 },
};

const isMac = navigator.platform.toUpperCase().includes('MAC');
const SHORTCUT = isMac ? '⌘ + D' : 'Ctrl + D';

const BG = '#0f1117';
const BORDER = '#1e293b';
const ACCENT = '#00d4ff';
const MUTED = '#64748b';
const FONT = "'JetBrains Mono', 'Fira Code', monospace";

declare global {
  interface Window {
    floatingApi: {
      resize: (width: number, height: number) => void;
      hide: () => void;
      sendToAgent: (text: string) => Promise<{ reply: string }>;
      isWatching: () => Promise<boolean>;
      onStartRecording: (callback: () => void) => () => void;
      expandToMain: () => void;
    };
  }
}

export default function FloatingApp() {
  const [state, setState] = useState<State>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  // Resize window when state changes
  useEffect(() => {
    const { w, h } = SIZES[state];
    window.floatingApi?.resize(w, h);
  }, [state]);

  // Listen for external start-recording command (Cmd+D / Ctrl+D)
  useEffect(() => {
    const unsub = window.floatingApi?.onStartRecording(async () => {
      const watching = await window.floatingApi?.isWatching();
      if (watching) {
        setState('recording');
      } else {
        setState('no-window');
      }
    });
    return () => unsub?.();
  }, []);

  // ── Callbacks ──

  const handleTranscriptReady = useCallback(async (text: string) => {
    setTranscript(text);
    setState('transcribing');

    try {
      const result = await window.floatingApi?.sendToAgent(text);
      setResponse(result?.reply ?? 'Sem resposta.');
    } catch {
      setResponse('Erro ao processar sua pergunta.');
    }
    setState('responding');
  }, []);

  const handleClose = useCallback(() => {
    setState('idle');
    setTranscript('');
    setResponse('');
    window.floatingApi?.hide();
  }, []);

  const handleNewRecording = useCallback(() => {
    setTranscript('');
    setResponse('');
    setState('recording');
  }, []);

  const handleDismiss = useCallback(() => {
    setState('idle');
    setTranscript('');
    setResponse('');
  }, []);

  const handleSelectWindow = useCallback(() => {
    window.floatingApi?.expandToMain();
    setState('idle');
  }, []);

  return (
    <div
      style={{
        background: 'transparent',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          background: BG,
          border: `1px solid ${BORDER}`,
          borderRadius: state === 'idle' ? 9999 : 20,
          overflow: 'hidden',
          transition: 'border-radius 0.2s ease',
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top glow line */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 1,
            background: state !== 'idle'
              ? `linear-gradient(90deg, transparent, ${ACCENT}44, transparent)`
              : 'transparent',
            transition: 'opacity 0.3s',
            zIndex: 1,
          }}
        />

        {state === 'idle' && <PillIdle onClose={handleClose} shortcut={SHORTCUT} />}

        {state === 'no-window' && (
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT, flex: 1 }}>
                Nenhuma janela monitorada
              </span>
              <button
                onClick={() => setState('idle')}
                style={{
                  background: 'transparent', border: 'none',
                  color: MUTED, cursor: 'pointer', fontSize: 13,
                }}
              >
                ✕
              </button>
            </div>
            <button
              onClick={handleSelectWindow}
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
              Selecionar janela
            </button>
          </div>
        )}

        {state === 'recording' && (
          <PillRecording onTranscriptReady={handleTranscriptReady} onCancel={() => setState('idle')} />
        )}
        {state === 'transcribing' && (
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 16, height: 16, flexShrink: 0,
                border: `2px solid ${BORDER}`, borderTopColor: ACCENT,
                borderRadius: '50%', animation: 'tekiSpin 0.7s linear infinite',
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: MUTED, fontFamily: FONT }}>Processando...</p>
              <p style={{
                margin: '2px 0 0', fontSize: 12, color: '#94a3b8', fontFamily: FONT,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          </div>
        )}
        {state === 'responding' && (
          <PillResponse
            response={response}
            transcript={transcript}
            onClose={handleClose}
            onNew={handleNewRecording}
            onDismiss={handleDismiss}
            shortcut={SHORTCUT}
          />
        )}
      </div>
    </div>
  );
}
