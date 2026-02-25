'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsData {
  feedbackSummary: { rating: string; count: number }[];
  topProviders: {
    provider: string;
    totalCost: number;
    totalRequests: number;
    totalTokensIn: number;
    totalTokensOut: number;
  }[];
  conversationsByType: { type: string; count: number }[];
  messagesByDay: { date: string; count: number }[];
  costByDay: { date: string; cost: number }[];
}

const TOOLTIP_STYLE = {
  background: 'oklch(0.16 0 0)',
  border: '1px solid oklch(0.26 0 0)',
  borderRadius: '8px',
  fontSize: '12px',
};

const COLORS = [
  'oklch(0.623 0.214 259)',
  'oklch(0.696 0.17 162.48)',
  'oklch(0.769 0.188 70.08)',
  'oklch(0.627 0.265 303.9)',
  'oklch(0.645 0.246 16.439)',
];

const FEEDBACK_COLORS: Record<string, string> = {
  POSITIVE: 'oklch(0.696 0.17 162.48)',
  NEGATIVE: 'oklch(0.645 0.246 16.439)',
  MIXED: 'oklch(0.769 0.188 70.08)',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState('30');

  useEffect(() => {
    fetch(`/api/analytics?days=${days}`)
      .then((r) => r.json())
      .then(setData);
  }, [days]);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Analytics</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalCost = data.topProviders.reduce((s, p) => s + p.totalCost, 0);
  const totalRequests = data.topProviders.reduce((s, p) => s + p.totalRequests, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Analytics</h1>
          <p className="text-xs text-muted-foreground">
            Custo total: {formatCurrency(totalCost)} | {formatNumber(totalRequests)} requisicoes
          </p>
        </div>
        <Select value={days} onChange={(e) => setDays(e.target.value)}>
          <option value="7">7 dias</option>
          <option value="30">30 dias</option>
          <option value="90">90 dias</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Messages per Day */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.messagesByDay}>
                  <defs>
                    <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }} tickFormatter={(v: string) => v.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="count" stroke={COLORS[0]} fillOpacity={1} fill="url(#colorMsgs)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Cost per Day */}
        <Card>
          <CardHeader>
            <CardTitle>Custo IA por Dia (USD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.costByDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }} tickFormatter={(v: string) => v.slice(5)} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="cost" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.feedbackSummary} dataKey="count" nameKey="rating" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {data.feedbackSummary.map((entry) => (
                      <Cell key={entry.rating} fill={FEEDBACK_COLORS[entry.rating] || COLORS[3]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend formatter={(v: string) => <span className="text-xs text-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProviders.map((p, i) => (
                <div key={p.provider} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <div>
                      <p className="text-sm font-medium">{p.provider}</p>
                      <p className="text-xs text-muted-foreground">{formatNumber(p.totalRequests)} req</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(p.totalCost)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatNumber(p.totalTokensIn + p.totalTokensOut)} tokens
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation Types */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Conversa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {data.conversationsByType.map((c) => (
              <div key={c.type} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                <Badge variant="outline">{c.type}</Badge>
                <span className="text-sm font-semibold">{formatNumber(c.count)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
