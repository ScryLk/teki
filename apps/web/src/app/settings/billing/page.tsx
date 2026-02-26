'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UsageBar } from '@/components/billing/UsageBar';
import { CancelModal } from '@/components/billing/CancelModal';
import { AlertTriangle, CreditCard, ExternalLink } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { PlanTier } from '@prisma/client';

interface PlanData {
  plan: {
    id: PlanTier;
    name: string;
    price: number;
    activatedAt: string | null;
    expiresAt: string | null;
    cancelledAt: string | null;
    isActive: boolean;
    daysRemaining: number | null;
  };
  limits: Record<string, unknown>;
}

interface UsageData {
  period: string;
  plan: { id: PlanTier; name: string };
  usage: {
    messages: { current: number; limit: number; percentage: number; remaining: number; status: string };
    agents: { current: number; limit: number; percentage: number; remaining: number; status: string };
    storage: { current: number; limit: number; percentage: number; remaining: number; unit: string; status: string };
    channels: { current: number; limit: number; available: boolean; upgradeRequired: PlanTier | null };
  };
  byokMessages: number;
}

interface BillingData {
  billingName: string | null;
  billingCompany: string | null;
  billingTaxId: string | null;
  email: string | null;
}

interface HistoryEntry {
  id: string;
  fromPlan: PlanTier;
  toPlan: PlanTier;
  reason: string;
  amount: number | null;
  createdAt: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<PlanData | null>(null);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, usageRes, billingRes, historyRes] = await Promise.all([
        fetch('/api/v1/billing/plan'),
        fetch('/api/v1/billing/usage'),
        fetch('/api/v1/billing/billing-data'),
        fetch('/api/v1/billing/history?limit=10'),
      ]);

      if (planRes.ok) setPlanData(await planRes.json());
      if (usageRes.ok) setUsageData(await usageRes.json());
      if (billingRes.ok) setBillingData(await billingRes.json());
      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(data.history);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));

  const handleDowngrade = async (planId: PlanTier) => {
    await fetch('/api/v1/billing/downgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId }),
    });
    fetchAll();
  };

  const handleCancel = async (reason: string) => {
    await fetch('/api/v1/billing/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true, reason }),
    });
    fetchAll();
  };

  if (loading || !planData || !usageData) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
        <div className="h-40 bg-card rounded-lg" />
        <div className="h-64 bg-card rounded-lg" />
      </div>
    );
  }

  const { plan } = planData;
  const { usage, period, byokMessages } = usageData;
  const periodLabel = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(period + '-01'));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Section 1 — Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plano atual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-semibold">
                Teki {plan.name}
                {plan.price > 0 && (
                  <span className="text-muted-foreground font-normal">
                    {' '}
                    &middot; R$ {plan.price}/mes
                  </span>
                )}
              </p>
              {plan.activatedAt && (
                <p className="text-sm text-muted-foreground">
                  Ativo desde {formatDate(plan.activatedAt)}
                </p>
              )}
              {plan.expiresAt && !plan.cancelledAt && (
                <p className="text-sm text-muted-foreground">
                  Proxima renovacao: {formatDate(plan.expiresAt)}
                </p>
              )}
            </div>
          </div>

          {plan.cancelledAt && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
              <AlertTriangle size={16} />
              <span>
                Cancelamento agendado. Plano ativo ate{' '}
                {plan.expiresAt ? formatDate(plan.expiresAt) : 'hoje'}.
              </span>
            </div>
          )}

          <div className="flex gap-2">
            {plan.id !== 'ENTERPRISE' && (
              <Button
                onClick={() => router.push('/settings/billing/upgrade')}
                className="bg-[#2A8F9D] hover:bg-[#2A8F9D]/90"
              >
                Fazer upgrade
              </Button>
            )}
            {plan.id !== 'FREE' && !plan.cancelledAt && (
              <Button variant="outline" onClick={() => setCancelOpen(true)}>
                Cancelar assinatura
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Uso &mdash; {periodLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar
            label="Mensagens"
            current={usage.messages.current}
            limit={usage.messages.limit}
            status={usage.messages.status as 'normal' | 'warning' | 'critical' | 'exceeded'}
            showUpgrade
            onUpgrade={() => router.push('/settings/billing/upgrade')}
          />
          <UsageBar
            label="Agentes"
            current={usage.agents.current}
            limit={usage.agents.limit}
            status={usage.agents.status as 'normal' | 'warning' | 'critical' | 'exceeded'}
            showUpgrade
            onUpgrade={() => router.push('/settings/billing/upgrade')}
          />
          <UsageBar
            label="Armazenamento"
            current={usage.storage.current}
            limit={usage.storage.limit}
            unit="MB"
            status={usage.storage.status as 'normal' | 'warning' | 'critical' | 'exceeded'}
            showUpgrade
            onUpgrade={() => router.push('/settings/billing/upgrade')}
          />

          {!usage.channels.available ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">OpenClaw</span>
              <button
                onClick={() => router.push('/settings/billing/upgrade')}
                className="text-xs text-[#2A8F9D] hover:underline"
              >
                Nao disponivel &middot; Requer Pro &rarr;
              </button>
            </div>
          ) : (
            <UsageBar
              label="Canais OpenClaw"
              current={usage.channels.current}
              limit={usage.channels.limit}
              status="normal"
            />
          )}

          <Separator />

          <TooltipProvider>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Mensagens BYOK: {byokMessages}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-xs">&#9432;</span>
                </TooltipTrigger>
                <TooltipContent>
                  Mensagens com chave propria nao contam no limite
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Section 3 — Billing Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados de cobranca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {billingData ? (
            <>
              <DataRow label="Nome" value={billingData.billingName} />
              <DataRow label="Email" value={billingData.email} />
              <DataRow label="Empresa" value={billingData.billingCompany} />
              <DataRow label="CPF/CNPJ" value={billingData.billingTaxId} />
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push('/settings/billing/checkout?plan=' + plan.id + '&edit=true')}
              >
                Editar dados
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum dado de cobranca cadastrado.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 4 — History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historico</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum historico de plano.
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-xs w-24">
                      {formatDate(entry.createdAt)}
                    </span>
                    <span>
                      {entry.reason === 'simulation' || entry.reason === 'upgrade'
                        ? `Upgrade ${entry.fromPlan} → ${entry.toPlan}`
                        : entry.reason === 'downgrade'
                          ? `Downgrade ${entry.fromPlan} → ${entry.toPlan}`
                          : entry.reason === 'cancel'
                            ? `Cancelamento ${entry.fromPlan}`
                            : `${entry.fromPlan} → ${entry.toPlan}`}
                    </span>
                  </div>
                  {entry.amount != null && (
                    <Badge variant="outline" className="text-xs">
                      R$ {entry.amount.toFixed(2).replace('.', ',')}
                    </Badge>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground pt-2">
                (Modo simulacao: valores simulados)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Modal */}
      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        currentPlanId={plan.id}
        expiresAt={plan.expiresAt}
        currentUsage={{ messages: usage.messages.current }}
        onDowngrade={handleDowngrade}
        onCancel={handleCancel}
      />
    </div>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value ?? '—'}</span>
    </div>
  );
}
