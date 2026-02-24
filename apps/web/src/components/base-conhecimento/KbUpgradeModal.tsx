'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Check } from 'lucide-react';

interface KbUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredPlan: string;
  currentPlan: string;
  feature?: string;
}

const PLAN_FEATURES: Record<string, { price: string; features: string[] }> = {
  starter: {
    price: 'R$ 29,00/mês',
    features: [
      'Salvar do Chat para a Base de Conhecimento',
      'Até 500 artigos na base',
      '1GB de armazenamento',
      '100 sugestões de IA por dia',
      '10 usuários',
    ],
  },
  pro: {
    price: 'R$ 79,00/mês',
    features: [
      'Upload de PDF, DOCX, TXT e MD',
      'Salvar do Chat para a Base',
      'Até 5.000 artigos na base',
      '10GB de armazenamento',
      '500 sugestões de IA por dia',
      '30 usuários',
      'BYOK (Use sua própria chave de IA)',
    ],
  },
  enterprise: {
    price: 'Sob consulta',
    features: [
      'Todos os recursos do Pro',
      'Artigos e armazenamento ilimitados',
      'Sugestões de IA ilimitadas',
      'Usuários ilimitados',
      'Suporte prioritário',
    ],
  },
};

export function KbUpgradeModal({
  open,
  onOpenChange,
  requiredPlan,
  currentPlan,
  feature,
}: KbUpgradeModalProps) {
  const planKey = requiredPlan.toLowerCase();
  const planInfo = PLAN_FEATURES[planKey];
  const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1).toLowerCase();
  const currentLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1).toLowerCase();

  if (!planInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lock size={18} />
            {feature
              ? `${feature} é um recurso do plano ${planLabel}`
              : `Recurso do plano ${planLabel}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Com o plano {planLabel} você pode:
          </p>

          <div className="space-y-2">
            {planInfo.features.map((feat) => (
              <div key={feat} className="flex items-start gap-2">
                <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feat}</span>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>Seu plano atual: {currentLabel}</p>
            <p>
              Plano {planLabel}: <span className="text-foreground font-medium">{planInfo.price}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Manter plano atual
            </Button>
            <Button className="flex-1">
              Fazer Upgrade
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
