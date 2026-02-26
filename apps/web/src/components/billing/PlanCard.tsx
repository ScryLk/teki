'use client';

import type { PlanTier } from '@prisma/client';
import type { PlanDefinition } from '@/lib/plans';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: PlanDefinition;
  currentPlanId: PlanTier;
  onSelect: (planId: PlanTier) => void;
  compact?: boolean;
}

export function PlanCard({
  plan,
  currentPlanId,
  onSelect,
  compact = false,
}: PlanCardProps) {
  const isCurrent = currentPlanId === plan.id;
  const isEnterprise = plan.id === 'ENTERPRISE';

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        plan.highlighted && 'border-[#2A8F9D] bg-[#2A8F9D]/5',
        compact && 'min-w-[200px]'
      )}
    >
      <CardHeader className={cn('space-y-1', compact && 'pb-3')}>
        <div className="flex items-center gap-2">
          <h3 className={cn('font-semibold', compact ? 'text-base' : 'text-lg')}>
            {plan.name}
          </h3>
          {plan.badge && (
            <Badge variant="secondary" className="text-[10px] bg-[#2A8F9D]/10 text-[#2A8F9D]">
              {plan.badge}
            </Badge>
          )}
          {isCurrent && (
            <Badge variant="outline" className="text-[10px]">
              ATUAL
            </Badge>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          {plan.price === 0 ? (
            <span className={cn('font-bold', compact ? 'text-xl' : 'text-2xl')}>
              Gratis
            </span>
          ) : plan.price === -1 ? (
            <span className={cn('font-bold', compact ? 'text-lg' : 'text-xl')}>
              Sob consulta
            </span>
          ) : (
            <>
              <span className={cn('font-bold', compact ? 'text-xl' : 'text-2xl')}>
                R$ {plan.price}
              </span>
              <span className="text-sm text-muted-foreground">/mes</span>
            </>
          )}
        </div>
        {!compact && (
          <p className="text-sm text-muted-foreground">{plan.description}</p>
        )}
      </CardHeader>

      <CardContent className={cn('flex-1 space-y-2', compact && 'pt-0')}>
        <ul className={cn('space-y-1.5', compact ? 'text-xs' : 'text-sm')}>
          <li className="text-muted-foreground">
            {plan.limits.messagesPerMonth >= 999999
              ? 'Mensagens ilimitadas'
              : `${plan.limits.messagesPerMonth.toLocaleString('pt-BR')} mensagens/mes`}
          </li>
          <li className="text-muted-foreground">
            {plan.limits.agents >= 999
              ? 'Agentes ilimitados'
              : `${plan.limits.agents} agente${plan.limits.agents > 1 ? 's' : ''}`}
          </li>
          {!compact && (
            <>
              <li className="text-muted-foreground">
                {plan.limits.documentsPerAgent >= 999
                  ? 'Docs ilimitados'
                  : `${plan.limits.documentsPerAgent} docs/agente`}
              </li>
              <li className="text-muted-foreground">
                {plan.limits.kbSizeMB >= 10000
                  ? 'Armazenamento ilimitado'
                  : `${plan.limits.kbSizeMB} MB`}
              </li>
            </>
          )}
          <li className="text-muted-foreground">
            {plan.features.models.length} modelo{plan.features.models.length > 1 ? 's' : ''} de IA
          </li>
          {!compact && (
            <>
              <li className="text-muted-foreground">
                {plan.limits.conversationRetentionDays === -1
                  ? 'Historico ilimitado'
                  : `${plan.limits.conversationRetentionDays}d historico`}
              </li>
            </>
          )}
        </ul>

        {!compact && (
          <ul className="space-y-1.5 text-sm pt-2 border-t border-border">
            <FeatureRow enabled={plan.features.byok} label="BYOK" />
            <FeatureRow enabled={plan.features.openclaw} label="OpenClaw" />
            {plan.features.openclaw && plan.features.openclawChannels > 0 && (
              <li className="flex items-center gap-1.5 text-muted-foreground">
                <Check size={14} className="text-[#2A8F9D]" />
                {plan.features.openclawChannels >= 999
                  ? 'Canais ilimitados'
                  : `${plan.features.openclawChannels} canais`}
              </li>
            )}
            <FeatureRow enabled={plan.features.prioritySupport} label="Suporte prioritario" />
          </ul>
        )}

        <div className="pt-3">
          {isCurrent ? (
            <Button variant="outline" className="w-full" disabled>
              Atual
            </Button>
          ) : isEnterprise ? (
            <Button variant="outline" className="w-full" asChild>
              <a href="mailto:contato@teki.com.br">Fale conosco</a>
            </Button>
          ) : (
            <Button
              className={cn(
                'w-full',
                plan.highlighted && 'bg-[#2A8F9D] hover:bg-[#2A8F9D]/90'
              )}
              onClick={() => onSelect(plan.id)}
            >
              Assinar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <li className="flex items-center gap-1.5 text-muted-foreground">
      {enabled ? (
        <Check size={14} className="text-[#2A8F9D]" />
      ) : (
        <X size={14} className="text-muted-foreground/40" />
      )}
      {label}
    </li>
  );
}
