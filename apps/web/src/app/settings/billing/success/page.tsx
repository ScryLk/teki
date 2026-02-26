'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { getPlan, PLAN_ORDER } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { Check, Plus, Plug, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { PlanTier } from '@prisma/client';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as PlanTier | null;

  if (!planId || !PLAN_ORDER.includes(planId)) {
    router.replace('/settings/billing');
    return null;
  }

  const plan = getPlan(planId);

  return (
    <div className="max-w-lg mx-auto text-center space-y-6 py-12">
      {/* Success Icon */}
      <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
        <Check size={32} className="text-[#2A8F9D]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Bem-vindo ao Teki {plan.name}!</h1>
        <p className="text-muted-foreground">
          Seu plano foi ativado com sucesso.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        Agora voce tem acesso a:
      </p>

      <ul className="space-y-2 text-sm text-left max-w-xs mx-auto">
        <li className="flex items-center gap-2">
          <Check size={16} className="text-[#2A8F9D] flex-shrink-0" />
          {plan.limits.messagesPerMonth.toLocaleString('pt-BR')} mensagens por mes
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-[#2A8F9D] flex-shrink-0" />
          {plan.limits.agents} agente{plan.limits.agents > 1 ? 's especializados' : ''}
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-[#2A8F9D] flex-shrink-0" />
          {plan.features.models.length} modelos de IA
        </li>
        {plan.features.openclaw && (
          <li className="flex items-center gap-2">
            <Check size={16} className="text-[#2A8F9D] flex-shrink-0" />
            OpenClaw &mdash; conecte WhatsApp, Telegram e mais
          </li>
        )}
        {plan.features.byok && (
          <li className="flex items-center gap-2">
            <Check size={16} className="text-[#2A8F9D] flex-shrink-0" />
            BYOK &mdash; use sua propria API key
          </li>
        )}
        {plan.features.prioritySupport && (
          <li className="flex items-center gap-2">
            <Check size={16} className="text-[#2A8F9D] flex-shrink-0" />
            Suporte prioritario
          </li>
        )}
      </ul>

      <Button
        className="bg-[#2A8F9D] hover:bg-[#2A8F9D]/90 h-12 px-8 text-base"
        onClick={() => router.push('/chat')}
      >
        Comecar a usar &rarr;
      </Button>

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <Link href="/chat" className="hover:text-foreground flex items-center gap-1">
          <Plus size={14} />
          Criar novo agente
        </Link>
        <span>&middot;</span>
        <Link href="/base-conhecimento" className="hover:text-foreground flex items-center gap-1">
          <BookOpen size={14} />
          Ver docs
        </Link>
      </div>
    </div>
  );
}
