'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthErrorMessage } from '@/components/auth/AuthErrorMessage';
import { AuthSuccessMessage } from '@/components/auth/AuthSuccessMessage';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { Button } from '@/components/ui/button';
import { IconLoader2, IconLock } from '@tabler/icons-react';
import type { CatState } from '@/components/auth/AuthCatMascot';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [catState, setCatState] = useState<CatState>('idle');

  const canSubmit =
    token && password.length >= 8 && password === confirmPassword && !loading;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      if (password !== confirmPassword) {
        setError('As senhas nao conferem.');
        return;
      }

      setLoading(true);
      setError(null);
      setCatState('thinking');

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error?.message ?? 'Erro ao redefinir senha');
          setCatState('alert');
          return;
        }

        setCatState('happy');
        setSuccess('Senha alterada com sucesso! Redirecionando para o login...');

        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch {
        setError('Erro de conexao. Tente novamente.');
        setCatState('alert');
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, password, confirmPassword, token, router]
  );

  if (!token) {
    return (
      <AuthLayout catState="alert">
        <AuthCard step="no-token">
          <div className="py-6 text-center">
            <AuthErrorMessage message="Token de recuperacao nao encontrado. Solicite um novo link." />
            <a
              href="/forgot-password"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              Solicitar novo link
            </a>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout catState={catState}>
      <AuthCard step="reset">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <IconLock className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha uma nova senha segura
          </p>
        </div>

        {success ? (
          <AuthSuccessMessage message={success} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput
              id="password"
              label="Nova senha"
              value={password}
              onChange={setPassword}
              onFocus={() => setCatState('password')}
              onBlur={() => setCatState('watching')}
              autoComplete="new-password"
              disabled={loading}
            />
            <PasswordStrengthBar password={password} />

            <PasswordInput
              id="confirmPassword"
              label="Confirmar senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onFocus={() => setCatState('password')}
              onBlur={() => setCatState('watching')}
              autoComplete="new-password"
              disabled={loading}
              error={
                confirmPassword && password !== confirmPassword
                  ? 'As senhas nao conferem'
                  : undefined
              }
            />

            <AuthErrorMessage message={error} />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!canSubmit}
            >
              {loading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                'Redefinir senha'
              )}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
