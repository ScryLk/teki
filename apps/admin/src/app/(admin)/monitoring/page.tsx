'use client';

import { useEffect, useState, useRef } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusDot from '@/components/shared/StatusDot';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatMs, formatCurrency } from '@/lib/utils';
import { Users, MessageSquare, MessagesSquare, Wifi, WifiOff } from 'lucide-react';

interface RealtimeMetrics {
  activeUsers: number;
  messagesLastHour: number;
  conversationsLastHour: number;
}

interface Connector {
  id: string;
  displayName: string | null;
  platform: string;
  status: string;
  healthStatus: string;
  healthCheckAt: string | null;
  avgResponseTimeMs: number | null;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  consecutiveErrors: number;
  tenantName: string;
}

interface AiProvider {
  id: string;
  provider: string;
  displayName: string | null;
  apiKeyValid: boolean;
  apiKeyLastValidatedAt: string | null;
  currentMonthRequests: number;
  currentMonthCostUsd: number;
  dailyRequestLimit: number | null;
  rateLimitRpm: number | null;
  tenantName: string;
}

interface RecentError {
  id: string;
  errorMessage: string | null;
  startedAt: string;
  connectorName: string | null;
  platform: string;
}

const HEALTH_COLOR: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  HEALTHY: 'green',
  DEGRADED: 'yellow',
  DOWN: 'red',
  UNKNOWN: 'gray',
};

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [aiProviders, setAiProviders] = useState<AiProvider[]>([]);
  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [sseConnected, setSseConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Initial data load
  useEffect(() => {
    fetch('/api/monitoring')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => {
        setMetrics(data.realtime);
        setConnectors(data.connectors);
        setAiProviders(data.aiProviders);
        setRecentErrors(data.recentErrors);
      })
      .catch((err) => console.error('[monitoring]', err));
  }, []);

  // SSE connection
  useEffect(() => {
    const es = new EventSource('/api/monitoring/sse');
    eventSourceRef.current = es;

    es.onopen = () => setSseConnected(true);
    es.onerror = () => setSseConnected(false);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'metrics') {
        setMetrics({
          activeUsers: data.activeUsers,
          messagesLastHour: data.messagesLastHour,
          conversationsLastHour: data.conversationsLastHour,
        });
      }
    };

    return () => {
      es.close();
    };
  }, []);

  if (!metrics) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Monitoramento</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Monitoramento</h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {sseConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tempo real conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-destructive" />
              <span>Desconectado</span>
            </>
          )}
        </div>
      </div>

      {/* Realtime KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Usuarios Online"
          value={metrics.activeUsers}
          subtitle="ultimos 5 minutos"
          icon={Users}
        />
        <KpiCard
          title="Msgs / Hora"
          value={metrics.messagesLastHour}
          subtitle="ultima hora"
          icon={MessageSquare}
        />
        <KpiCard
          title="Conversas / Hora"
          value={metrics.conversationsLastHour}
          subtitle="ultima hora"
          icon={MessagesSquare}
        />
      </div>

      {/* Connector Health + AI Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Connectors */}
        <Card>
          <CardHeader>
            <CardTitle>Conectores Externos</CardTitle>
          </CardHeader>
          <CardContent>
            {connectors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum conector configurado
              </p>
            ) : (
              <div className="space-y-3">
                {connectors.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <StatusDot
                        color={HEALTH_COLOR[c.healthStatus] || 'gray'}
                        pulse={c.healthStatus === 'HEALTHY'}
                      />
                      <div>
                        <p className="text-sm text-foreground">
                          {c.displayName || c.platform}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.tenantName} &middot; {c.platform}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.avgResponseTimeMs && (
                        <span className="text-xs text-muted-foreground">
                          {formatMs(c.avgResponseTimeMs)}
                        </span>
                      )}
                      <Badge
                        variant={
                          c.healthStatus === 'HEALTHY'
                            ? 'success'
                            : c.healthStatus === 'DEGRADED'
                              ? 'warning'
                              : 'destructive'
                        }
                      >
                        {c.healthStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Providers de IA</CardTitle>
          </CardHeader>
          <CardContent>
            {aiProviders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum provider configurado
              </p>
            ) : (
              <div className="space-y-3">
                {aiProviders.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <StatusDot
                        color={p.apiKeyValid ? 'green' : 'red'}
                        pulse={p.apiKeyValid}
                      />
                      <div>
                        <p className="text-sm text-foreground">
                          {p.displayName || p.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.tenantName} &middot; {p.currentMonthRequests} req/mes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(p.currentMonthCostUsd)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        custo mensal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Erros Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentErrors.map((e) => (
                <div
                  key={e.id}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/5 border border-destructive/10"
                >
                  <StatusDot color="red" className="mt-1" />
                  <div>
                    <p className="text-sm text-foreground">
                      {e.connectorName} ({e.platform})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {e.errorMessage || 'Erro desconhecido'}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(e.startedAt)}
                    </p>
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
