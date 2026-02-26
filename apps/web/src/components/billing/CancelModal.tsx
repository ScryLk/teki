'use client';

import { useState } from 'react';
import type { PlanTier } from '@prisma/client';
import { PLANS, getPlan, PLAN_ORDER } from '@/lib/plans';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CancelModalProps {
  open: boolean;
  onClose: () => void;
  currentPlanId: PlanTier;
  expiresAt: string | null;
  currentUsage?: { messages: number };
  onDowngrade: (planId: PlanTier) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
}

export function CancelModal({
  open,
  onClose,
  currentPlanId,
  expiresAt,
  currentUsage,
  onDowngrade,
  onCancel,
}: CancelModalProps) {
  const [step, setStep] = useState<'offer' | 'confirm'>(
    currentPlanId === 'STARTER' ? 'confirm' : 'offer'
  );
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const currentPlan = getPlan(currentPlanId);
  const freePlan = getPlan('FREE');

  // Find the next lower plan
  const currentIdx = PLAN_ORDER.indexOf(currentPlanId);
  const lowerPlanId = currentIdx > 1 ? PLAN_ORDER[currentIdx - 1] : null;
  const lowerPlan = lowerPlanId ? getPlan(lowerPlanId as PlanTier) : null;

  const formattedExpiry = expiresAt
    ? new Intl.DateTimeFormat('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(expiresAt))
    : null;

  const handleDowngrade = async () => {
    if (!lowerPlanId) return;
    setLoading(true);
    try {
      await onDowngrade(lowerPlanId as PlanTier);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onCancel(reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setStep(currentPlanId === 'STARTER' ? 'confirm' : 'offer');
          setReason('');
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        {step === 'offer' && lowerPlan ? (
          <>
            <DialogHeader>
              <DialogTitle>Antes de cancelar...</DialogTitle>
              <DialogDescription>
                Que tal mudar para o {lowerPlan.name}? Voce mantem o essencial
                por menos.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border p-4 space-y-2">
                <p className="font-medium text-sm">
                  Seu plano {currentPlan.name}
                </p>
                <p className="text-lg font-bold">R$ {currentPlan.price}/mes</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    {currentPlan.limits.messagesPerMonth.toLocaleString('pt-BR')}{' '}
                    msgs
                  </li>
                  <li>
                    {currentPlan.limits.agents} agente
                    {currentPlan.limits.agents > 1 ? 's' : ''}
                  </li>
                  <li>
                    OpenClaw {currentPlan.features.openclaw ? '✓' : '✗'}
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border border-[#2A8F9D]/30 bg-[#2A8F9D]/5 p-4 space-y-2">
                <p className="font-medium text-sm">{lowerPlan.name}</p>
                <p className="text-lg font-bold">R$ {lowerPlan.price}/mes</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>
                    {lowerPlan.limits.messagesPerMonth.toLocaleString('pt-BR')}{' '}
                    msgs
                  </li>
                  <li>
                    {lowerPlan.limits.agents} agente
                    {lowerPlan.limits.agents > 1 ? 's' : ''}
                  </li>
                  <li>
                    OpenClaw {lowerPlan.features.openclaw ? '✓' : '✗'}
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setStep('confirm')}
                disabled={loading}
              >
                Quero cancelar mesmo
              </Button>
              <Button
                className="bg-[#2A8F9D] hover:bg-[#2A8F9D]/90"
                onClick={handleDowngrade}
                disabled={loading}
              >
                Mudar para {lowerPlan.name}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cancelar assinatura</DialogTitle>
              <DialogDescription>
                {formattedExpiry ? (
                  <>
                    Seu plano {currentPlan.name} ficara ativo ate{' '}
                    {formattedExpiry}.
                  </>
                ) : (
                  <>Seu plano sera alterado para Free imediatamente.</>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <p className="text-sm text-muted-foreground">
                Apos o cancelamento, sua conta volta para o plano Free:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>
                  &bull; {freePlan.limits.messagesPerMonth} mensagens/mes
                  {currentUsage?.messages
                    ? ` (atualmente usa ~${currentUsage.messages})`
                    : ''}
                </li>
                <li>&bull; {freePlan.limits.agents} agente</li>
                <li>
                  &bull; {freePlan.limits.documentsPerAgent} documentos por
                  agente
                </li>
                <li>
                  &bull; Historico de {freePlan.limits.conversationRetentionDays}{' '}
                  dias
                </li>
              </ul>

              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">
                  Motivo (opcional):
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nao preciso mais / Muito caro / Outro"
                  rows={2}
                  maxLength={500}
                  className="resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Manter meu plano
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={loading}
              >
                Confirmar cancelamento
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
