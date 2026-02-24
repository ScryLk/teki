'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthErrorMessage } from '@/components/auth/AuthErrorMessage';
import { AuthSuccessMessage } from '@/components/auth/AuthSuccessMessage';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconMailCheck } from '@tabler/icons-react';
import type { CatState } from '@/components/auth/AuthCatMascot';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [catState, setCatState] = useState<CatState>('thinking');

  const verify = useCallback(async () => {
    if (!token || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message ?? 'Erro ao verificar email');
        setCatState('alert');
        return;
      }

      setCatState('happy');
      setSuccess('Email verificado com sucesso! Redirecionando para o login...');

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch {
      setError('Erro de conexao. Tente novamente.');
      setCatState('alert');
    } finally {
      setLoading(false);
    }
  }, [token, loading, router]);

  useEffect(() => {
    if (token) {
      verify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <AuthLayout catState="alert">
        <AuthCard step="no-token">
          <div className="py-6 text-center">
            <AuthErrorMessage message="Token de verificacao nao encontrado." />
            <a
              href="/login"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Ir para login
            </a>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout catState={catState}>
      <AuthCard step="verify">
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <IconMailCheck className="size-6 text-primary" />
          </div>

          {loading && (
            <>
              <IconLoader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Verificando seu email...
              </p>
            </>
          )}

          <AuthSuccessMessage message={success} />
          <AuthErrorMessage message={error} />

          {error && (
            <Button variant="outline" onClick={verify} disabled={loading}>
              Tentar novamente
            </Button>
          )}
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
