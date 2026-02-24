import React from 'react';
import { useAppStore } from '@/stores/app-store';

const TitleBar: React.FC = () => {
  const isCapturing = useAppStore((s) => s.isWatching);
  const setWatching = useAppStore((s) => s.setWatching);
  const setCatState = useAppStore((s) => s.setCatState);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  const triggerWindowSelector = useAppStore((s) => s.triggerWindowSelector);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const setSettingsPageOpen = useAppStore((s) => s.setSettingsPageOpen);

  const handlePlayPauseClick = React.useCallback(async () => {
    if (isCapturing) {
      await window.tekiAPI.stopWatching();
      setWatching(false);
      setCatState('idle');
    } else {
      triggerWindowSelector();
    }
  }, [isCapturing, setWatching, setCatState, triggerWindowSelector]);

  return (
    <div
      className="drag-region flex items-center bg-surface border-b border-border select-none"
      style={{ height: 40, minHeight: 40 }}
    >
      {/* Left: space reserved for macOS traffic lights (x:16, width ~70px) */}
      <div style={{ width: 80, minWidth: 80 }} />

      {/* Center: command palette trigger */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={toggleCommandPalette}
          className="no-drag flex items-center gap-2 px-3 py-1 rounded-md bg-bg border border-border
                     text-text-muted text-xs hover:border-accent hover:text-text-secondary
                     transition-colors cursor-pointer"
          style={{ minWidth: 220 }}
        >
          <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
            ⌘K
          </kbd>
          <span>Buscar comandos...</span>
        </button>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-1 pr-2 no-drag">
        {/* Capture status indicator */}
        <button
          onClick={handlePlayPauseClick}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover transition-colors"
          title={isCapturing ? 'Parar observação' : 'Selecionar janela'}
        >
          {isCapturing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Settings gear icon — opens full-page settings */}
        <button
          onClick={() => setSettingsPageOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover transition-colors text-text-muted hover:text-text-secondary"
          title="Configurações"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Connection status dot */}
        <div
          className="flex items-center justify-center w-8 h-8"
          title={connectionStatus === 'online' ? 'Conectado' : 'Desconectado'}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              connectionStatus === 'online' ? 'bg-success' : 'bg-error'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
