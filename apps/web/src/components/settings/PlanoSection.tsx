'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowUpCircle,
  CreditCard,
  ExternalLink,
  Check,
  Star,
  Building2,
} from 'lucide-react';
import { PLANS, type Plan } from '@/lib/settings-types';

export function PlanoSection() {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  // Mock data — will be replaced by real user data
  const currentPlan = PLANS[0]; // free
  const usage = {
    messages: { used: 32, limit: 50 },
    documents: { used: 1, limit: 2 },
    agents: { used: 1, limit: 1 },
    resetDate: '15/03/2026',
    daysUntilReset: 22,
  };

  const billingHistory: { date: string; plan: string; amount: string; status: string }[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Plano & Pagamento</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie sua assinatura e metodos de pagamento.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Seu plano atual</h3>

        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs border-primary/50 text-primary"
              >
                {currentPlan.name.toUpperCase()}
              </Badge>
              {currentPlan.price > 0 && (
                <span className="text-sm font-semibold">
                  R$ {currentPlan.price}/mes
                </span>
              )}
              {currentPlan.price === 0 && (
                <span className="text-sm font-semibold">Gratuito</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-primary" />
              {currentPlan.limits.agents} agente{currentPlan.limits.agents > 1 ? 's' : ''} IA
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-primary" />
              {currentPlan.limits.messagesPerMonth} mensagens/mes
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-primary" />
              {currentPlan.limits.documentsPerAgent} documentos na KB
            </div>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="text-primary" />
              {currentPlan.limits.models.includes('claude-sonnet-4-5-20250929')
                ? 'Claude Sonnet'
                : 'Claude Haiku'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setUpgradeDialogOpen(true)}
          >
            <ArrowUpCircle size={14} />
            Fazer upgrade
          </Button>
          {currentPlan.price > 0 && (
            <Button variant="outline" size="sm" className="text-destructive">
              Cancelar plano
            </Button>
          )}
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Uso do mes</h3>

        <div className="space-y-4">
          <UsageBar
            label="Mensagens"
            used={usage.messages.used}
            limit={usage.messages.limit}
          />
          <UsageBar
            label="Documentos"
            used={usage.documents.used}
            limit={usage.documents.limit}
          />
          <UsageBar
            label="Agentes"
            used={usage.agents.used}
            limit={usage.agents.limit}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Reset em: {usage.resetDate} ({usage.daysUntilReset} dias)
        </p>
      </div>

      {/* Payment method */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Metodo de pagamento</h3>

        {currentPlan.price === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum metodo de pagamento configurado no plano gratuito.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm">Visa •••• 4321</p>
                <p className="text-xs text-muted-foreground">Vence: 08/27</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Alterar
              </Button>
              <Button variant="outline" size="sm" className="text-xs text-destructive">
                Remover
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Gerenciado via Mercado Pago
        </p>
      </div>

      {/* Billing history */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Historico de cobrancas</h3>

        {billingHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma cobranca registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {billingHistory.map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm"
              >
                <span>—</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escolha seu plano</DialogTitle>
            <DialogDescription>
              Faca upgrade para desbloquear mais recursos.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={plan.id === currentPlan.id}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
            <Building2 size={14} />
            <span>
              Enterprise? Entre em contato:{' '}
              <span className="text-foreground">contato@teki.com.br</span>
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const percentage = Math.round((used / limit) * 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
}: {
  plan: Plan;
  isCurrent: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${
        plan.id === 'starter'
          ? 'border-primary/50 bg-primary/5'
          : ''
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          {plan.id === 'starter' && <Star size={14} className="text-primary" />}
          <h4 className="text-sm font-semibold">{plan.name}</h4>
        </div>
        <p className="text-xl font-bold">
          {plan.price === 0 ? 'R$ 0' : `R$ ${plan.price}`}
          <span className="text-xs font-normal text-muted-foreground">
            /mes
          </span>
        </p>
      </div>

      <Separator />

      <ul className="space-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Check size={12} />
          {plan.limits.agents} agente{plan.limits.agents > 1 ? 's' : ''}
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={12} />
          {plan.limits.messagesPerMonth} msg/mes
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={12} />
          {plan.limits.documentsPerAgent} docs
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={12} />
          {plan.limits.models.includes('claude-sonnet-4-5-20250929')
            ? 'Sonnet'
            : 'Haiku'}
        </li>
        <li className="flex items-center gap-1.5">
          <Check size={12} />
          {plan.limits.conversationRetentionDays === -1
            ? 'Hist. ilimitado'
            : plan.limits.conversationRetentionDays === 7
              ? 'Sem historico'
              : `${plan.limits.conversationRetentionDays}d historico`}
        </li>
      </ul>

      {isCurrent ? (
        <Button variant="outline" size="sm" className="w-full text-xs" disabled>
          Atual
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full text-xs"
          variant={plan.id === 'starter' ? 'default' : 'outline'}
        >
          {plan.price === 0 ? 'Selecionar' : 'Assinar'}
        </Button>
      )}
    </div>
  );
}
