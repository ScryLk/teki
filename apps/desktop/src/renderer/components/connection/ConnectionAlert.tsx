import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';

const ConnectionAlert: React.FC = () => {
  const health = useAppStore((s) => s.connectionHealth);
  const [dismissed, setDismissed] = useState(false);

  // Determine alert message
  let message: string | null = null;
  if (health.internet === 'offline') {
    message = 'Sem conexao com a internet. Verifique sua rede.';
  } else if (health.backend === 'offline') {
    message = 'Servidor indisponivel. Tentando reconectar...';
  } else if (health.openclaw === 'offline') {
    message = 'Todos os canais estao desconectados.';
  } else if (health.openclaw === 'degraded') {
    message = 'Alguns canais estao desconectados.';
  }

  // Auto-show when a new issue appears (reset dismissed)
  const hasIssue = message !== null;
  React.useEffect(() => {
    if (hasIssue) setDismissed(false);
  }, [hasIssue, health.internet, health.backend, health.openclaw]);

  if (!message || dismissed) return null;

  const isError = health.internet === 'offline' || health.backend === 'offline' || health.openclaw === 'offline';

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
        <span>{message}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
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
