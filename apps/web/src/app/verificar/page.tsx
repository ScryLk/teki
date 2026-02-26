'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VerificarContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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
              Enviamos um link de acesso para
              {email && (
                <span className="block text-white font-medium mt-1">
                  {email}
                </span>
              )}
            </p>
          </div>

          <p className="text-sm text-[#a1a1aa]">
            Clique no link para entrar no Teki.
            <br />O link expira em 24 horas.
          </p>

          <div className="text-xs text-[#71717a]">
            Nao recebeu? Verifique a pasta de spam ou{' '}
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
