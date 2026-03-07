import { useState, useEffect, useCallback } from 'react';
import PillIdle from './components/PillIdle';
import PillRecording from './components/PillRecording';
import PillTranscribing from './components/PillTranscribing';
import PillResponse from './components/PillResponse';

type State = 'idle' | 'recording' | 'transcribing' | 'responding';

const SIZES: Record<State, { w: number; h: number }> = {
  idle: { w: 280, h: 52 },
  recording: { w: 380, h: 130 },
  transcribing: { w: 380, h: 80 },
  responding: { w: 420, h: 210 },
};

const BG = '#0f1117';
const BORDER = '#1e293b';
const ACCENT = '#00d4ff';

declare global {
  interface Window {
    floatingApi: {
      resize: (width: number, height: number) => void;
      hide: () => void;
      sendToAgent: (text: string) => Promise<{ reply: string }>;
      onStartRecording: (callback: () => void) => () => void;
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

  // Listen for external start-recording command (Ctrl+D)
  useEffect(() => {
    const unsub = window.floatingApi?.onStartRecording(() => {
      setState('recording');
    });
    return () => unsub?.();
  }, []);

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
          borderRadius: state === 'idle' ? 26 : 12,
          boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px ${ACCENT}11, 0 0 24px ${ACCENT}08`,
          overflow: 'hidden',
          transition: 'border-radius 0.2s ease',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {/* Top glow line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              state !== 'idle'
                ? `linear-gradient(90deg, transparent, ${ACCENT}44, transparent)`
                : 'transparent',
            transition: 'opacity 0.3s',
          }}
        />

        {state === 'idle' && <PillIdle onStart={() => setState('recording')} onClose={handleClose} />}
        {state === 'recording' && (
          <PillRecording onTranscriptReady={handleTranscriptReady} onCancel={() => setState('idle')} />
        )}
        {state === 'transcribing' && <PillTranscribing transcript={transcript} />}
        {state === 'responding' && (
          <PillResponse
            response={response}
            transcript={transcript}
            onClose={handleClose}
            onNew={handleNewRecording}
          />
        )}
      </div>
    </div>
  );
}
