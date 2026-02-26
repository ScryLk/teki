'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface QueryExpansionData {
  layerCounts: { l0: number; l1: number; l2: number; l3: number; miss: number };
  totalExpansions: number;
  avgScoreImprovement: number;
  avgTokensPerExpansion: number;
  avgLatencyPerExpansion: number;
  noMatchRate: number;
  totalTokensSpent: number;
  dailyData: {
    date: string;
    l0: number;
    l1: number;
    l2: number;
    l3: number;
    miss: number;
  }[];
}

const TOOLTIP_STYLE = {
  background: 'oklch(0.16 0 0)',
  border: '1px solid oklch(0.26 0 0)',
  borderRadius: '8px',
  fontSize: '12px',
};

const LAYER_COLORS = {
  l0: 'oklch(0.696 0.17 162.48)',  // green
  l1: 'oklch(0.623 0.214 259)',     // blue
  l2: 'oklch(0.769 0.188 70.08)',   // yellow
  l3: 'oklch(0.627 0.265 303.9)',   // purple
  miss: 'oklch(0.645 0.246 16.439)', // red
};

function KpiCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}

export default function QueryExpansionPage() {
  const [data, setData] = useState<QueryExpansionData | null>(null);
  const [days, setDays] = useState('30');

  useEffect(() => {
    fetch(`/api/query-expansion?days=${days}`)
      .then((r) => r.json())
      .then(setData);
  }, [days]);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Query Expansion Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const total = data.totalExpansions || 1; // avoid div by zero
  const lc = data.layerCounts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Query Expansion Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Pipeline de busca inteligente progressiva
          </p>
        </div>
        <Select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">7 dias</option>
          <option value="30">30 dias</option>
          <option value="90">90 dias</option>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Layer 0 (Direto)"
          value={`${((lc.l0 / total) * 100).toFixed(1)}%`}
          sublabel={`${formatNumber(lc.l0)} de ${formatNumber(data.totalExpansions)}`}
        />
        <KpiCard
          label="Expansão Ativada"
          value={`${(((lc.l1 + lc.l2 + lc.l3) / total) * 100).toFixed(1)}%`}
          sublabel={`L1: ${lc.l1} | L2: ${lc.l2} | L3: ${lc.l3}`}
        />
        <KpiCard
          label="Melhoria Média"
          value={`+${(data.avgScoreImprovement * 100).toFixed(1)}%`}
          sublabel="Score delta quando expansão ativa"
        />
        <KpiCard
          label="Sem Match"
          value={`${(data.noMatchRate * 100).toFixed(1)}%`}
          sublabel={`${formatNumber(lc.miss)} queries sem resultado`}
        />
      </div>

      {/* Layer Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Layer (por dia)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.dailyData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
              Nenhum dado de expansão no período selecionado
            </div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyData}>
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
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend
                    formatter={(v: string) => (
                      <span className="text-xs text-foreground">{v}</span>
                    )}
                  />
                  <Bar dataKey="l0" name="Layer 0" stackId="a" fill={LAYER_COLORS.l0} />
                  <Bar dataKey="l1" name="Layer 1" stackId="a" fill={LAYER_COLORS.l1} />
                  <Bar dataKey="l2" name="Layer 2" stackId="a" fill={LAYER_COLORS.l2} />
                  <Bar dataKey="l3" name="Layer 3" stackId="a" fill={LAYER_COLORS.l3} />
                  <Bar dataKey="miss" name="No Match" stackId="a" fill={LAYER_COLORS.miss} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Tokens Gastos (total)</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(data.totalTokensSpent)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Média: {data.avgTokensPerExpansion} tokens/busca
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Latência Média</p>
            <p className="text-2xl font-bold mt-1">{data.avgLatencyPerExpansion}ms</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Por pipeline completo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total de Buscas</p>
            <p className="text-2xl font-bold mt-1">{formatNumber(data.totalExpansions)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              No período selecionado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
