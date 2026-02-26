'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatusDot from '@/components/shared/StatusDot';
import { Flag } from 'lucide-react';

interface FeatureFlag {
  name: string;
  enabled: number;
  disabled: number;
  total: number;
  enabledTenants: string[];
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [totalTenants, setTotalTenants] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/flags')
      .then((r) => r.json())
      .then((data) => {
        setFlags(data.flags);
        setTotalTenants(data.totalTenants);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Feature Flags</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Flag className="w-5 h-5" /> Feature Flags
        </h1>
        <p className="text-xs text-muted-foreground">
          {flags.length} flags configuradas | {totalTenants} tenants ativos
        </p>
      </div>

      {flags.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma feature flag configurada.
            <br />
            <span className="text-xs">
              Feature flags sao configuradas via campo settings.featureFlags nos tenants.
            </span>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flags.map((flag) => {
            const pct = flag.total > 0 ? (flag.enabled / flag.total) * 100 : 0;
            return (
              <Card key={flag.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="font-mono">{flag.name}</span>
                    <Badge variant={pct === 100 ? 'success' : pct === 0 ? 'secondary' : 'warning'}>
                      {pct.toFixed(0)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-muted mb-3">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{flag.enabled} habilitado</span>
                    <span>{flag.disabled} desabilitado</span>
                  </div>

                  {flag.enabledTenants.length > 0 && (
                    <div className="space-y-1">
                      {flag.enabledTenants.slice(0, 5).map((t) => (
                        <div key={t} className="flex items-center gap-1.5 text-xs">
                          <StatusDot color="green" />
                          <span>{t}</span>
                        </div>
                      ))}
                      {flag.enabledTenants.length > 5 && (
                        <p className="text-[10px] text-muted-foreground">
                          +{flag.enabledTenants.length - 5} mais
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
