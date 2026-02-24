import React, { useEffect } from 'react';
import { useInspectionStore } from '../../stores/inspection-store';
import { InspectorStats } from './InspectorStats';
import { InspectorAlertList } from './InspectorAlertList';
import { InspectorControls } from './InspectorControls';

export function InspectorPanel() {
  const { status, stats, recentAlerts, currentSoftware, setState, addAlert } =
    useInspectionStore();

  // Subscribe to IPC events
  useEffect(() => {
    const unsubStatus = window.tekiAPI.onInspectionStatusChanged((state) => {
      setState(state);
    });

    const unsubAlert = window.tekiAPI.onInspectionAlert((alert) => {
      addAlert(alert);
    });

    // Initial state load
    window.tekiAPI.getInspectionState().then(setState);

    return () => {
      unsubStatus();
      unsubAlert();
    };
  }, [setState, addAlert]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'running'
                ? 'bg-green-500 animate-pulse'
                : status === 'paused'
                  ? 'bg-yellow-500'
                  : status === 'no_consent'
                    ? 'bg-orange-500'
                    : 'bg-zinc-600'
            }`}
          />
          <h2 className="text-sm font-semibold">Motor de Inspeção</h2>
          {currentSoftware && (
            <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
              {currentSoftware.name}
              {currentSoftware.version && ` v${currentSoftware.version}`}
            </span>
          )}
        </div>
        <InspectorControls />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats */}
        <InspectorStats stats={stats} status={status} />

        {/* Consent warning */}
        {status === 'no_consent' && (
          <div className="mx-4 mt-3 p-3 bg-orange-950/50 border border-orange-800/50 rounded-lg">
            <p className="text-xs text-orange-300">
              A captura de tela requer consentimento explícito (LGPD).
              Ative nas configurações de privacidade para usar o motor de inspeção.
            </p>
          </div>
        )}

        {/* Alert list */}
        <InspectorAlertList alerts={recentAlerts} />

        {/* Empty state */}
        {status === 'running' && recentAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <svg
              className="w-12 h-12 mb-3 opacity-30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <p className="text-sm">Monitorando a tela...</p>
            <p className="text-xs mt-1">Erros detectados aparecerão aqui</p>
          </div>
        )}
      </div>
    </div>
  );
}
