'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Database } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface TableStat {
  model: string;
  displayName: string;
  count: number;
}

export default function ExplorerIndexPage() {
  const [stats, setStats] = useState<TableStat[] | null>(null);

  useEffect(() => {
    fetch('/api/explorer/metrics/table-stats')
      .then((r) => r.json())
      .then((data) => setStats(data.stats || []))
      .catch(() => setStats([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Database Explorer
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore e gerencie todas as tabelas do sistema. Selecione um model na sidebar para comecar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tabelas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stats.map((stat) => (
                <Link
                  key={stat.model}
                  href={`/explorer/${stat.model}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-foreground">{stat.displayName}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatNumber(stat.count)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
