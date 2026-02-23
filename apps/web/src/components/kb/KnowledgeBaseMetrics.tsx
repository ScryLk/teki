'use client';

import { Card } from '@/components/ui/card';
import { FileText, CheckCircle2, BarChart3, TrendingUp } from 'lucide-react';
import type { KbStats } from '@/lib/kb/types';

interface KnowledgeBaseMetricsProps {
  stats: KbStats | null;
  loading: boolean;
}

export function KnowledgeBaseMetrics({ stats, loading }: KnowledgeBaseMetricsProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-3 animate-pulse">
            <div className="h-4 bg-muted rounded w-20 mb-2" />
            <div className="h-6 bg-muted rounded w-12" />
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      icon: FileText,
      label: 'Total de artigos',
      value: stats.totalArticles,
      color: 'text-blue-400',
    },
    {
      icon: CheckCircle2,
      label: 'Publicados',
      value: stats.publishedArticles,
      color: 'text-emerald-400',
    },
    {
      icon: BarChart3,
      label: 'Taxa de sucesso',
      value: `${Math.round(stats.avgSuccessRate)}%`,
      color: 'text-amber-400',
    },
    {
      icon: TrendingUp,
      label: 'Mais usados',
      value: stats.topUsedArticles.length,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((m) => (
        <Card key={m.label} className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <m.icon size={14} className={m.color} />
            <span className="text-xs text-muted-foreground">{m.label}</span>
          </div>
          <p className="text-lg font-semibold">{m.value}</p>
        </Card>
      ))}
    </div>
  );
}
