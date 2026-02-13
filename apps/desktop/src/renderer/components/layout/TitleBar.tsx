import React, { useCallback, useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';

const TitleBar: React.FC = () => {
  const isCapturing = useAppStore((s) => s.isCapturing);
  const connectionStatus = useAppStore((s) => s.connectionStatus);
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);

  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.tekiAPI.isMaximized().then(setIsMaximized);
  }, []);

  const handleMinimize = useCallback(() => {
    window.tekiAPI.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    window.tekiAPI.maximize();
    const maximized = await window.tekiAPI.isMaximized();
    setIsMaximized(maximized);
  }, []);

  const handleClose = useCallback(() => {
    window.tekiAPI.close();
  }, []);

  return (
    <div
      className="drag-region flex items-center justify-between bg-surface border-b border-border select-none"
      style={{ height: 40, minHeight: 40 }}
    >
      {/* Left: Logo + App name */}
      <div className="flex items-center gap-2 pl-3 no-drag">
        <span className="text-base leading-none" role="img" aria-label="cat">
          🐱
        </span>
        <span className="text-sm font-semibold text-text-primary tracking-wide">
          Teki
        </span>
      </div>

      {/* Center: Command palette trigger */}
      <button
        onClick={toggleCommandPalette}
        className="no-drag flex items-center gap-2 px-3 py-1 rounded-md bg-bg border border-border
                   text-text-muted text-xs hover:border-accent hover:text-text-secondary
                   transition-colors cursor-pointer"
        style={{ minWidth: 240 }}
      >
        <kbd className="inline-flex items-center gap-0.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
          Ctrl+K
        </kbd>
        <span>Buscar comandos...</span>
      </button>

      {/* Right: Status indicators + Window controls */}
      <div className="flex items-center gap-1 pr-1 no-drag">
        {/* Capture status indicator */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover transition-colors"
          title={isCapturing ? 'Capturando' : 'Pausado'}
        >
          {isCapturing ? (
            // Pause icon
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-success"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            // Play icon
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-muted"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        {/* Settings gear icon */}
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-surface-hover transition-colors text-text-muted hover:text-text-secondary"
          title="Configuracoes"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* Window controls */}
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-[46px] h-8 rounded hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary"
          title="Minimizar"
        >
          <svg width="10" height="1" viewBox="0 0 10 1">
            <rect
              width="10"
              height="1"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-[46px] h-8 rounded hover:bg-surface-hover transition-colors text-text-muted hover:text-text-primary"
          title={isMaximized ? 'Restaurar' : 'Maximizar'}
        >
          {isMaximized ? (
            // Restore icon (overlapping squares)
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect
                x="2"
                y="2"
                width="6.5"
                height="6.5"
                stroke="currentColor"
                strokeWidth="1"
              />
              <path
                d="M3.5 2V0.5H10V7H8.5"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
              />
            </svg>
          ) : (
            // Maximize icon (single square)
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect
                x="0.5"
                y="0.5"
                width="9"
                height="9"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          )}
        </button>

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-[46px] h-8 rounded hover:bg-error transition-colors text-text-muted hover:text-text-primary"
          title="Fechar"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line
              x1="1"
              y1="1"
              x2="9"
              y2="9"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <line
              x1="9"
              y1="1"
              x2="1"
              y2="9"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
