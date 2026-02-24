import React from 'react';
import { useInspectionStore } from '../../stores/inspection-store';

export function InspectorControls() {
  const { status, startInspection, stopInspection, pauseInspection, resumeInspection } =
    useInspectionStore();

  if (status === 'no_consent') {
    return (
      <button
        disabled
        className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-500 cursor-not-allowed"
      >
        Sem consentimento
      </button>
    );
  }

  if (status === 'stopped') {
    return (
      <button
        onClick={startInspection}
        className="text-xs px-3 py-1 rounded bg-green-900/50 text-green-400 hover:bg-green-900/80 transition-colors"
      >
        Iniciar
      </button>
    );
  }

  if (status === 'paused') {
    return (
      <div className="flex gap-1">
        <button
          onClick={resumeInspection}
          className="text-xs px-3 py-1 rounded bg-green-900/50 text-green-400 hover:bg-green-900/80 transition-colors"
        >
          Retomar
        </button>
        <button
          onClick={stopInspection}
          className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
        >
          Parar
        </button>
      </div>
    );
  }

  // Running
  return (
    <div className="flex gap-1">
      <button
        onClick={pauseInspection}
        className="text-xs px-3 py-1 rounded bg-yellow-900/50 text-yellow-400 hover:bg-yellow-900/80 transition-colors"
      >
        Pausar
      </button>
      <button
        onClick={stopInspection}
        className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors"
      >
        Parar
      </button>
    </div>
  );
}
