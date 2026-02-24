'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthErrorMessage } from '@/components/auth/AuthErrorMessage';
import { AuthSuccessMessage } from '@/components/auth/AuthSuccessMessage';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar';
import { ConsentCheckbox } from '@/components/auth/ConsentCheckbox';
import { LockedEmailField } from '@/components/auth/LockedEmailField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconLoader2, IconArrowLeft } from '@tabler/icons-react';
import type { CatState } from '@/components/auth/AuthCatMascot';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') ?? '';
  const isInvite = searchParams.get('invite') === '1';

  const [email, setEmail] = useState(prefillEmail);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [consentTerms, setConsentTerms] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [catState, setCatState] = useState<CatState>('idle');

  const canSubmit =
    email.trim() &&
    firstName.trim() &&
    password.length >= 8 &&
    consentTerms &&
    consentPrivacy &&
    !loading;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      setLoading(true);
      setError(null);
      setCatState('thinking');

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            firstName: firstName.trim(),
            lastName: lastName.trim() || undefined,
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error?.message ?? 'Erro ao criar conta');
          setCatState('alert');
          return;
        }

        setCatState('happy');
        setSuccess(
          'Conta criada com sucesso! Verifique seu email para ativar sua conta.'
        );

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch {
        setError('Erro de conexao. Tente novamente.');
        setCatState('alert');
      } finally {
        setLoading(false);
      }
    },
    [canSubmit, email, firstName, lastName, password, router]
  );

  return (
    <AuthLayout catState={catState}>
      <AuthCard step="register">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">
            {isInvite ? 'Aceitar convite' : 'Criar conta'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isInvite
              ? 'Complete seu cadastro para aceitar o convite'
              : 'Preencha os dados para comecar'}
          </p>
        </div>

        {success ? (
          <AuthSuccessMessage message={success} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            {prefillEmail ? (
              <div className="space-y-2">
                <Label>Email</Label>
                <LockedEmailField
                  email={prefillEmail}
                  onChangeEmail={() => router.push('/login')}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Nome"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Sobrenome"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              value={password}
              onChange={setPassword}
              onFocus={() => setCatState('password')}
              onBlur={() => setCatState('watching')}
              autoComplete="new-password"
              disabled={loading}
            />
            <PasswordStrengthBar password={password} />

            {/* LGPD Consent checkboxes */}
            <div className="space-y-3 pt-2">
              <ConsentCheckbox
                id="consent-terms"
                checked={consentTerms}
                onCheckedChange={setConsentTerms}
                required
              >
                Li e aceito os{' '}
                <a
                  href="/docs/termos"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Termos de Uso
                </a>{' '}
                do Teki.
              </ConsentCheckbox>

              <ConsentCheckbox
                id="consent-privacy"
                checked={consentPrivacy}
                onCheckedChange={setConsentPrivacy}
                required
              >
                Li e concordo com a{' '}
                <a
                  href="/docs/privacidade"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Politica de Privacidade
                </a>{' '}
                e o tratamento dos meus dados conforme a LGPD.
              </ConsentCheckbox>
            </div>

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
                'Criar conta'
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
            Ja tenho conta
          </a>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
