import React, { useEffect, useState } from 'react';
import type { HourlyAggregate } from '@teki/shared';
import { useMonitorStore } from '@/stores/monitor-store';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function cellColor(uptimePct: number | null): string {
  if (uptimePct === null) return 'bg-zinc-800';
  if (uptimePct >= 99) return 'bg-emerald-500';
  if (uptimePct >= 95) return 'bg-amber-400';
  return 'bg-red-500';
}

const AvailabilityHeatmap: React.FC<{ serviceId?: string }> = ({ serviceId }) => {
  const services = useMonitorStore((s) => s.services);
  const [hourlyData, setHourlyData] = useState<HourlyAggregate[]>([]);

  const targetId = serviceId || services[0]?.id;
  const targetName = services.find((s) => s.id === targetId)?.name || 'Serviço';

  useEffect(() => {
    if (!targetId || !window.tekiAPI?.monitorQueryHourly) return;

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 3600_000;

    window.tekiAPI.monitorQueryHourly({
      serviceId: targetId,
      from: weekAgo,
      to: now,
      granularity: 'hourly',
    }).then(setHourlyData).catch(console.error);
  }, [targetId]);

  // Build grid: day x hour → uptime
  const grid = new Map<string, number>();
  for (const h of hourlyData) {
    const d = new Date(h.hourStart);
    const key = `${d.getDay()}-${d.getHours()}`;
    grid.set(key, h.uptimePct);
  }

  if (!targetId) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6 flex items-center justify-center text-text-muted text-sm">
        Adicione serviços para ver o heatmap de disponibilidade.
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-text-secondary text-xs font-medium mb-3">
        Disponibilidade — {targetName} (última semana)
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {HOURS.filter((_, i) => i % 3 === 0).map((h) => (
              <div key={h} className="text-[9px] text-text-muted" style={{ width: `${(3 / 24) * 100}%` }}>
                {String(h).padStart(2, '0')}h
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center gap-1 mb-0.5">
              <div className="w-8 text-[10px] text-text-muted text-right pr-1">{day}</div>
              <div className="flex flex-1 gap-px">
                {HOURS.map((hour) => {
                  const key = `${dayIndex}-${hour}`;
                  const uptime = grid.get(key) ?? null;
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-3 rounded-[2px] ${cellColor(uptime)}`}
                      style={{ opacity: uptime === null ? 0.3 : 1 }}
                      title={uptime !== null ? `${day} ${hour}h — ${uptime.toFixed(1)}% uptime` : `${day} ${hour}h — sem dados`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-3 mt-3 ml-10 text-[10px] text-text-muted">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span>≥99%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-400" />
              <span>≥95%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span>&lt;95%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-zinc-800" style={{ opacity: 0.3 }} />
              <span>Sem dados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityHeatmap;
