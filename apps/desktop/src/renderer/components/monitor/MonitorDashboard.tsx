import React, { useState } from 'react';
import { useMonitorStore } from '@/stores/monitor-store';
import { useMonitor } from '@/hooks/useMonitor';
import ServiceScorecard from './ServiceScorecard';
import LatencyChart from './LatencyChart';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import InsightCards from './InsightCards';
import ServiceConfigModal from './ServiceConfigModal';

const MonitorDashboard: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const services = useMonitorStore((s) => s.services);
  const pings = useMonitorStore((s) => s.pings);
  const removeService = useMonitorStore((s) => s.removeService);

  // Initialize monitor subscriptions
  useMonitor();

  const handleRemove = async (serviceId: string) => {
    try {
      await window.tekiAPI?.monitorRemoveService(serviceId);
      removeService(serviceId);
    } catch (err) {
      console.error('Failed to remove service:', err);
    }
  };

  const handleProbeNow = async (serviceId: string) => {
    try {
      await window.tekiAPI?.monitorProbeNow(serviceId);
    } catch (err) {
      console.error('Failed to probe:', err);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary text-sm font-semibold">Monitor de Conexão</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1 text-xs bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
        >
          + Adicionar Serviço
        </button>
      </div>

      {/* Scorecard */}
      <ServiceScorecard />

      {/* Service List */}
      {services.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-text-secondary text-xs font-medium mb-3">Serviços Monitorados</div>
          <div className="space-y-1.5">
            {services.map((svc) => {
              const latestPings = pings[svc.id] || [];
              const latest = latestPings[latestPings.length - 1];
              const statusColor = !latest
                ? 'bg-text-muted animate-pulse'
                : latest.status === 'online'
                  ? 'bg-success'
                  : latest.status === 'degraded'
                    ? 'bg-amber-400'
                    : 'bg-error';

              return (
                <div key={svc.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-bg/50">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
                    <span className="text-text-primary text-xs font-medium">{svc.name}</span>
                    <span className="text-text-muted text-[10px] uppercase">{svc.type}</span>
                    <span className="text-text-muted text-[10px] font-mono">{svc.target}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {latest && (
                      <span className="text-text-muted text-[10px]">{latest.latencyMs.toFixed(0)}ms</span>
                    )}
                    <button
                      onClick={() => handleProbeNow(svc.id)}
                      className="text-text-muted hover:text-accent text-[10px] transition-colors"
                      title="Testar agora"
                    >
                      ping
                    </button>
                    <button
                      onClick={() => handleRemove(svc.id)}
                      className="text-text-muted hover:text-error text-[10px] transition-colors"
                      title="Remover"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <LatencyChart />
      <AvailabilityHeatmap />

      {/* Insights */}
      <InsightCards />

      {/* Add Modal */}
      {showAddModal && <ServiceConfigModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default MonitorDashboard;
