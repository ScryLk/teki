import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { DevCatWrapper } from '@/components/cat/DevCatWrapper';
import type { WindowSource } from '@teki/shared';

type ViewerState = 'idle' | 'selecting' | 'watching' | 'closed';

const ScreenViewer: React.FC = () => {
  const catState = useAppStore((s) => s.catState);
  const isWatching = useAppStore((s) => s.isWatching);
  const setWatching = useAppStore((s) => s.setWatching);
  const setCurrentFrame = useAppStore((s) => s.setCurrentFrame);
  const setCatState = useAppStore((s) => s.setCatState);
  const requestWindowSelector = useAppStore((s) => s.requestWindowSelector);
  const clearWindowSelector = useAppStore((s) => s.clearWindowSelector);

  const [viewerState, setViewerState] = useState<ViewerState>('idle');
  const [availableWindows, setAvailableWindows] = useState<WindowSource[]>([]);
  const [currentFrame, setLocalFrame] = useState<string | null>(null);
  const [windowName, setWindowName] = useState<string>('');
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  const fetchWindows = useCallback(async () => {
    setIsLoadingSources(true);
    try {
      const windows = await window.tekiAPI.getAvailableWindows();
      setAvailableWindows(windows);
    } finally {
      setIsLoadingSources(false);
    }
  }, []);

  const openSelector = useCallback(async () => {
    setViewerState('selecting');
    await fetchWindows();
  }, [fetchWindows]);

  const selectWindow = useCallback(
    async (source: WindowSource) => {
      setWindowName(source.name);
      setViewerState('watching');
      setWatching(true, source.name);
      setCatState('watching');
      await window.tekiAPI.startWatching(source.id);
    },
    [setWatching, setCatState]
  );

  const stopWatching = useCallback(async () => {
    await window.tekiAPI.stopWatching();
    setWatching(false);
    setLocalFrame(null);
    setCurrentFrame(null);
    setCatState('idle');
    setViewerState('idle');
  }, [setWatching, setCurrentFrame, setCatState]);

  useEffect(() => {
    const unsubFrame = window.tekiAPI.onWindowFrame((frame) => {
      setLocalFrame(frame.image);
      setCurrentFrame(frame.image);
      if (frame.windowName !== windowName) {
        setWindowName(frame.windowName);
      }
    });

    const unsubClosed = window.tekiAPI.onWindowClosed(() => {
      setWatching(false);
      setLocalFrame(null);
      setCurrentFrame(null);
      setCatState('alert');
      setViewerState('closed');
    });

    return () => {
      unsubFrame();
      unsubClosed();
    };
  }, [windowName, setWatching, setCurrentFrame, setCatState]);

  // Sync local state when watching is stopped externally (e.g. TitleBar pause button)
  useEffect(() => {
    if (!isWatching && viewerState === 'watching') {
      setLocalFrame(null);
      setCurrentFrame(null);
      setViewerState('idle');
    }
  }, [isWatching, viewerState, setCurrentFrame]);

  // Open window selector when triggered from TitleBar play button
  useEffect(() => {
    if (requestWindowSelector) {
      clearWindowSelector();
      openSelector();
    }
  }, [requestWindowSelector, clearWindowSelector, openSelector]);

  // Handle tray menu actions: "Trocar janela" and "Pausar monitoramento"
  useEffect(() => {
    const unsubSelect = window.tekiAPI.onTraySelectWindow(() => openSelector());
    const unsubStop = window.tekiAPI.onTrayStopWatching(() => stopWatching());
    return () => {
      unsubSelect();
      unsubStop();
    };
  }, [openSelector, stopWatching]);

  useEffect(() => {
    return () => {
      window.tekiAPI.stopWatching();
    };
  }, []);

  if (viewerState === 'idle') {
    return (
      <div className="relative w-full h-full bg-bg overflow-hidden flex flex-col items-center justify-center gap-5">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-surface border border-border">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-text-muted">
            <rect x="4" y="8" width="32" height="22" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M14 34h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 30v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 19h16M12 23h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
        <div className="text-center space-y-1.5">
          <p className="text-sm font-medium text-text-secondary">Nenhuma janela selecionada</p>
          <p className="text-xs text-text-muted max-w-[220px]">
            Selecione uma janela para o Teki começar a observar.
          </p>
        </div>
        <button
          onClick={openSelector}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          Selecionar janela
        </button>
        <DevCatWrapper state={catState} size="md" />
      </div>
    );
  }

  if (viewerState === 'selecting') {
    return (
      <div className="relative w-full h-full bg-bg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface flex-shrink-0">
          <span className="text-sm font-medium text-text-primary">
            Selecione a janela para observar
          </span>
          <button
            onClick={() => setViewerState('idle')}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Cancelar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingSources ? (
            <div className="flex items-center justify-center h-32 text-text-muted text-sm">
              Carregando janelas...
            </div>
          ) : availableWindows.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-text-muted text-sm">
              Nenhuma janela encontrada
            </div>
          ) : (
            availableWindows.map((win) => (
              <button
                key={win.id}
                onClick={() => selectWindow(win)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-surface border border-border hover:border-accent/40 hover:bg-surface-hover transition-all text-left"
              >
                <img
                  src={win.thumbnail}
                  alt={win.name}
                  className="w-16 h-10 object-cover rounded border border-border shrink-0 bg-bg"
                />
                <div className="flex items-center gap-2 min-w-0">
                  {win.appIcon && (
                    <img src={win.appIcon} alt="" className="w-4 h-4 shrink-0" />
                  )}
                  <span className="text-xs text-text-secondary truncate">{win.name}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex-shrink-0 flex justify-center px-3 py-2.5 border-t border-border bg-surface">
          <button
            onClick={fetchWindows}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs text-text-muted
                       hover:text-accent hover:bg-surface-hover transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Atualizar lista
          </button>
        </div>
      </div>
    );
  }

  if (viewerState === 'watching') {
    return (
      <div className="relative w-full h-full bg-bg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
            <span className="text-xs text-text-muted shrink-0">Observando:</span>
            <span className="text-xs text-text-primary font-medium truncate">{windowName}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openSelector}
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              Trocar
            </button>
            <button
              onClick={stopWatching}
              className="text-xs text-text-muted hover:text-error transition-colors"
            >
              ✕ Parar
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 bg-bg">
          {currentFrame ? (
            <img
              src={currentFrame}
              alt={`Preview: ${windowName}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              draggable={false}
            />
          ) : (
            <p className="text-sm text-text-muted">Aguardando captura...</p>
          )}
        </div>

        <DevCatWrapper state={catState} size="md" />
      </div>
    );
  }

  // closed state
  return (
    <div className="relative w-full h-full bg-bg overflow-hidden flex flex-col items-center justify-center gap-5">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 border border-warning/20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <p className="text-sm text-text-secondary text-center">
        A janela <span className="font-medium text-text-primary">"{windowName}"</span> foi fechada.
      </p>
      <button
        onClick={openSelector}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        Selecionar outra janela
      </button>
      <DevCatWrapper state={catState} size="md" />
    </div>
  );
};

export default ScreenViewer;
