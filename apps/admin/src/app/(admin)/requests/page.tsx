'use client';

import { useEffect, useState } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatMs } from '@/lib/utils';
import { Globe, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RequestLog {
  id: string;
  event: string;
  statusCode: number | null;
  url: string;
  createdAt: string;
  deliveredAt: string | null;
  latencyMs: number | null;
}

interface RequestsData {
  stats: {
    total: number;
    success: number;
    failed: number;
    successRate: string;
  };
  logs: RequestLog[];
  topEndpoints: { event: string; count: number }[];
}

export default function RequestsPage() {
  const [data, setData] = useState<RequestsData | null>(null);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetch(`/api/requests?period=${period}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch((err) => console.error('[requests]', err));
  }, [period]);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Requisicoes HTTP</h1>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const columns: Column<RequestLog>[] = [
    {
      key: 'createdAt',
      header: 'Data',
      sortable: true,
      className: 'w-40',
      render: (row) => (
        <span className="text-xs font-mono">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'event',
      header: 'Evento',
      sortable: true,
      render: (row) => <span className="text-xs font-mono">{row.event}</span>,
    },
    {
      key: 'statusCode',
      header: 'Status',
      sortable: true,
      className: 'w-20',
      render: (row) => {
        const code = row.statusCode;
        return (
          <Badge
            variant={
              !code
                ? 'destructive'
                : code < 300
                  ? 'success'
                  : code < 500
                    ? 'warning'
                    : 'destructive'
            }
          >
            {code ?? 'ERR'}
          </Badge>
        );
      },
    },
    {
      key: 'url',
      header: 'URL',
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground truncate block max-w-xs">
          {row.url}
        </span>
      ),
    },
    {
      key: 'latencyMs',
      header: 'Latencia',
      sortable: true,
      className: 'w-24',
      render: (row) => (
        <span className="text-xs font-mono">
          {row.latencyMs != null ? formatMs(row.latencyMs) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Requisicoes HTTP</h1>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="1d">Ultimo dia</option>
          <option value="7d">Ultimos 7 dias</option>
          <option value="30d">Ultimos 30 dias</option>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KpiCard title="Total" value={data.stats.total} icon={Globe} />
        <KpiCard
          title="Sucesso"
          value={data.stats.success}
          icon={CheckCircle2}
        />
        <KpiCard title="Falhas" value={data.stats.failed} icon={XCircle} />
        <KpiCard
          title="Taxa Sucesso"
          value={`${data.stats.successRate}%`}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Events Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Top Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              {data.topEndpoints.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.topEndpoints}
                    layout="vertical"
                    margin={{ left: 0 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }} />
                    <YAxis
                      type="category"
                      dataKey="event"
                      width={120}
                      tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'oklch(0.16 0 0)',
                        border: '1px solid oklch(0.26 0 0)',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="oklch(0.623 0.214 259)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Nenhum dado disponivel
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Log Table */}
        <div className="lg:col-span-2">
          <DataTable columns={columns} data={data.logs} keyField="id" />
        </div>
      </div>
    </div>
  );
}
