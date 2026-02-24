'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AuthErrorMessage } from '@/components/auth/AuthErrorMessage';
import { EmailInput } from '@/components/auth/EmailInput';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LockedEmailField } from '@/components/auth/LockedEmailField';
import { Button } from '@/components/ui/button';
import { IconLoader2 } from '@tabler/icons-react';
import type { CatState } from '@/components/auth/AuthCatMascot';

type Step = 'email' | 'password' | 'redirect';

interface LookupResult {
  email: string;
  action: 'login' | 'register' | 'sso' | 'invite';
  hasPassword?: boolean;
  providers?: string[];
  ssoProvider?: string;
  inviteToken?: string;
  tenantName?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [catState, setCatState] = useState<CatState>('idle');

  const handleLookup = useCallback(
    (result: LookupResult) => {
      setError(null);
      setLookup(result);

      switch (result.action) {
        case 'register':
          router.push(`/register?email=${encodeURIComponent(result.email)}`);
          break;
        case 'invite':
          router.push(`/register?email=${encodeURIComponent(result.email)}&invite=1`);
          break;
        case 'login':
          setStep('password');
          setCatState('watching');
          break;
        case 'sso':
          // TODO: redirect to SSO provider
          break;
      }
    },
    [router]
  );

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!lookup) return;

      setLoading(true);
      setError(null);
      setCatState('thinking');

      try {
        const result = await signIn('credentials', {
          email: lookup.email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError('Email ou senha incorretos.');
          setCatState('alert');
          return;
        }

        setCatState('happy');
        setStep('redirect');

        // Small delay for the happy cat animation
        setTimeout(() => {
          router.push('/chat');
        }, 600);
      } catch {
        setError('Erro de conexao. Tente novamente.');
        setCatState('alert');
      } finally {
        setLoading(false);
      }
    },
    [lookup, password, router]
  );

  const handleBackToEmail = useCallback(() => {
    setStep('email');
    setLookup(null);
    setPassword('');
    setError(null);
    setCatState('idle');
  }, []);

  return (
    <AuthLayout catState={catState}>
      <AuthCard step={step}>
        {step === 'email' && (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold">Entrar no Teki</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite seu email para continuar
              </p>
            </div>

            <EmailInput
              onResult={handleLookup}
              onError={setError}
            />

            <AuthDivider />

            <OAuthButtons callbackUrl="/chat" />

            <AuthErrorMessage message={error} />

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Nao tem conta?{' '}
              <a
                href="/register"
                className="text-primary hover:underline"
              >
                Criar conta
              </a>
            </p>
          </>
        )}

        {step === 'password' && lookup && (
          <>
            <div className="mb-6 text-center">
              <h1 className="text-xl font-semibold">Bem-vindo de volta!</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite sua senha para entrar
              </p>
            </div>

            <LockedEmailField
              email={lookup.email}
              onChangeEmail={handleBackToEmail}
            />

            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <PasswordInput
                value={password}
                onChange={setPassword}
                onFocus={() => setCatState('password')}
                onBlur={() => setCatState('watching')}
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !password}
              >
                {loading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <AuthErrorMessage message={error} />

            <div className="mt-4 text-center">
              <a
                href={`/forgot-password?email=${encodeURIComponent(lookup.email)}`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Esqueceu a senha?
              </a>
            </div>

            {lookup.providers && lookup.providers.length > 0 && (
              <>
                <AuthDivider />
                <OAuthButtons
                  providers={lookup.providers}
                  callbackUrl="/chat"
                />
              </>
            )}
          </>
        )}

        {step === 'redirect' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <IconLoader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Entrando...</p>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
