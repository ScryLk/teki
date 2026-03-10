import React from 'react';
import { useMonitorStore } from '@/stores/monitor-store';

const ServiceScorecard: React.FC = () => {
  const services = useMonitorStore((s) => s.services);
  const pings = useMonitorStore((s) => s.pings);
  const alerts = useMonitorStore((s) => s.alerts);

  const totalServices = services.length;

  // Calculate overall uptime from latest pings
  let totalPings = 0;
  let onlinePings = 0;
  let totalLatency = 0;
  let latencyCount = 0;

  for (const serviceId of Object.keys(pings)) {
    const servicePings = pings[serviceId];
    for (const p of servicePings) {
      totalPings++;
      if (p.status !== 'offline') {
        onlinePings++;
      }
      totalLatency += p.latencyMs;
      latencyCount++;
    }
  }

  const uptimePct = totalPings > 0 ? ((onlinePings / totalPings) * 100) : 100;
  const avgLatency = latencyCount > 0 ? totalLatency / latencyCount : 0;
  const activeIncidents = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="grid grid-cols-4 gap-3">
      <Card label="Serviços" value={String(totalServices)} sub="monitorados" />
      <Card label="Uptime" value={`${uptimePct.toFixed(1)}%`} sub="últimas 24h" color={uptimePct >= 99 ? 'text-success' : uptimePct >= 95 ? 'text-amber-400' : 'text-error'} />
      <Card label="Latência" value={`${avgLatency.toFixed(0)}ms`} sub="média" />
      <Card label="Incidentes" value={String(activeIncidents)} sub="ativos" color={activeIncidents > 0 ? 'text-error' : 'text-success'} />
    </div>
  );
};

const Card: React.FC<{ label: string; value: string; sub: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className="bg-surface border border-border rounded-lg p-3">
    <div className="text-text-muted text-xs">{label}</div>
    <div className={`text-xl font-semibold mt-1 ${color || 'text-text-primary'}`}>{value}</div>
    <div className="text-text-muted text-[10px] mt-0.5">{sub}</div>
  </div>
);

export default ServiceScorecard;
