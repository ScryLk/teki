'use client';

import {
  ClipboardList,
  Bot,
  Shield,
  AlertTriangle,
  DollarSign,
  Zap,
  Users,
  BarChart3,
} from 'lucide-react';

interface Metrics {
  audit_count_24h: number;
  ai_count_24h: number;
  security_count_24h: number;
  error_count_24h: number;
  ai_cost_today_usd: number;
  avg_latency_ms: number;
  active_tenants_24h: number;
  total_requests_today: number;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <Icon size={20} className={iconClassName} />
      <div>
        <p className="text-lg font-semibold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

export function LogsMetricsBar({ metrics }: { metrics: Metrics | null }) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[72px] animate-pulse rounded-lg border border-white/5 bg-white/[0.02]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
      <MetricCard icon={ClipboardList} label="Acoes" value={metrics.audit_count_24h.toLocaleString('pt-BR')} iconClassName="text-violet-400" />
      <MetricCard icon={Bot} label="Chamadas IA" value={metrics.ai_count_24h.toLocaleString('pt-BR')} iconClassName="text-emerald-400" />
      <MetricCard icon={Shield} label="Eventos Seg." value={metrics.security_count_24h.toLocaleString('pt-BR')} iconClassName="text-amber-400" />
      <MetricCard icon={AlertTriangle} label="Erros" value={metrics.error_count_24h.toLocaleString('pt-BR')} iconClassName="text-red-400" />
      <MetricCard icon={DollarSign} label="Custo IA hoje" value={`$${metrics.ai_cost_today_usd.toFixed(2)}`} iconClassName="text-green-400" />
      <MetricCard icon={Zap} label="Latencia med." value={`${metrics.avg_latency_ms}ms`} iconClassName="text-yellow-400" />
      <MetricCard icon={Users} label="Tenants ativos" value={String(metrics.active_tenants_24h)} iconClassName="text-blue-400" />
      <MetricCard icon={BarChart3} label="Requests hoje" value={metrics.total_requests_today.toLocaleString('pt-BR')} iconClassName="text-cyan-400" />
    </div>
  );
}
