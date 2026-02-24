'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthErrorMessage } from '@/components/auth/AuthErrorMessage';
import { AuthSuccessMessage } from '@/components/auth/AuthSuccessMessage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconLoader2, IconArrowLeft, IconMail } from '@tabler/icons-react';
import type { CatState } from '@/components/auth/AuthCatMascot';

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(prefillEmail);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [catState, setCatState] = useState<CatState>('idle');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || loading) return;

      setLoading(true);
      setError(null);
      setCatState('thinking');

      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        await res.json();

        // Always show success to prevent email enumeration
        setCatState('happy');
        setSuccess(
          'Se o email estiver cadastrado, voce recebera um link para redefinir sua senha.'
        );
      } catch {
        setError('Erro de conexao. Tente novamente.');
        setCatState('alert');
      } finally {
        setLoading(false);
      }
    },
    [email, loading]
  );

  return (
    <AuthLayout catState={catState}>
      <AuthCard step="forgot">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <IconMail className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Esqueceu a senha?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe seu email para receber um link de recuperacao
          </p>
        </div>

        {success ? (
          <AuthSuccessMessage message={success} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <AuthErrorMessage message={error} />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !email.trim()}
            >
              {loading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                'Enviar link de recuperacao'
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a
            href="/login"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <IconArrowLeft className="size-3" />
            Voltar para login
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
