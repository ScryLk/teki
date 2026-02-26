'use client';

import type { PlanTier } from '@prisma/client';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import { PlanCard } from './PlanCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { MessageSquareOff, UsersRound, Sparkles, Lock } from 'lucide-react';

type Trigger = 'message_limit' | 'agent_limit' | 'model_locked' | 'feature_locked';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  trigger: Trigger;
  currentPlanId: PlanTier;
  requiredPlanId?: PlanTier;
}

const MODAL_CONTENT: Record<
  Trigger,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    description: (limit?: number) => string;
  }
> = {
  message_limit: {
    icon: MessageSquareOff,
    title: 'Limite de mensagens atingido',
    description: (limit) =>
      `Voce usou suas ${limit ?? 50} mensagens do mes. Faca upgrade para continuar.`,
  },
  agent_limit: {
    icon: UsersRound,
    title: 'Limite de agentes atingido',
    description: (limit) =>
      `Seu plano permite ${limit ?? 1} agente(s). Faca upgrade para criar mais.`,
  },
  model_locked: {
    icon: Sparkles,
    title: 'Modelo nao disponivel no seu plano',
    description: () =>
      'Este modelo requer um plano superior. Faca upgrade para acessar todos os modelos.',
  },
  feature_locked: {
    icon: Lock,
    title: 'Recurso nao disponivel no seu plano',
    description: () => 'Este recurso requer um plano superior.',
  },
};

export function UpgradeModal({
  open,
  onClose,
  trigger,
  currentPlanId,
  requiredPlanId,
}: UpgradeModalProps) {
  const router = useRouter();
  const content = MODAL_CONTENT[trigger];
  const Icon = content.icon;
  const currentPlan = PLANS[currentPlanId];
  const limit =
    trigger === 'message_limit'
      ? currentPlan.limits.messagesPerMonth
      : trigger === 'agent_limit'
        ? currentPlan.limits.agents
        : undefined;

  // Show plans that are upgrades from current
  const currentIdx = PLAN_ORDER.indexOf(currentPlanId);
  const upgradePlans = PLAN_ORDER.slice(currentIdx + 1)
    .filter((t) => t !== 'ENTERPRISE')
    .map((t) => PLANS[t]);

  // If there's a required plan, filter to just those at or above it
  const filteredPlans = requiredPlanId
    ? upgradePlans.filter(
        (p) => PLAN_ORDER.indexOf(p.id) >= PLAN_ORDER.indexOf(requiredPlanId)
      )
    : upgradePlans;

  const handleSelect = (planId: PlanTier) => {
    onClose();
    router.push(`/settings/billing/checkout?plan=${planId}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center items-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
            <Icon size={24} className="text-muted-foreground" />
          </div>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description(limit)}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanId={currentPlanId}
              onSelect={handleSelect}
              compact
            />
          ))}
        </div>

        <button
          onClick={() => {
            onClose();
            router.push('/settings/billing/upgrade');
          }}
          className="text-sm text-[#2A8F9D] hover:underline text-center mt-2"
        >
          Ver todos os planos &rarr;
        </button>
      </DialogContent>
    </Dialog>
  );
}
