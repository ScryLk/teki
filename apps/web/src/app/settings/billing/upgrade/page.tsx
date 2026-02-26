'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLANS, PLAN_ORDER, isUpgrade as checkIsUpgrade } from '@/lib/plans';
import { PlanCard } from '@/components/billing/PlanCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import type { PlanTier } from '@prisma/client';

const VISIBLE_PLANS: PlanTier[] = ['FREE', 'STARTER', 'PRO'];

const FAQ = [
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, sem multa. Seu plano fica ativo ate o fim do periodo pago.',
  },
  {
    q: 'O que acontece se eu bater o limite?',
    a: 'O chat pausa ate o proximo mes ou ate voce fazer upgrade.',
  },
  {
    q: 'BYOK consome meu limite?',
    a: 'Nao. Mensagens com sua propria chave de API nao contam no limite mensal.',
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [currentPlanId, setCurrentPlanId] = useState<PlanTier>('FREE');
  const [loading, setLoading] = useState(true);
  const [downgradeConfirm, setDowngradeConfirm] = useState<PlanTier | null>(null);
  const [downgrading, setDowngrading] = useState(false);

  useEffect(() => {
    fetch('/api/v1/billing/plan')
      .then((r) => r.json())
      .then((data) => {
        setCurrentPlanId(data.plan.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (planId: PlanTier) => {
    if (checkIsUpgrade(currentPlanId, planId)) {
      router.push(`/settings/billing/checkout?plan=${planId}`);
    } else {
      setDowngradeConfirm(planId);
    }
  };

  const handleDowngrade = async () => {
    if (!downgradeConfirm) return;
    setDowngrading(true);
    try {
      const res = await fetch('/api/v1/billing/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: downgradeConfirm }),
      });
      if (res.ok) {
        setCurrentPlanId(downgradeConfirm);
        setDowngradeConfirm(null);
      }
    } finally {
      setDowngrading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-96 bg-card rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 mb-4"
          onClick={() => router.push('/settings/billing')}
        >
          <ArrowLeft size={14} />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Escolha o plano ideal</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Todos os planos incluem o gato mascote
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VISIBLE_PLANS.map((tier) => (
          <PlanCard
            key={tier}
            plan={PLANS[tier]}
            currentPlanId={currentPlanId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Precisa de mais? Enterprise sob consulta.{' '}
          <a
            href="mailto:contato@teki.com.br"
            className="text-[#2A8F9D] hover:underline"
          >
            Falar com vendas &rarr;
          </a>
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">FAQ rapido</h2>
        {FAQ.map((item) => (
          <div key={item.q} className="space-y-1">
            <p className="text-sm font-medium">{item.q}</p>
            <p className="text-sm text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>

      {/* Downgrade confirmation dialog */}
      <Dialog
        open={!!downgradeConfirm}
        onOpenChange={(o) => !o && setDowngradeConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar downgrade</DialogTitle>
            <DialogDescription>
              Voce esta mudando do plano {currentPlanId} para o{' '}
              {downgradeConfirm}. Alguns recursos podem ser desativados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDowngradeConfirm(null)}
              disabled={downgrading}
            >
              Cancelar
            </Button>
            <Button onClick={handleDowngrade} disabled={downgrading}>
              Confirmar downgrade
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
