import React from 'react';
import type { ConnectorStatus } from './types';
import { STATUS_DISPLAY } from './types';

interface StatusIndicatorProps {
  status: ConnectorStatus;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, size = 'sm', showLabel = true }) => {
  const { icon, label, color } = STATUS_DISPLAY[status];
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${dotSize} rounded-full flex-shrink-0`} style={{ backgroundColor: color }} />
      {showLabel && (
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
      )}
    </span>
  );
};

export default StatusIndicator;
