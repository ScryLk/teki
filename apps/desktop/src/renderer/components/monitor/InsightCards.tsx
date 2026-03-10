import React from 'react';
import { useMonitorStore } from '@/stores/monitor-store';

const InsightCards: React.FC = () => {
  const patterns = useMonitorStore((s) => s.patterns);

  if (patterns.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-text-secondary text-xs font-medium mb-3">
        Padrões Detectados
      </div>
      <div className="space-y-2">
        {patterns.map((p, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-2 rounded-md text-xs ${
              p.severity === 'high'
                ? 'bg-red-500/10 border border-red-500/20'
                : 'bg-amber-400/10 border border-amber-400/20'
            }`}
          >
            <span className={`mt-0.5 text-sm ${p.severity === 'high' ? 'text-error' : 'text-amber-400'}`}>
              {p.severity === 'high' ? '!' : '~'}
            </span>
            <div>
              <div className="text-text-primary font-medium">{p.serviceName}</div>
              <div className="text-text-muted mt-0.5">{p.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightCards;
