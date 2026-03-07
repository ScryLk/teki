'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPlan, PLAN_ORDER } from '@/lib/plans';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import type { PlanTier } from '@prisma/client';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') as PlanTier | null;

  const [billingName, setBillingName] = useState('');
  const [email, setEmail] = useState('');
  const [billingCompany, setBillingCompany] = useState('');
  const [billingTaxId, setBillingTaxId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Prefill from existing billing data
    fetch('/api/v1/billing/billing-data')
      .then((r) => r.json())
      .then((data) => {
        if (data.billingName) setBillingName(data.billingName);
        if (data.billingCompany) setBillingCompany(data.billingCompany);
        if (data.email) setEmail(data.email);
      })
      .catch(() => {});
  }, []);

  if (!planId || !PLAN_ORDER.includes(planId) || planId === 'FREE' || planId === 'ENTERPRISE') {
    router.replace('/settings/billing/upgrade');
    return null;
  }

  const plan = getPlan(planId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Save billing data
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingName: billingName.trim(),
          billingCompany: billingCompany.trim(),
          billingTaxId: billingTaxId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? 'Erro ao processar.');
        return;
      }

      // 2. If simulation mode, go straight to success
      if (data.simulation) {
        router.push(`/settings/billing/success?plan=${planId}`);
        return;
      }

      // 3. Create AbacatePay billing and redirect to PIX checkout
      const subRes = await fetch('/api/v1/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const subData = await subRes.json();

      if (!subRes.ok) {
        setError(subData.error?.message ?? 'Erro ao gerar cobranca.');
        return;
      }

      // Redirect to AbacatePay checkout page (PIX)
      window.location.href = subData.checkoutUrl;
    } catch {
      setError('Erro de conexao. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 mb-4"
          onClick={() => router.push('/settings/billing/upgrade')}
        >
          <ArrowLeft size={14} />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Assinar Teki {plan.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billing Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seus dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="billingName">Nome completo *</Label>
              <Input
                id="billingName"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billingCompany">Empresa (opcional)</Label>
              <Input
                id="billingCompany"
                value={billingCompany}
                onChange={(e) => setBillingCompany(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billingTaxId">CPF ou CNPJ *</Label>
              <Input
                id="billingTaxId"
                value={billingTaxId}
                onChange={(e) => setBillingTaxId(e.target.value)}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Teki {plan.name}</span>
              <span className="font-semibold">
                R$ {plan.price.toFixed(2).replace('.', ',')}/mes
              </span>
            </div>

            <Separator />

            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Check size={14} className="text-[#2A8F9D]" />
                {plan.limits.messagesPerMonth.toLocaleString('pt-BR')} mensagens/mes
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={14} className="text-[#2A8F9D]" />
                {plan.limits.agents} agente{plan.limits.agents > 1 ? 's' : ''}
              </li>
              <li className="flex items-center gap-1.5">
                <Check size={14} className="text-[#2A8F9D]" />
                {plan.features.models.length} modelos de IA
              </li>
              {plan.features.openclaw && (
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#2A8F9D]" />
                  OpenClaw ({plan.features.openclawChannels} canais)
                </li>
              )}
              {plan.features.byok && (
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#2A8F9D]" />
                  BYOK (chave propria)
                </li>
              )}
              {plan.features.prioritySupport && (
                <li className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#2A8F9D]" />
                  Suporte prioritario
                </li>
              )}
            </ul>

            <Separator />

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Cobranca mensal recorrente.</p>
              <p>Cancele a qualquer momento, sem multa.</p>
            </div>

            <div className="flex items-center justify-between font-semibold">
              <span>Total:</span>
              <span>R$ {plan.price.toFixed(2).replace('.', ',')}/mes</span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#2A8F9D] hover:bg-[#2A8F9D]/90 h-12 text-base"
          disabled={submitting}
        >
          {submitting ? 'Processando...' : 'Confirmar e pagar via PIX →'}
        </Button>

        <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
          <Lock size={12} />
          Pagamento seguro via PIX (AbacatePay)
        </p>
      </form>
    </div>
  );
}
