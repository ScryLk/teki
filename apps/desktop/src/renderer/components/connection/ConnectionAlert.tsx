import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';

const ConnectionAlert: React.FC = () => {
  const health = useAppStore((s) => s.connectionHealth);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const clearAuth = useAppStore((s) => s.clearAuth);
  const [dismissed, setDismissed] = useState<string | null>(null);

  // Build list of active issues
  const alerts: Array<{ key: string; message: string; severity: 'error' | 'warning'; action?: () => void; actionLabel?: string }> = [];

  if (health.internet === 'offline') {
    alerts.push({
      key: 'internet',
      message: 'Sem conexao com a internet. Verifique sua rede.',
      severity: 'error',
    });
  }

  if (health.backend === 'offline' && health.internet !== 'offline') {
    alerts.push({
      key: 'backend',
      message: 'Servidor Teki indisponivel. Logs e sincronizacao pausados.',
      severity: 'warning',
    });
  }

  if (isAuthenticated && !useAppStore.getState().userEmail) {
    alerts.push({
      key: 'auth',
      message: 'Sessao expirada. Faca login novamente para continuar.',
      severity: 'error',
      action: () => {
        clearAuth();
        window.tekiAPI?.logout();
      },
      actionLabel: 'Fazer login',
    });
  }

  if (health.openclaw === 'offline') {
    alerts.push({
      key: 'openclaw',
      message: 'Canais de atendimento desconectados.',
      severity: 'warning',
    });
  } else if (health.openclaw === 'degraded') {
    alerts.push({
      key: 'openclaw-degraded',
      message: 'Alguns canais de atendimento desconectados.',
      severity: 'warning',
    });
  }

  // Show the highest priority alert that hasn't been dismissed
  const active = alerts.find((a) => a.key !== dismissed);

  // Auto-reset dismissed when issues change
  React.useEffect(() => {
    setDismissed(null);
  }, [health.internet, health.backend, health.openclaw]);

  if (!active) return null;

  const isError = active.severity === 'error';

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 text-xs flex-shrink-0 ${
        isError
          ? 'bg-error/10 border-b border-error/20 text-error'
          : 'bg-amber-500/10 border-b border-amber-500/20 text-amber-400'
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>{active.message}</span>
        {active.action && (
          <button
            onClick={active.action}
            className={`ml-2 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isError
                ? 'bg-error/20 hover:bg-error/30 text-error'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400'
            }`}
          >
            {active.actionLabel}
          </button>
        )}
      </div>
      <button
        onClick={() => setDismissed(active.key)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default ConnectionAlert;
