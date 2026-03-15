import React, { useState, useEffect } from 'react';
import type { AudioSource } from '@teki/shared';

interface WindowPickerProps {
  onSelect: (source: AudioSource) => void;
}

const CALL_APPS = ['meet', 'zoom', 'teams', 'discord', 'skype', 'webex', 'slack'];

const WindowPicker: React.FC<WindowPickerProps> = ({ onSelect }) => {
  const [sources, setSources] = useState<AudioSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const result = await window.tekiAPI.transcriptionGetSources();
      setSources(result);
    } catch {
      setSources([]);
    }
    setLoading(false);
  };

  const filtered = sources.filter((s) => {
    const name = s.name.toLowerCase();
    if (filter) return name.includes(filter.toLowerCase());
    // Show call apps first, then all
    return true;
  });

  // Sort: call apps first
  const sorted = [...filtered].sort((a, b) => {
    const aIsCall = CALL_APPS.some((app) => a.name.toLowerCase().includes(app));
    const bIsCall = CALL_APPS.some((app) => b.name.toLowerCase().includes(app));
    if (aIsCall && !bIsCall) return -1;
    if (!aIsCall && bIsCall) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-1">
          Selecione a fonte de áudio
        </h3>
        <p className="text-xs text-text-muted mb-3">
          Escolha a janela da chamada para iniciar a transcrição
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Filtrar janelas..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-bg border border-border
                       text-text-primary placeholder:text-text-muted
                       focus:outline-none focus:border-accent/50"
          />
          <button
            onClick={loadSources}
            className="px-3 py-1.5 rounded-lg text-xs bg-bg border border-border
                       text-text-secondary hover:text-text-primary hover:border-accent/40
                       transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      {/* Source grid */}
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-xs text-text-muted">Carregando fontes...</div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <div className="text-xs text-text-muted">Nenhuma fonte encontrada</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1">
          {sorted.map((source) => {
            const isCallApp = CALL_APPS.some((app) => source.name.toLowerCase().includes(app));
            return (
              <button
                key={source.id}
                onClick={() => onSelect(source)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border
                           transition-all text-left group
                           ${isCallApp
                             ? 'border-accent/30 bg-accent/5 hover:bg-accent/10 hover:border-accent/50'
                             : 'border-border bg-surface hover:bg-surface-hover hover:border-accent/30'
                           }`}
              >
                {source.thumbnail ? (
                  <img
                    src={source.thumbnail}
                    alt={source.name}
                    className="w-full h-20 object-cover rounded-lg bg-bg"
                  />
                ) : (
                  <div className="w-full h-20 rounded-lg bg-bg flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted">
                      {source.type === 'screen' ? (
                        <>
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </>
                      ) : (
                        <>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                        </>
                      )}
                    </svg>
                  </div>
                )}
                <div className="w-full">
                  <div className="text-[11px] font-medium text-text-primary truncate">
                    {source.name}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {source.type === 'screen' ? 'Tela inteira' : 'Janela'}
                    {isCallApp && (
                      <span className="ml-1 text-accent">• Chamada</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WindowPicker;
