import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useMonitorStore } from '@/stores/monitor-store';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const LatencyChart: React.FC = () => {
  const services = useMonitorStore((s) => s.services);
  const pings = useMonitorStore((s) => s.pings);

  const { data, serviceKeys } = useMemo(() => {
    if (services.length === 0) return { data: [], serviceKeys: [] };

    // Collect all timestamps across services
    const timestampMap = new Map<number, Record<string, number | null>>();

    for (const svc of services) {
      const svcPings = pings[svc.id] || [];
      for (const p of svcPings) {
        // Round to nearest 5s to align timestamps
        const ts = Math.round(p.timestamp / 5000) * 5000;
        if (!timestampMap.has(ts)) {
          timestampMap.set(ts, {});
        }
        timestampMap.get(ts)![svc.id] = p.latencyMs;
      }
    }

    const sorted = Array.from(timestampMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([ts, values]) => ({ ts, ...values }));

    return {
      data: sorted,
      serviceKeys: services.map((s) => s.id),
    };
  }, [services, pings]);

  if (services.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 flex items-center justify-center text-text-muted text-sm h-[300px]">
        Nenhum serviço monitorado. Adicione um serviço para ver o gráfico.
      </div>
    );
  }

  const serviceNameMap = Object.fromEntries(services.map((s) => [s.id, s.name]));

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-text-secondary text-xs font-medium mb-3">Latência em Tempo Real</div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="ts"
            tickFormatter={(ts) => new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            stroke="rgba(255,255,255,0.3)"
            fontSize={10}
          />
          <YAxis
            domain={[0, 500]}
            tickFormatter={(v) => `${v}ms`}
            stroke="rgba(255,255,255,0.3)"
            fontSize={10}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e1e2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 11,
            }}
            labelFormatter={(ts) => new Date(ts as number).toLocaleTimeString('pt-BR')}
            formatter={(value: number, name: string) => [`${value.toFixed(0)}ms`, serviceNameMap[name] || name]}
          />
          <Legend
            formatter={(value) => serviceNameMap[value] || value}
            wrapperStyle={{ fontSize: 11 }}
          />
          {serviceKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LatencyChart;
