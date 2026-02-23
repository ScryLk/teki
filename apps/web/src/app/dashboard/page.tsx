'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Bot,
  Ticket,
  BookOpen,
  TrendingUp,
  Clock,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface DashboardData {
  overview: {
    totalTickets: number;
    totalResolved: number;
    resolvedWithAi: number;
    aiResolutionRate: number | string;
  };
  ticketsByStatus: { status: string; count: number }[];
  confidenceDistribution: { confidence: string; count: number }[];
  sourceDistribution: { source: string; count: number }[];
  topArticles: {
    articleNumber: string;
    title: string;
    category: string;
    usageCount: number;
    successRate: number;
  }[];
  ticketsByCategory: { category: string; count: number }[];
  resolutionTime: { withAi: number; withoutAi: number };
  feedbackStats: { feedback: string; count: number }[];
  gaps: { category: string; ticketCount: number; articleCount: number; ratio: number }[];
}

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_client: 'Ag. cliente',
  waiting_internal: 'Ag. interno',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

const confidenceColors: Record<string, string> = {
  high: 'text-green-400',
  medium: 'text-yellow-400',
  low: 'text-red-400',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando dashboard...</div>;
  }

  if (!data) {
    return <div className="text-center py-12 text-muted-foreground">Erro ao carregar dados.</div>;
  }

  const helpfulCount = data.feedbackStats.find(f => f.feedback === 'helpful')?.count ?? 0;
  const notHelpfulCount = data.feedbackStats.find(f => f.feedback === 'not_helpful')?.count ?? 0;
  const totalFeedback = helpfulCount + notHelpfulCount;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Dashboard
      </h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Total de Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.overview.totalTickets}</p>
            <p className="text-xs text-muted-foreground">{data.overview.totalResolved} resolvidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Resolução com IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{data.overview.aiResolutionRate}%</p>
            <p className="text-xs text-muted-foreground">{data.overview.resolvedWithAi} tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo Médio (com IA)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.resolutionTime.withAi}h</p>
            <p className="text-xs text-muted-foreground">
              Sem IA: {data.resolutionTime.withoutAi}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Feedback Positivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalFeedback > 0 ? ((helpfulCount / totalFeedback) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">{totalFeedback} avaliações</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Distribuição de Confiança da IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.confidenceDistribution.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              data.confidenceDistribution.map((c) => {
                const total = data.confidenceDistribution.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? (c.count / total) * 100 : 0;
                return (
                  <div key={c.confidence} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`capitalize ${confidenceColors[c.confidence ?? ''] ?? ''}`}>
                        {c.confidence ?? 'N/A'}
                      </span>
                      <span>{c.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tickets por Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.ticketsByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem tickets ainda.</p>
            ) : (
              data.ticketsByStatus.map((s) => {
                const pct = data.overview.totalTickets > 0 ? (s.count / data.overview.totalTickets) * 100 : 0;
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{statusLabels[s.status] ?? s.status}</span>
                      <span>{s.count}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Top KB Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Top Artigos da KB
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem artigos ainda.</p>
            ) : (
              <div className="space-y-3">
                {data.topArticles.map((a) => (
                  <div key={a.articleNumber} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.articleNumber} | {a.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm">{a.usageCount} usos</p>
                      <p className={`text-xs ${a.successRate > 70 ? 'text-green-400' : 'text-muted-foreground'}`}>
                        {a.successRate.toFixed(0)}% sucesso
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories by Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tickets por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {data.ticketsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
            ) : (
              <div className="space-y-2">
                {data.ticketsByCategory.map((c) => (
                  <div key={c.category} className="flex justify-between items-center">
                    <span className="text-sm">{c.category}</span>
                    <Badge variant="secondary">{c.count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Gaps */}
      {data.gaps.length > 0 && (
        <Card className="border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-orange-400">
              <AlertTriangle className="w-4 h-4" />
              Lacunas na Base de Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Categorias com muitos tickets e poucos artigos na KB
            </p>
            <div className="space-y-2">
              {data.gaps.map((g) => (
                <div key={g.category} className="flex items-center justify-between">
                  <span className="text-sm">{g.category}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span>{g.ticketCount} tickets</span>
                    <span className="text-orange-400">{g.articleCount} artigos</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
