import React from 'react';
import type { InspectionAlert, UserActionType } from '@teki/shared';

interface Props {
  alert: InspectionAlert;
  onAction: (action: UserActionType) => void;
}

const SEVERITY_COLORS = {
  critical: 'border-red-600 bg-red-950/30',
  high: 'border-orange-600 bg-orange-950/30',
  medium: 'border-yellow-600 bg-yellow-950/20',
  low: 'border-blue-600 bg-blue-950/20',
  info: 'border-zinc-600 bg-zinc-900',
};

const SEVERITY_BADGES = {
  critical: 'bg-red-900 text-red-300',
  high: 'bg-orange-900 text-orange-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low: 'bg-blue-900 text-blue-300',
  info: 'bg-zinc-800 text-zinc-300',
};

export function InspectorAlertCard({ alert, onAction }: Props) {
  const primaryError = alert.errors[0];
  if (!primaryError) return null;

  const severity = primaryError.severity;
  const timeAgo = getTimeAgo(alert.timestamp);

  return (
    <div
      className={`border rounded-lg p-3 ${SEVERITY_COLORS[severity]} transition-all`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${SEVERITY_BADGES[severity]}`}
          >
            {severity}
          </span>
          {alert.software && (
            <span className="text-[10px] text-zinc-400 bg-zinc-800/50 px-1.5 py-0.5 rounded">
              {alert.software.name}
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-500">{timeAgo}</span>
      </div>

      {/* Error text */}
      <div className="mb-2">
        {alert.errors.map((error, idx) => (
          <div key={idx} className="text-xs text-zinc-200 mb-1">
            {error.code && (
              <span className="font-mono text-red-400 mr-1">[{error.code}]</span>
            )}
            <span className="break-words">{error.text}</span>
          </div>
        ))}
      </div>

      {/* KB Match */}
      {alert.kbMatches && alert.kbMatches.length > 0 && alert.kbMatches[0].bestMatch && (
        <div className="mb-2 p-2 bg-zinc-900/50 rounded border border-zinc-800">
          <div className="text-[10px] text-zinc-500 mb-1">KB Sugerida:</div>
          <button
            onClick={() => onAction('opened_kb')}
            className="text-xs text-blue-400 hover:text-blue-300 text-left transition-colors"
          >
            {alert.kbMatches[0].bestMatch.title}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-1 mt-2">
        {alert.actions
          .filter((a) => a.type !== 'dismiss')
          .slice(0, 3)
          .map((action) => (
            <button
              key={action.id}
              onClick={() => {
                const actionMap: Record<string, UserActionType> = {
                  open_kb: 'opened_kb',
                  ask_ai: 'asked_ai',
                  copy_error: 'copied_error',
                  create_ticket_note: 'created_ticket',
                };
                onAction(actionMap[action.type] ?? 'dismissed');

                // Handle copy
                if (action.type === 'copy_error' && action.data?.text) {
                  navigator.clipboard.writeText(String(action.data.text));
                }
              }}
              className="text-[10px] px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              {action.label}
            </button>
          ))}
        <button
          onClick={() => onAction('dismissed')}
          className="text-[10px] px-2 py-1 rounded text-zinc-500 hover:text-zinc-400 transition-colors"
        >
          Ignorar
        </button>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'agora';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
