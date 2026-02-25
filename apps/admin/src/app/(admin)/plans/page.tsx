'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface PlanStats {
  plan: string;
  count: number;
  activeCount: number;
}

const PLAN_LIMITS: Record<string, { members: string; conversations: string; aiRequests: string; storage: string }> = {
  FREE: { members: '3', conversations: '100/mes', aiRequests: '500/mes', storage: '100MB' },
  STARTER: { members: '10', conversations: '1.000/mes', aiRequests: '5.000/mes', storage: '1GB' },
  PRO: { members: '50', conversations: '10.000/mes', aiRequests: '50.000/mes', storage: '10GB' },
  ENTERPRISE: { members: 'Ilimitado', conversations: 'Ilimitado', aiRequests: 'Ilimitado', storage: '100GB' },
};

const PLAN_PRICES: Record<string, string> = {
  FREE: 'Gratis',
  STARTER: 'R$ 49/mes',
  PRO: 'R$ 199/mes',
  ENTERPRISE: 'Customizado',
};

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((data) => {
        setPlans(
          data.planDistribution.map((p: { plan: string; count: number }) => ({
            plan: p.plan,
            count: p.count,
            activeCount: p.count,
          }))
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Planos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const planOrder = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'];
  const sortedPlans = planOrder.map((p) => ({
    plan: p,
    ...(plans.find((x) => x.plan === p) || { count: 0, activeCount: 0 }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Planos
        </h1>
        <p className="text-xs text-muted-foreground">
          Visao geral dos planos e limites
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedPlans.map((p) => (
          <Card key={p.plan} className="relative overflow-hidden">
            {p.plan === 'PRO' && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-medium">
                Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.plan}</span>
                <Badge variant="secondary">{PLAN_PRICES[p.plan]}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-3 bg-secondary rounded-lg">
                <p className="text-3xl font-bold">{formatNumber(p.count)}</p>
                <p className="text-xs text-muted-foreground">tenants ativos</p>
              </div>

              <div className="space-y-2 text-xs">
                {Object.entries(PLAN_LIMITS[p.plan] || {}).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">
                      {key === 'aiRequests' ? 'IA Requests' : key}
                    </span>
                    <span className="font-medium text-foreground">{val}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
