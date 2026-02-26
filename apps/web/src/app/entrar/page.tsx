'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, ChevronDown, ChevronUp } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<
    'google' | 'email' | 'credentials' | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/chat';
  const authError = searchParams.get('error');

  const handleGoogleLogin = () => {
    setIsLoading('google');
    signIn('google', { callbackUrl });
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading('email');
    setError(null);
    await signIn('resend', { email, callbackUrl, redirect: true });
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading('credentials');
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email ou senha incorretos.');
      setIsLoading(null);
    } else {
      window.location.href = callbackUrl;
    }
  };

  const displayError =
    error ||
    (authError === 'CredentialsSignin' ? 'Email ou senha incorretos.' : null);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Teki</h1>
          <p className="text-sm text-[#a1a1aa]">
            Seu assistente de suporte tecnico com IA
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-6">
          {/* Error */}
          {displayError && (
            <div className="text-red-400 bg-red-500/10 rounded-lg p-3 text-sm">
              {displayError}
            </div>
          )}

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-11 bg-white text-black hover:bg-gray-100 border-0 font-medium"
            onClick={handleGoogleLogin}
            disabled={isLoading !== null}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading === 'google' ? 'Conectando...' : 'Continuar com Google'}
          </Button>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-[#27272a]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f0f12] px-3 text-xs text-[#71717a]">
              ou
            </span>
          </div>

          {/* Magic Link */}
          <form onSubmit={handleMagicLink} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-[#18181b] border-[#3f3f46] focus:border-[#2A8F9D] text-white placeholder:text-[#52525b]"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#2A8F9D] hover:bg-[#237f8b] text-white font-medium"
              disabled={isLoading !== null || !email}
            >
              {isLoading === 'email'
                ? 'Enviando...'
                : 'Enviar link de acesso'}
            </Button>
          </form>

          {/* Password section (expandable) */}
          <div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center justify-between w-full text-sm text-[#a1a1aa] hover:text-[#2A8F9D] transition-colors"
            >
              <span>Prefere usar senha?</span>
              {showPassword ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showPassword && (
              <form onSubmit={handleCredentials} className="mt-4 space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-[#18181b] border-[#3f3f46] focus:border-[#2A8F9D] text-white placeholder:text-[#52525b]"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#71717a]" />
                  <Input
                    type="password"
                    placeholder="Senha (min. 8 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-[#18181b] border-[#3f3f46] focus:border-[#2A8F9D] text-white placeholder:text-[#52525b]"
                    minLength={8}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-[#2A8F9D] hover:bg-[#237f8b] text-white font-medium"
                  disabled={isLoading !== null || !email || !password}
                >
                  {isLoading === 'credentials' ? 'Entrando...' : 'Entrar'}
                </Button>
                <div className="flex flex-col gap-1 text-xs text-[#71717a]">
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    className="text-left hover:text-[#2A8F9D] transition-colors"
                  >
                    Nao tem senha? Enviar link de acesso.
                  </button>
                  <button
                    type="button"
                    onClick={handleMagicLink}
                    className="text-left hover:text-[#2A8F9D] transition-colors"
                  >
                    Esqueceu a senha? Enviar link de recuperacao.
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-[#52525b]">
          Ao continuar, voce concorda com os{' '}
          <a href="/docs/termos" className="text-[#2A8F9D] hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a
            href="/docs/privacidade"
            className="text-[#2A8F9D] hover:underline"
          >
            Politica de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#09090b]">
          <div className="text-[#71717a]">Carregando...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
