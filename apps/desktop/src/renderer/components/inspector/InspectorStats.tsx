import React from 'react';
import type { InspectionStats, InspectionStatus } from '@teki/shared';

interface Props {
  stats: InspectionStats;
  status: InspectionStatus;
}

export function InspectorStats({ stats, status }: Props) {
  if (status === 'stopped' && stats.framesCaptured === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 gap-2 px-4 py-3">
      <StatItem
        label="Frames"
        value={stats.framesAnalyzed}
        sublabel={`${stats.framesSkipped} skip`}
      />
      <StatItem
        label="Erros"
        value={stats.errorsDetected}
        highlight={stats.errorsDetected > 0}
      />
      <StatItem
        label="KB Matches"
        value={stats.kbMatchesFound}
      />
      <StatItem
        label="Alertas"
        value={stats.alertsSent}
        sublabel={stats.visionApiCalls > 0 ? `${stats.visionApiCalls} vision` : undefined}
      />
    </div>
  );
}

function StatItem({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string;
  value: number;
  sublabel?: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-zinc-900 rounded-lg p-2 text-center">
      <div
        className={`text-lg font-bold ${
          highlight ? 'text-red-400' : 'text-zinc-100'
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</div>
      {sublabel && (
        <div className="text-[9px] text-zinc-600 mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}
