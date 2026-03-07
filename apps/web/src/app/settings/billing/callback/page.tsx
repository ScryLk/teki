'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type PaymentState = 'polling' | 'confirmed' | 'timeout' | 'error';

const POLL_INTERVAL = 3000; // 3 seconds
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const [state, setState] = useState<PaymentState>('polling');
  const [dots, setDots] = useState('');
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const startPolling = useCallback(async () => {
    setState('polling');
    startTime.current = Date.now();

    while (true) {
      if (Date.now() - startTime.current > MAX_POLL_TIME) {
        setState('timeout');
        return;
      }

      try {
        // Check current plan status — if webhook already confirmed, plan will be non-FREE
        const res = await fetch('/api/v1/billing/plan');
        if (!res.ok) {
          setState('error');
          return;
        }

        const data = await res.json();

        // If plan is active (not FREE), payment was confirmed via webhook
        const planId = data.plan?.id ?? data.plan;
        if (planId && planId !== 'FREE') {
          setState('confirmed');
          setTimeout(() => {
            router.push(`/settings/billing/success?plan=${planId}`);
          }, 1500);
          return;
        }
      } catch {
        // Network error — continue polling
      }

      await new Promise((r) => setTimeout(r, POLL_INTERVAL));
    }
  }, [plan, router]);

  useEffect(() => {
    startPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-md mx-auto py-16">
      <Card>
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {state === 'polling' && (
            <>
              <Loader2 size={48} className="mx-auto animate-spin text-[#2A8F9D]" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Aguardando confirmacao{dots}</h2>
                <p className="text-sm text-muted-foreground">
                  Estamos verificando o pagamento do seu PIX. Isso pode levar alguns instantes.
                </p>
              </div>
            </>
          )}

          {state === 'confirmed' && (
            <>
              <CheckCircle size={48} className="mx-auto text-[#2A8F9D]" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Pagamento confirmado!</h2>
                <p className="text-sm text-muted-foreground">
                  Redirecionando...
                </p>
              </div>
            </>
          )}

          {state === 'timeout' && (
            <>
              <XCircle size={48} className="mx-auto text-yellow-500" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Tempo esgotado</h2>
                <p className="text-sm text-muted-foreground">
                  Ainda nao recebemos a confirmacao do pagamento. Se voce ja pagou, o plano sera
                  ativado automaticamente assim que o pagamento for processado.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/settings/billing')}
              >
                Voltar para Billing
              </Button>
            </>
          )}

          {state === 'error' && (
            <>
              <XCircle size={48} className="mx-auto text-red-500" />
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Erro ao verificar pagamento</h2>
                <p className="text-sm text-muted-foreground">
                  Ocorreu um erro ao verificar o status do pagamento. Tente novamente.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => startPolling()}
                >
                  Tentar novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/settings/billing')}
                >
                  Voltar para Billing
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
