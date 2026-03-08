'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PaymentStatus = 'polling' | 'paid' | 'timeout' | 'error';

const POLL_INTERVAL = 3000;
const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes

export default function BillingCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');

  // billingId can come from URL param or sessionStorage (set before redirect to AbacatePay)
  const billingIdParam = searchParams.get('billingId');
  const [resolvedBillingId, setResolvedBillingId] = useState<string | null>(billingIdParam);

  const [status, setStatus] = useState<PaymentStatus>('polling');
  const [plan, setPlan] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Try sessionStorage if not in URL
    if (!resolvedBillingId) {
      const stored = sessionStorage.getItem('teki_billing_id');
      if (stored) {
        setResolvedBillingId(stored);
        sessionStorage.removeItem('teki_billing_id');
        return;
      }
      setStatus('error');
      return;
    }

    const billingId = resolvedBillingId;

    const checkPayment = async () => {
      try {
        const elapsed = Date.now() - startTimeRef.current;
        if (elapsed > MAX_POLL_TIME) {
          setStatus('timeout');
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }

        const res = await fetch(`/api/v1/billing/payment-status?billingId=${billingId}`);
        const data = await res.json();

        if (data.status === 'paid') {
          setStatus('paid');
          setPlan(data.plan);
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Redirect to success after brief delay
          setTimeout(() => {
            router.push(`/settings/billing/success?plan=${data.plan}`);
          }, 2000);
        }
      } catch {
        // Continue polling on network errors
      }
    };

    checkPayment();
    intervalRef.current = setInterval(checkPayment, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [resolvedBillingId, router]);

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-20">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-bold">Link invalido</h1>
        <p className="text-muted-foreground text-sm">
          Nao foi possivel identificar o pagamento. Tente novamente pela pagina de billing.
        </p>
        <Button onClick={() => router.push('/settings/billing')}>
          Ir para Billing
        </Button>
      </div>
    );
  }

  if (status === 'timeout') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-20">
        <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <AlertCircle size={32} className="text-yellow-400" />
        </div>
        <h1 className="text-xl font-bold">Pagamento ainda nao confirmado</h1>
        <p className="text-muted-foreground text-sm">
          O pagamento pode levar alguns minutos para ser processado.
          Voce sera notificado quando o plano for ativado.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => {
            startTimeRef.current = Date.now();
            setStatus('polling');
            intervalRef.current = setInterval(async () => {
              const res = await fetch(`/api/v1/billing/payment-status?billingId=${resolvedBillingId}`);
              const data = await res.json();
              if (data.status === 'paid') {
                setStatus('paid');
                setPlan(data.plan);
                if (intervalRef.current) clearInterval(intervalRef.current);
                setTimeout(() => router.push(`/settings/billing/success?plan=${data.plan}`), 2000);
              }
            }, POLL_INTERVAL);
          }}>
            Tentar novamente
          </Button>
          <Button onClick={() => router.push('/settings/billing')}>
            Ir para Billing
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-20">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
          <Check size={32} className="text-[#2A8F9D]" />
        </div>
        <h1 className="text-xl font-bold">Pagamento confirmado!</h1>
        <p className="text-muted-foreground text-sm">
          Seu plano {plan} foi ativado. Redirecionando...
        </p>
      </div>
    );
  }

  // Polling state
  return (
    <div className="max-w-md mx-auto text-center space-y-6 py-20">
      <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
        <Loader2 size={32} className="text-[#2A8F9D] animate-spin" />
      </div>
      <h1 className="text-xl font-bold">Aguardando confirmacao do pagamento...</h1>
      <p className="text-muted-foreground text-sm">
        Assim que o PIX for confirmado, seu plano sera ativado automaticamente.
        <br />
        Nao feche esta pagina.
      </p>
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 size={12} className="animate-spin" />
        Verificando a cada {POLL_INTERVAL / 1000} segundos...
      </div>
    </div>
  );
}
