import React, { useState, useEffect } from 'react';
import { useScreenCapture } from '@/hooks/useScreenCapture';

const INTERVAL_OPTIONS = [3, 5, 10, 30] as const;

const PlayIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 2.5v11l10-5.5L4 2.5z" />
  </svg>
);

const PauseIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="3" y="2" width="4" height="12" rx="1" />
    <rect x="9" y="2" width="4" height="12" rx="1" />
  </svg>
);

const CameraIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 4a1 1 0 011-1h2.382a1 1 0 01.894.553L6.724 4.5H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
    <circle cx="8" cy="8.5" r="2.5" fill="#09090b" />
  </svg>
);

const CaptureControls: React.FC = () => {
  const {
    sources,
    isCapturing,
    captureInterval,
    startCapture,
    stopCapture,
    captureNow,
    loadSources,
  } = useScreenCapture();

  const [selectedSource, setSelectedSource] = useState<string>('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);

  // Select the first source by default when sources load
  useEffect(() => {
    if (sources.length > 0 && !selectedSource) {
      setSelectedSource(sources[0].id);
    }
  }, [sources, selectedSource]);

  const handleToggleCapture = () => {
    if (isCapturing) {
      stopCapture();
    } else {
      const sourceId = selectedSource || sources[0]?.id;
      if (sourceId) {
        startCapture(sourceId, captureInterval);
      }
    }
  };

  const handleIntervalChange = (interval: number) => {
    if (isCapturing && selectedSource) {
      // Restart capture with new interval
      stopCapture();
      startCapture(selectedSource, interval);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
    setShowSourceDropdown(false);
    if (isCapturing) {
      stopCapture();
      startCapture(sourceId, captureInterval);
    }
  };

  const handleSourceDropdownToggle = () => {
    if (!showSourceDropdown) {
      loadSources();
    }
    setShowSourceDropdown((prev) => !prev);
  };

  const selectedSourceName =
    sources.find((s) => s.id === selectedSource)?.name ?? 'Selecionar fonte';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-surface/80 backdrop-blur-md rounded-xl border border-border shadow-lg">
        {/* Play / Pause */}
        <button
          onClick={handleToggleCapture}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-text-primary transition-colors hover:bg-accent hover:text-white"
          title={isCapturing ? 'Pausar captura' : 'Iniciar captura'}
        >
          {isCapturing ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Interval selector */}
        <div className="flex items-center gap-1">
          {INTERVAL_OPTIONS.map((interval) => (
            <button
              key={interval}
              onClick={() => handleIntervalChange(interval)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                captureInterval === interval
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
              title={`Intervalo de ${interval}s`}
            >
              {interval}s
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Capture now */}
        <button
          onClick={captureNow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-text-primary transition-colors hover:bg-accent hover:text-white"
          title="Capturar agora"
        >
          <CameraIcon />
          <span>Capturar agora</span>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Source selector */}
        <div className="relative">
          <button
            onClick={handleSourceDropdownToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary max-w-[160px]"
            title="Selecionar fonte de captura"
          >
            <span className="truncate">{selectedSourceName}</span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="currentColor"
              className={`shrink-0 transition-transform ${showSourceDropdown ? 'rotate-180' : ''}`}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {showSourceDropdown && (
            <div className="absolute bottom-full left-0 mb-2 w-64 bg-surface border border-border rounded-lg shadow-xl overflow-hidden">
              <div className="max-h-48 overflow-y-auto">
                {sources.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-text-muted">
                    Nenhuma fonte encontrada
                  </div>
                ) : (
                  sources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleSourceSelect(source.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                        source.id === selectedSource
                          ? 'bg-accent-light text-accent'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      {source.thumbnail && (
                        <img
                          src={source.thumbnail}
                          alt=""
                          className="w-8 h-5 object-cover rounded border border-border shrink-0"
                        />
                      )}
                      <span className="truncate">{source.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptureControls;
