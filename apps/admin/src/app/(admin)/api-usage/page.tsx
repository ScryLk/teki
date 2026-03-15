'use client';

import { useEffect, useState } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import {
  KeyRound,
  Zap,
  DollarSign,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ApiUsageData {
  period: string;
  kpis: {
    totalRequests: number;
    totalTokensIn: number;
    totalTokensOut: number;
    totalCostUsd: number;
    activeKeys: number;
  };
  topUsers: {
    userId: string;
    email: string;
    name: string | null;
    requests: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  }[];
  dailyTrend: {
    date: string;
    requests: number;
    tokensIn: number;
    tokensOut: number;
    costUsd: number;
  }[];
}

export default function ApiUsagePage() {
  const [data, setData] = useState<ApiUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/api-usage')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Uso de API Keys</h1>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Uso de API Keys</h1>
        <p className="text-muted-foreground">Erro ao carregar dados.</p>
      </div>
    );
  }

  const { kpis, topUsers, dailyTrend } = data;
  const totalTokens = kpis.totalTokensIn + kpis.totalTokensOut;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Uso de API Keys</h1>
        <p className="text-sm text-muted-foreground">Periodo: {data.period}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="Requisicoes"
          value={formatNumber(kpis.totalRequests)}
          icon={Activity}
        />
        <KpiCard
          title="Tokens consumidos"
          value={formatTokens(totalTokens)}
          subtitle={`${formatTokens(kpis.totalTokensIn)} in · ${formatTokens(kpis.totalTokensOut)} out`}
          icon={Zap}
        />
        <KpiCard
          title="Custo estimado"
          value={`$${kpis.totalCostUsd.toFixed(4)}`}
          icon={DollarSign}
        />
        <KpiCard
          title="API Keys ativas"
          value={String(kpis.activeKeys)}
          icon={KeyRound}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily tokens trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tokens por dia</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyTrend}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={formatTokens} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, background: '#1a1a1a', border: '1px solid #333' }}
                    formatter={(v: number, name: string) => [formatTokens(v), name === 'tokensIn' ? 'Input' : 'Output']}
                    labelFormatter={(d) => d}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokensIn"
                    stackId="1"
                    stroke="#2A8F9D"
                    fill="#2A8F9D"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="tokensOut"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily requests trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requisicoes por dia</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dailyTrend}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(d) => d.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, background: '#1a1a1a', border: '1px solid #333' }}
                  />
                  <Bar dataKey="requests" fill="#2A8F9D" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponivel
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top users table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Top usuarios por consumo</CardTitle>
        </CardHeader>
        <CardContent>
          {topUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">Usuario</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Requisicoes</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Tokens In</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Tokens Out</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground">Custo (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.map((u) => (
                    <tr key={u.userId} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-2">
                        <div className="font-medium text-xs">{u.name || u.email}</div>
                        {u.name && <div className="text-[11px] text-muted-foreground">{u.email}</div>}
                      </td>
                      <td className="text-right py-2 px-2 text-xs tabular-nums">{formatNumber(u.requests)}</td>
                      <td className="text-right py-2 px-2 text-xs tabular-nums">{formatTokens(u.tokensIn)}</td>
                      <td className="text-right py-2 px-2 text-xs tabular-nums">{formatTokens(u.tokensOut)}</td>
                      <td className="text-right py-2 px-2 text-xs tabular-nums">${u.costUsd.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum uso de API key registrado este mes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
