import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis, XAxis } from 'recharts';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useConnectionStatusStore, type StatusValue, type ConnectionEntry } from '@/stores/connection-status-store';

const STATUS_COLORS: Record<StatusValue, string> = {
  online: '#34d399',
  warning: '#fbbf24',
  offline: '#f87171',
  unconfigured: '#52525b',
};

const STATUS_LABELS: Record<StatusValue, string> = {
  online: 'Online',
  warning: 'Aviso',
  offline: 'Offline',
  unconfigured: 'N/A',
};

// ─── Summary Card ────────────────────────────────────────────────────────────

const SummaryCard: React.FC<{ label: string; value: string; sub: string; dotColor: string }> = ({ label, value, sub, dotColor }) => (
  <div className="bg-[#18181b] border border-[#3f3f46]/50 rounded-xl p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />
      <span className="text-[10px] text-[#a1a1aa] uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-lg font-semibold text-[#fafafa]">{value}</div>
    <div className="text-[10px] text-[#52525b] mt-0.5">{sub}</div>
  </div>
);

// ─── Connection Group ────────────────────────────────────────────────────────

const ConnectionGroup: React.FC<{
  title: string;
  connections: ConnectionEntry[];
  showLatency?: boolean;
}> = ({ title, connections, showLatency }) => (
  <div className="bg-[#18181b] border border-[#3f3f46]/50 rounded-xl p-4">
    <h3 className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-3">{title}</h3>
    <div className="space-y-2.5">
      {connections.map((conn) => (
        <div key={conn.id} className="flex items-center gap-3">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: STATUS_COLORS[conn.currentStatus] }}
          />
          <span className="text-xs font-medium text-[#fafafa] w-20 truncate flex-shrink-0">
            {conn.name}
          </span>
          <div className="flex-1 h-3 rounded-sm overflow-hidden flex bg-[#111113]">
            {conn.history.length > 0 ? (
              conn.history.map((point, i) => (
                <div
                  key={i}
                  className="h-full"
                  style={{
                    flex: 1,
                    backgroundColor: STATUS_COLORS[point.status],
                    opacity: 0.8,
                  }}
                  title={`${new Date(point.timestamp).toLocaleTimeString('pt-BR')} — ${STATUS_LABELS[point.status]}${point.latencyMs ? ` (${point.latencyMs.toFixed(0)}ms)` : ''}`}
                />
              ))
            ) : (
              <div className="h-full w-full" style={{ backgroundColor: '#52525b', opacity: 0.3 }} />
            )}
          </div>
          <span className="text-[10px] text-[#71717a] w-14 text-right flex-shrink-0">
            {showLatency && conn.currentLatencyMs !== null
              ? `${conn.currentLatencyMs.toFixed(0)}ms`
              : STATUS_LABELS[conn.currentStatus]}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Latency Sparkline ───────────────────────────────────────────────────────

const LatencySparkline: React.FC<{ connections: ConnectionEntry[] }> = ({ connections }) => {
  const data = useMemo(() => {
    const allTimestamps = new Set<number>();
    for (const conn of connections) {
      for (const point of conn.history) {
        if (point.latencyMs !== null) allTimestamps.add(point.timestamp);
      }
    }
    const sorted = Array.from(allTimestamps).sort((a, b) => a - b);
    return sorted.map((ts) => {
      const entry: Record<string, number | null> = { ts };
      for (const conn of connections) {
        const point = conn.history.find((p) => p.timestamp === ts);
        entry[conn.id] = point?.latencyMs ?? null;
      }
      return entry;
    });
  }, [connections]);

  const connsWithLatency = connections.filter((c) => c.history.some((p) => p.latencyMs !== null));
  if (connsWithLatency.length === 0 || data.length < 2) return null;

  return (
    <div className="bg-[#18181b] border border-[#3f3f46]/50 rounded-xl p-4">
      <h3 className="text-[10px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-2">Latência ao longo do tempo</h3>
      <ResponsiveContainer width="100%" height={100}>
        <LineChart data={data}>
          <XAxis dataKey="ts" hide />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
            labelFormatter={(ts) => new Date(ts as number).toLocaleTimeString('pt-BR')}
            formatter={(value: number, name: string) => {
              const conn = connections.find((c) => c.id === name);
              return [`${value?.toFixed(0) ?? '—'}ms`, conn?.name ?? name];
            }}
          />
          {connsWithLatency.map((conn) => (
            <Line key={conn.id} type="monotone" dataKey={conn.id}
              stroke={conn.color} strokeWidth={1.5} dot={false} connectNulls />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2">
        {connsWithLatency.map((conn) => (
          <div key={conn.id} className="flex items-center gap-1.5">
            <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: conn.color }} />
            <span className="text-[10px] text-[#71717a]">{conn.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Status Tab ──────────────────────────────────────────────────────────────

export const StatusTab: React.FC = () => {
  const { refreshAI } = useConnectionStatus();
  const connections = useConnectionStatusStore((s) => s.connections);
  const connList = Object.values(connections);

  const openclawConns = connList.filter((c) => c.type === 'openclaw');
  const aiConns = connList.filter((c) => c.type === 'ai');

  const ocOnline = openclawConns.filter((c) => c.currentStatus === 'online').length;
  const aiOnline = aiConns.filter((c) => c.currentStatus === 'online').length;

  const aiWithLatency = aiConns.filter((c) => c.currentLatencyMs !== null);
  const avgLatency = aiWithLatency.length > 0
    ? aiWithLatency.reduce((sum, c) => sum + (c.currentLatencyMs ?? 0), 0) / aiWithLatency.length
    : null;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <SummaryCard
          label="OpenClaw"
          value={`${ocOnline}/${openclawConns.length}`}
          sub="canais online"
          dotColor={ocOnline > 0 ? '#34d399' : '#52525b'}
        />
        <SummaryCard
          label="Provedores IA"
          value={`${aiOnline}/${aiConns.length}`}
          sub="online"
          dotColor={aiOnline > 0 ? '#34d399' : '#52525b'}
        />
        <SummaryCard
          label="Latência"
          value={avgLatency !== null ? `${avgLatency.toFixed(0)}ms` : '—'}
          sub="média IA"
          dotColor={avgLatency !== null ? (avgLatency < 500 ? '#34d399' : '#fbbf24') : '#52525b'}
        />
      </div>

      {/* OpenClaw */}
      {openclawConns.length > 0 && (
        <ConnectionGroup title="OpenClaw" connections={openclawConns} />
      )}

      {/* AI Providers */}
      {aiConns.length > 0 && (
        <div>
          <ConnectionGroup title="Provedores IA" connections={aiConns} showLatency />
          <button
            onClick={refreshAI}
            className="flex items-center gap-1.5 mt-2 ml-auto text-[10px] text-[#71717a] hover:text-accent transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Atualizar latências
          </button>
        </div>
      )}

      {/* Latency sparkline */}
      <LatencySparkline connections={aiConns} />
    </div>
  );
};
