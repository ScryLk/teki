import React from 'react';
import { useAppStore } from '@/stores/app-store';

const MAX_WINDOW_TITLE_LENGTH = 60;

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + '\u2026';
}

const StatusBar: React.FC = () => {
  const isCapturing = useAppStore((s) => s.isCapturing);
  const catState = useAppStore((s) => s.catState);
  const activeWindow = useAppStore((s) => s.activeWindow);
  const connectionStatus = useAppStore((s) => s.connectionStatus);

  // Derive observation status from capture state and cat state
  const getStatusInfo = (): { label: string; dotClass: string } => {
    if (catState === 'sleeping') {
      return { label: 'Dormindo', dotClass: 'bg-text-muted' };
    }
    if (isCapturing) {
      return { label: 'Observando', dotClass: 'bg-success' };
    }
    return { label: 'Pausado', dotClass: 'bg-warning' };
  };

  const { label, dotClass } = getStatusInfo();

  return (
    <div
      className="flex items-center justify-between bg-surface border-t border-border px-3 font-mono select-none"
      style={{ height: 32, minHeight: 32, fontSize: 12 }}
    >
      {/* Left items */}
      <div className="flex items-center gap-4 text-text-muted min-w-0">
        {/* Observation status */}
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${dotClass}`}
          />
          <span>{label}</span>
        </div>

        {/* Active window title */}
        {activeWindow && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-border">|</span>
            <span className="truncate" title={activeWindow.title}>
              {truncate(activeWindow.title, MAX_WINDOW_TITLE_LENGTH)}
            </span>
          </div>
        )}
      </div>

      {/* Right items */}
      <div className="flex items-center gap-1.5 text-text-muted flex-shrink-0">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            connectionStatus === 'online' ? 'bg-success' : 'bg-error'
          }`}
        />
        <span>
          {connectionStatus === 'online' ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
