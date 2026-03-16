import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import type { ServiceStatus } from '@teki/shared';

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

function statusDotClass(status: ServiceStatus): string {
  switch (status) {
    case 'online': return 'bg-success';
    case 'degraded': return 'bg-amber-400';
    case 'offline': return 'bg-error';
    case 'checking': return 'bg-text-muted animate-pulse';
  }
}

function overallLabel(internet: ServiceStatus, backend: ServiceStatus, openclaw: ServiceStatus): string {
  if (internet === 'offline') return 'Sem internet';
  if (backend === 'offline') return 'Backend offline';
  if (openclaw === 'offline') return 'Canais offline';
  if (openclaw === 'degraded') return 'Canais parciais';
  if (internet === 'checking' || backend === 'checking') return 'Verificando...';
  return 'Conectado';
}

function overallDotClass(internet: ServiceStatus, backend: ServiceStatus, openclaw: ServiceStatus): string {
  if (internet === 'offline' || backend === 'offline' || openclaw === 'offline') return 'bg-error';
  if (openclaw === 'degraded') return 'bg-amber-400';
  if (internet === 'checking' || backend === 'checking') return 'bg-text-muted animate-pulse';
  return 'bg-success';
}

const StatusBar: React.FC = () => {
  const isWatching = useAppStore((s) => s.isWatching);
  const watchStartTime = useAppStore((s) => s.watchStartTime);
  const health = useAppStore((s) => s.connectionHealth);

  const [elapsed, setElapsed] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [displayAlert, setDisplayAlert] = useState<string | null>(null);

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

      {/* Right: switch display + monitor link + connection health */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex items-center">
          <button
            onClick={async () => {
              const result = await window.tekiAPI?.switchDisplay();
              if (result && !result.success) {
                setDisplayAlert(result.error ?? 'Erro desconhecido');
                setTimeout(() => setDisplayAlert(null), 3000);
              }
            }}
            className="text-text-muted hover:text-text-secondary transition-colors text-[11px]"
            title="Trocar monitor"
          >
            Trocar monitor
          </button>
          {displayAlert && (
            <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-zinc-800 border border-amber-500/50 rounded-md shadow-lg text-[11px] text-amber-400 whitespace-nowrap z-50">
              {displayAlert}
            </div>
          )}
        </div>

        <button
          onClick={() => window.tekiAPI?.toggleFloating()}
          className="text-text-muted hover:text-text-secondary transition-colors text-[11px]"
          title="Abrir/fechar janela flutuante (Cmd+Option+Space)"
        >
          Flutuante
        </button>

      <div
        className="relative flex items-center gap-1.5 text-text-muted cursor-default"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${overallDotClass(health.internet, health.backend, health.openclaw)}`}
        />
        <span>{overallLabel(health.internet, health.backend, health.openclaw)}</span>

        {/* Tooltip with per-service status */}
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg text-xs space-y-1.5 min-w-[160px] z-50">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClass(health.internet)}`} />
              <span>Internet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClass(health.backend)}`} />
              <span>Servidor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClass(health.openclaw)}`} />
              <span>Canais</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default StatusBar;
