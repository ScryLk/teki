import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ConnectionCard {
  id: string;
  name: string;
  category: 'OpenClaw' | 'IA';
  status: 'online' | 'warning' | 'offline' | 'unconfigured';
  statusText: string;
  color: string;
}

interface Props {
  connections: ConnectionCard[];
}

const STATUS_COLORS: Record<ConnectionCard['status'], string> = {
  online: '#34d399',
  warning: '#fbbf24',
  offline: '#f87171',
  unconfigured: '#52525b',
};

const STATUS_LABELS: Record<ConnectionCard['status'], string> = {
  online: 'Online',
  warning: 'Aviso',
  offline: 'Offline',
  unconfigured: 'Não configurado',
};

const ConnectionStatusChart: React.FC<Props> = ({ connections }) => {
  const { statusData, categoryData } = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const categoryCounts: Record<string, { online: number; warning: number; offline: number; unconfigured: number }> = {};

    for (const c of connections) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;

      if (!categoryCounts[c.category]) {
        categoryCounts[c.category] = { online: 0, warning: 0, offline: 0, unconfigured: 0 };
      }
      categoryCounts[c.category][c.status]++;
    }

    const statusData = Object.entries(statusCounts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: STATUS_LABELS[status as ConnectionCard['status']],
        value: count,
        color: STATUS_COLORS[status as ConnectionCard['status']],
      }));

    const categoryData = Object.entries(categoryCounts).map(([cat, counts]) => ({
      category: cat,
      ...counts,
      total: counts.online + counts.warning + counts.offline + counts.unconfigured,
    }));

    return { statusData, categoryData };
  }, [connections]);

  if (connections.length === 0) return null;

  const onlineCount = connections.filter((c) => c.status === 'online').length;
  const totalConfigured = connections.filter((c) => c.status !== 'unconfigured').length;

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-text-secondary text-xs font-medium mb-3">Visão Geral das Conexões</div>

      <div className="flex items-center gap-6">
        {/* Donut chart */}
        <div className="relative w-[120px] h-[120px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(value: number, name: string) => [`${value}`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-text-primary text-lg font-bold leading-none">{onlineCount}</span>
            <span className="text-text-muted text-[9px]">online</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="flex-1 space-y-3">
          {categoryData.map((cat) => {
            const configuredInCat = cat.online + cat.warning + cat.offline;
            const pct = cat.total > 0 ? Math.round((configuredInCat / cat.total) * 100) : 0;

            return (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-text-primary text-xs font-medium">{cat.category}</span>
                  <span className="text-text-muted text-[10px]">
                    {configuredInCat}/{cat.total} configurados
                  </span>
                </div>
                {/* Stacked bar */}
                <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800">
                  {cat.online > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(cat.online / cat.total) * 100}%`, backgroundColor: STATUS_COLORS.online }}
                    />
                  )}
                  {cat.warning > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(cat.warning / cat.total) * 100}%`, backgroundColor: STATUS_COLORS.warning }}
                    />
                  )}
                  {cat.offline > 0 && (
                    <div
                      className="h-full"
                      style={{ width: `${(cat.offline / cat.total) * 100}%`, backgroundColor: STATUS_COLORS.offline }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[status as ConnectionCard['status']] }}
                />
                <span className="text-text-muted text-[10px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatusChart;
