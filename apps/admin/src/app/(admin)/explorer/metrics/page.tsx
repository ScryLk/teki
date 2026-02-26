'use client';

import { useEffect, useState } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import {
  Users, Building2, MessagesSquare, MessageSquare, Bot, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import type { SystemOverview, TimeSeriesData } from '@/lib/explorer/types';

const PLAN_COLORS: Record<string, string> = {
  FREE: 'oklch(0.6 0 0)',
  STARTER: 'oklch(0.696 0.17 162.48)',
  PRO: 'oklch(0.623 0.214 259)',
  ENTERPRISE: 'oklch(0.627 0.265 303.9)',
};

const METRIC_OPTIONS = [
  { value: 'new_users', label: 'Novos Usuarios' },
  { value: 'new_tenants', label: 'Novos Tenants' },
  { value: 'conversations', label: 'Conversas' },
  { value: 'messages', label: 'Mensagens' },
  { value: 'ai_messages', label: 'Mensagens IA' },
];

const PERIOD_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
];

export default function ExplorerMetricsPage() {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('new_users');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    fetch('/api/explorer/metrics/overview')
      .then((r) => r.json())
      .then(setOverview)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(
      `/api/explorer/metrics/time-series?metric=${selectedMetric}&period=${selectedPeriod}`
    )
      .then((r) => r.json())
      .then((data) => setTimeSeries(data.data || []))
      .catch(() => setTimeSeries([]));
  }, [selectedMetric, selectedPeriod]);

  if (!overview) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Metricas do Sistema</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const planData = Object.entries(overview.tenants.plans).map(([plan, count]) => ({
    plan,
    count,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Metricas do Sistema
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Usuarios"
          value={formatNumber(overview.users.total)}
          subtitle={`${overview.users.today} hoje, ${overview.users.activeWeekly} ativos (7d)`}
          icon={Users}
          trend={{ value: overview.users.thisMonth, label: 'este mes' }}
        />
        <KpiCard
          title="Tenants"
          value={formatNumber(overview.tenants.total)}
          subtitle={`${overview.tenants.active} ativos`}
          icon={Building2}
        />
        <KpiCard
          title="Conversas"
          value={formatNumber(overview.conversations.total)}
          subtitle={`${overview.conversations.today} hoje`}
          icon={MessagesSquare}
        />
        <KpiCard
          title="Mensagens"
          value={formatNumber(overview.messages.total)}
          subtitle={`${overview.messages.today} hoje, ${formatNumber(overview.messages.aiGenerated)} IA`}
          icon={MessageSquare}
        />
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Tokens de Entrada (IA)</p>
          <p className="text-xl font-bold mt-1">{formatNumber(overview.ai.totalTokensIn)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Tokens de Saida (IA)</p>
          <p className="text-xl font-bold mt-1">{formatNumber(overview.ai.totalTokensOut)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-muted-foreground">Custo Total IA (USD)</p>
          <p className="text-xl font-bold mt-1">
            ${overview.ai.totalCostUsd.toFixed(2)}
          </p>
        </Card>
      </div>

      {/* Time Series Chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-sm">Tendencia</CardTitle>
          <div className="flex items-center gap-2">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground"
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {timeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.623 0.214 259)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.623 0.214 259)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    tickFormatter={(v: string) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.16 0 0)',
                      border: '1px solid oklch(0.26 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.623 0.214 259)"
                    fillOpacity={1}
                    fill="url(#colorTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Sem dados para o periodo selecionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuicao de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            {planData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={planData}
                        dataKey="count"
                        nameKey="plan"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                      >
                        {planData.map((entry) => (
                          <Cell
                            key={entry.plan}
                            fill={PLAN_COLORS[entry.plan] || 'oklch(0.4 0 0)'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'oklch(0.16 0 0)',
                          border: '1px solid oklch(0.26 0 0)',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {planData.map((entry) => (
                    <div key={entry.plan} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          background: PLAN_COLORS[entry.plan] || 'oklch(0.4 0 0)',
                        }}
                      />
                      <span className="text-muted-foreground">
                        {entry.plan} ({entry.count})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Sem dados de planos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Resumo do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <SummaryRow
                label="Usuarios nos ultimos 30 dias"
                value={formatNumber(overview.users.last30d)}
              />
              <SummaryRow
                label="Usuarios ativos (7 dias)"
                value={formatNumber(overview.users.activeWeekly)}
              />
              <SummaryRow
                label="Tenants ativos"
                value={`${overview.tenants.active} / ${overview.tenants.total}`}
              />
              <SummaryRow
                label="Mensagens de IA"
                value={`${formatNumber(overview.messages.aiGenerated)} (${
                  overview.messages.total > 0
                    ? Math.round(
                        (overview.messages.aiGenerated / overview.messages.total) * 100
                      )
                    : 0
                }%)`}
              />
              <SummaryRow
                label="Total tokens IA"
                value={formatNumber(overview.ai.totalTokensIn + overview.ai.totalTokensOut)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-[10px] text-muted-foreground text-right">
        Gerado em: {overview.generatedAt ? new Date(overview.generatedAt).toLocaleString('pt-BR') : '-'}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
