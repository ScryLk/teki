import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppStore, type LayoutMode } from '@/stores/app-store';

// ─── Icon Components ───────────────────────────────────────────────────────────

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const MonitorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LayersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LayoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const MessageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v5h5" />
    <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
    <path d="M12 7v5l4 2" />
  </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const LogOutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const CompactIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </svg>
);

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

const CommandPalette: React.FC = () => {
  const toggleCommandPalette = useAppStore((s) => s.toggleCommandPalette);
  const setLayout = useAppStore((s) => s.setLayout);
  const setCaptureState = useAppStore((s) => s.setCaptureState);
  const isCapturing = useAppStore((s) => s.isCapturing);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Auto-focus search input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      toggleCommandPalette();
    }, 150);
  }, [toggleCommandPalette]);

  // Build commands list
  const commands: Command[] = useMemo(() => {
    const iconClass = 'text-text-secondary';

    return [
      // ── Captura ──
      {
        id: 'capture-now',
        label: 'Capturar tela agora',
        icon: <CameraIcon className={iconClass} />,
        group: 'Captura',
        action: () => {
          window.tekiAPI.captureNow();
          close();
        },
      },
      {
        id: 'toggle-capture',
        label: isCapturing ? 'Pausar observação' : 'Retomar observação',
        icon: isCapturing ? (
          <PauseIcon className={iconClass} />
        ) : (
          <PlayIcon className={iconClass} />
        ),
        group: 'Captura',
        action: () => {
          setCaptureState(!isCapturing);
          close();
        },
      },
      {
        id: 'switch-monitor',
        label: 'Trocar monitor',
        icon: <MonitorIcon className={iconClass} />,
        group: 'Captura',
        action: () => {
          // placeholder/future
          close();
        },
      },
      {
        id: 'change-interval',
        label: 'Alterar intervalo',
        icon: <ClockIcon className={iconClass} />,
        group: 'Captura',
        action: () => {
          // placeholder/future
          close();
        },
      },

      // ── Contexto ──
      {
        id: 'switch-system',
        label: 'Trocar sistema',
        icon: <LayersIcon className={iconClass} />,
        group: 'Contexto',
        action: () => {
          // placeholder/future
          close();
        },
      },
      {
        id: 'switch-environment',
        label: 'Trocar ambiente',
        icon: <GlobeIcon className={iconClass} />,
        group: 'Contexto',
        action: () => {
          // placeholder/future
          close();
        },
      },

      // ── Navegação ──
      {
        id: 'layout-split',
        label: 'Layout: Split',
        icon: <LayoutIcon className={iconClass} />,
        group: 'Navegação',
        action: () => {
          setLayout('split' as LayoutMode);
          close();
        },
      },
      {
        id: 'layout-chat-only',
        label: 'Layout: Chat Only',
        icon: <MessageIcon className={iconClass} />,
        group: 'Navegação',
        action: () => {
          setLayout('chat-only' as LayoutMode);
          close();
        },
      },
      {
        id: 'layout-screen-only',
        label: 'Layout: Screen Only',
        icon: <ScreenIcon className={iconClass} />,
        group: 'Navegação',
        action: () => {
          setLayout('screen-only' as LayoutMode);
          close();
        },
      },
      {
        id: 'layout-compact',
        label: 'Layout: Compact',
        icon: <CompactIcon className={iconClass} />,
        group: 'Navegação',
        action: () => {
          setLayout('compact' as LayoutMode);
          close();
        },
      },

      // ── App ──
      {
        id: 'chat-history',
        label: 'Histórico de chats',
        icon: <HistoryIcon className={iconClass} />,
        group: 'App',
        action: () => {
          // placeholder/future
          close();
        },
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: <SettingsIcon className={iconClass} />,
        group: 'App',
        action: () => {
          // placeholder/future
          close();
        },
      },
      {
        id: 'quit',
        label: 'Sair',
        icon: <LogOutIcon className={iconClass} />,
        group: 'App',
        action: () => {
          window.tekiAPI.close();
        },
      },
    ];
  }, [isCapturing, close, setCaptureState, setLayout]);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter((cmd) => cmd.label.toLowerCase().includes(lower));
  }, [commands, query]);

  // Reset selection when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands.length, query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-command-item]');
    const selectedItem = items[selectedIndex] as HTMLElement | undefined;
    selectedItem?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Build grouped structure for rendering
  const groupedCommands = useMemo(() => {
    const groups: { name: string; commands: (Command & { flatIndex: number })[] }[] = [];
    let flatIndex = 0;

    for (const cmd of filteredCommands) {
      let group = groups.find((g) => g.name === cmd.group);
      if (!group) {
        group = { name: cmd.group, commands: [] };
        groups.push(group);
      }
      group.commands.push({ ...cmd, flatIndex });
      flatIndex++;
    }

    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const cmd = filteredCommands[selectedIndex];
          if (cmd) cmd.action();
          break;
        }
        case 'Escape': {
          e.preventDefault();
          close();
          break;
        }
      }
    },
    [filteredCommands, selectedIndex, close]
  );

  // Click outside to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    },
    [close]
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden transition-all duration-150 ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2'
        }`}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <SearchIcon className="text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar comandos..."
            className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-text-muted outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-bg border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div
          ref={listRef}
          className="max-h-[360px] overflow-y-auto py-2"
        >
          {groupedCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-text-muted text-sm">
              Nenhum comando encontrado
            </div>
          )}

          {groupedCommands.map((group, groupIndex) => (
            <div key={group.name}>
              {/* Group separator - shown between groups */}
              {groupIndex > 0 && (
                <div className="mx-3 my-1 border-t border-border" />
              )}

              {/* Group label */}
              <div className="px-4 py-1.5 text-[11px] font-medium text-text-muted uppercase tracking-wider">
                {group.name}
              </div>

              {/* Commands */}
              {group.commands.map((cmd) => (
                <button
                  key={cmd.id}
                  data-command-item
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(cmd.flatIndex)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors duration-75 ${
                    cmd.flatIndex === selectedIndex
                      ? 'bg-surface-hover text-text-primary'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {cmd.icon}
                  </span>
                  <span className="flex-1 truncate">{cmd.label}</span>
                  {cmd.flatIndex === selectedIndex && (
                    <span className="flex-shrink-0 text-text-muted text-xs">
                      <ReturnIcon className="text-text-muted" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border text-[11px] text-text-muted">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono bg-bg border border-border rounded text-[10px]">
              ↑↓
            </kbd>
            navegar
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono bg-bg border border-border rounded text-[10px]">
              ↵
            </kbd>
            selecionar
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1 py-0.5 font-mono bg-bg border border-border rounded text-[10px]">
              esc
            </kbd>
            fechar
          </span>
        </div>
      </div>
    </div>
  );
};

// Small return/enter key icon shown on selected items
const ReturnIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

export default CommandPalette;
