import React, { useRef, useEffect, useState } from 'react';
import type { TranscriptionSegment } from '@teki/shared';
import SuggestionCard from './SuggestionCard';
import { useTranscription } from '@/hooks/useTranscription';

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const TranscriptionPanel: React.FC = () => {
  const {
    status, segments, suggestions, startTime,
    stop, pause, resume, reset,
  } = useTranscription();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [exportCopied, setExportCopied] = useState(false);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [segments]);

  // Timer
  useEffect(() => {
    if (status !== 'recording' || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [status, startTime]);

  const handleExport = () => {
    const text = segments
      .filter((s) => s.isFinal)
      .map((s) => `[${formatTime(s.timestamp)}] ${s.text}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setExportCopied(true);
    setTimeout(() => setExportCopied(false), 2000);
  };

  const handleStop = async () => {
    await stop();
    reset();
  };

  const finalSegments = segments.filter((s) => s.isFinal);
  const interimSegments = segments.filter((s) => !s.isFinal);
  const isActive = status === 'recording' || status === 'paused';

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={handleStop}
            className="p-1.5 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors"
            title="Voltar para seleção de fonte"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Status badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'recording' ? 'bg-red-500 animate-pulse' :
                status === 'paused' ? 'bg-yellow-500' : 'bg-text-muted'
              }`}
            />
            <span className="text-xs font-medium text-text-secondary">
              {status === 'recording' ? 'Gravando' :
               status === 'paused' ? 'Pausado' :
               status === 'error' ? 'Erro' : 'Parado'}
            </span>
          </div>

          {/* Timer */}
          <span className="text-xs text-text-muted font-mono" title="Tempo de gravação">
            {formatDuration(elapsed)}
          </span>

          {/* Segment count */}
          <span className="text-[10px] text-text-muted" title="Total de segmentos transcritos">
            {finalSegments.length} segmentos
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Pause / Resume */}
          {status === 'recording' && (
            <button
              onClick={pause}
              className="p-1.5 rounded-md text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              title="Pausar gravação"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </button>
          )}
          {status === 'paused' && (
            <button
              onClick={resume}
              className="p-1.5 rounded-md text-accent hover:bg-accent/10 transition-colors"
              title="Retomar gravação"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          )}

          {/* Stop button */}
          {isActive && (
            <button
              onClick={handleStop}
              className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
              title="Parar gravação"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          )}

          {/* Divider */}
          <div className="w-px h-4 bg-border mx-0.5" />

          {/* Toggle suggestions */}
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              showSuggestions ? 'bg-accent/10 text-accent' : 'text-text-muted hover:text-text-secondary'
            }`}
            title={showSuggestions ? 'Ocultar sugestões de IA' : 'Mostrar sugestões de IA'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="6" />
              <circle cx="12" cy="12" r="4" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className={`p-1.5 rounded-md transition-colors ${
              exportCopied ? 'text-green-400' : 'text-text-muted hover:text-text-secondary'
            }`}
            title={exportCopied ? 'Transcrição copiada!' : 'Copiar transcrição para área de transferência'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {exportCopied ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Transcription column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {finalSegments.length === 0 && interimSegments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted mb-2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <p className="text-xs text-text-muted">
                  {status === 'recording' ? 'Aguardando áudio...' :
                   status === 'paused' ? 'Gravação pausada' :
                   status === 'error' ? 'Erro na transcrição. Tente novamente.' :
                   'Selecione uma fonte para iniciar'}
                </p>
              </div>
            ) : (
              <>
                {finalSegments.map((segment) => (
                  <SegmentRow key={segment.id} segment={segment} />
                ))}
                {interimSegments.map((segment) => (
                  <SegmentRow key={segment.id} segment={segment} interim />
                ))}
              </>
            )}
          </div>
        </div>

        {/* Suggestions sidebar */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="w-64 border-l border-border overflow-y-auto p-3 space-y-2 flex-shrink-0">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              Sugestões IA
            </div>
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} onCopy={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Segment row ───────────────────────────────────────────────────
const SegmentRow: React.FC<{ segment: TranscriptionSegment; interim?: boolean }> = ({ segment, interim }) => (
  <div className={`flex gap-2 ${interim ? 'opacity-50' : ''}`}>
    <span className="text-[10px] text-text-muted font-mono flex-shrink-0 pt-0.5">
      {formatTime(segment.timestamp)}
    </span>
    <p className={`text-xs leading-relaxed ${interim ? 'italic text-text-muted' : 'text-text-secondary'}`}>
      {segment.text}
    </p>
  </div>
);

export default TranscriptionPanel;
