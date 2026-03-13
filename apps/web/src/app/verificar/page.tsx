'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

function VerificarContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) return;

    setStatus('verifying');

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data?.error?.message || 'Token inválido ou expirado');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Erro de conexão. Tente novamente.');
      });
  }, [token]);

  // Token present — show verification flow
  if (token) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-6 text-center">
            {status === 'verifying' && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-[#2A8F9D] animate-spin" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-semibold text-white">Verificando...</h1>
                  <p className="text-sm text-[#a1a1aa]">Aguarde enquanto confirmamos seu email.</p>
                </div>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-semibold text-white">Email verificado!</h1>
                  <p className="text-sm text-[#a1a1aa]">
                    Sua conta foi ativada com sucesso. Agora você pode fazer login.
                  </p>
                </div>
                <Link href="/entrar">
                  <Button className="w-full bg-[#2A8F9D] hover:bg-[#1E6B75] text-white">
                    Entrar no Teki
                  </Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-semibold text-white">Erro na verificação</h1>
                  <p className="text-sm text-[#a1a1aa]">{errorMsg}</p>
                </div>
                <Link href="/entrar">
                  <Button variant="ghost" className="text-[#a1a1aa] hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No token — show "check your email" message
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-[#2A8F9D]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-white">
              Confira seu email
            </h1>
            <p className="text-sm text-[#a1a1aa]">
              Enviamos um link de verificação para
              {email && (
                <span className="block text-white font-medium mt-1">
                  {email}
                </span>
              )}
            </p>
          </div>

          <p className="text-sm text-[#a1a1aa]">
            Clique no link do email para ativar sua conta.
            <br />O link expira em 24 horas.
          </p>

          <div className="text-xs text-[#71717a]">
            Não recebeu? Verifique a pasta de spam ou{' '}
            <Link href="/entrar" className="text-[#2A8F9D] hover:underline">
              tente novamente
            </Link>
            .
          </div>

          <Link href="/entrar">
            <Button
              variant="ghost"
              className="text-[#a1a1aa] hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerificarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#09090b]">
          <div className="text-[#71717a]">Carregando...</div>
        </div>
      }
    >
      <VerificarContent />
    </Suspense>
  );
}
