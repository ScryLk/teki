import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

const StatusBar: React.FC = () => {
  const isWatching = useAppStore((s) => s.isWatching);
  const watchStartTime = useAppStore((s) => s.watchStartTime);
  const connectionStatus = useAppStore((s) => s.connectionStatus);

  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!isWatching || watchStartTime === null) {
      setElapsed(0);
      return;
    }

    setElapsed(Date.now() - watchStartTime);

    const id = setInterval(() => {
      setElapsed(Date.now() - watchStartTime);
    }, 1000);

    return () => clearInterval(id);
  }, [isWatching, watchStartTime]);

  return (
    <div
      className="flex items-center justify-between bg-surface border-t border-border px-3 font-mono select-none"
      style={{ height: 32, minHeight: 32, fontSize: 12 }}
    >
      {/* Left: watch timer or idle state */}
      <div className="flex items-center gap-1.5 text-text-muted min-w-0">
        {isWatching ? (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-success animate-pulse shrink-0" />
            <span>Inspecionando há <span className="text-text-secondary">{formatElapsed(elapsed)}</span></span>
          </>
        ) : (
          <>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-text-muted shrink-0" />
            <span>Inativo</span>
          </>
        )}
      </div>

      {/* Right: connection status */}
      <div className="flex items-center gap-1.5 text-text-muted flex-shrink-0">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            connectionStatus === 'online' ? 'bg-success' : 'bg-error'
          }`}
        />
        <span>{connectionStatus === 'online' ? 'Conectado' : 'Desconectado'}</span>
      </div>
    </div>
  );
};

export default StatusBar;
