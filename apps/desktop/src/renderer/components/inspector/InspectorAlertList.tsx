import React from 'react';
import type { InspectionAlert, UserActionType } from '@teki/shared';
import { useInspectionStore } from '../../stores/inspection-store';
import { InspectorAlertCard } from './InspectorAlertCard';

interface Props {
  alerts: InspectionAlert[];
}

export function InspectorAlertList({ alerts }: Props) {
  const dismissAlert = useInspectionStore((s) => s.dismissAlert);

  if (alerts.length === 0) return null;

  const handleAction = (alertId: string, actionType: UserActionType) => {
    window.tekiAPI.sendInspectionFeedback(alertId, actionType);

    if (actionType === 'dismissed') {
      dismissAlert(alertId);
    }
  };

  // Show most recent first
  const sortedAlerts = [...alerts].reverse();

  return (
    <div className="px-4 py-2 space-y-2">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
        Detecções Recentes ({alerts.length})
      </div>
      {sortedAlerts.map((alert) => (
        <InspectorAlertCard
          key={alert.id}
          alert={alert}
          onAction={(actionType) => handleAction(alert.id, actionType)}
        />
      ))}
    </div>
  );
}
