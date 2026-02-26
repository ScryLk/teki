'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Monitor, CheckCircle2, XCircle } from 'lucide-react';

function DeviceAuthContent() {
  const { data: session, status } = useSession();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (status === 'authenticated') {
      inputRefs.current[0]?.focus();
    }
  }, [status]);

  const handleInput = (index: number, value: string) => {
    const char = value.toUpperCase().slice(-1);
    if (char && !/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]$/.test(char)) return;

    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .toUpperCase()
      .replace(/[^ABCDEFGHJKMNPQRSTUVWXYZ23456789]/g, '')
      .slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextEmpty = Math.min(pasted.length, 5);
    inputRefs.current[nextEmpty]?.focus();
  };

  const fullCode = code.slice(0, 3).join('') + '-' + code.slice(3).join('');
  const isComplete = code.every((c) => c !== '');

  const handleAuthorize = async (approve: boolean) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/device/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode: fullCode, approve }),
      });

      if (res.ok) {
        setResult(approve ? 'success' : 'error');
      } else {
        const data = await res.json();
        setErrorMessage(
          data.error?.message || 'Codigo nao encontrado ou expirado.',
        );
      }
    } catch {
      setErrorMessage('Erro ao conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Not logged in — show login options
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
              <Monitor className="h-8 w-8 text-[#2A8F9D]" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-white">
                Autorizar Teki Desktop
              </h1>
              <p className="text-sm text-[#a1a1aa]">
                Primeiro, entre na sua conta:
              </p>
            </div>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-11 bg-white text-black hover:bg-gray-100 border-0 font-medium"
                onClick={() => signIn('google', { callbackUrl: '/auth/device' })}
              >
                Continuar com Google
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 bg-[#18181b] border-[#3f3f46] text-[#a1a1aa] hover:text-white hover:border-[#2A8F9D]"
                onClick={() => signIn(undefined, { callbackUrl: '/auth/device' })}
              >
                Entrar de outra forma
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Result screens
  if (result === 'success') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="text-lg font-semibold text-white">
              Desktop autorizado!
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              Pode fechar esta aba. O Teki Desktop ja esta conectado.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (result === 'error') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-4 text-center">
            <XCircle className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="text-lg font-semibold text-white">
              Acesso negado
            </h2>
            <p className="text-sm text-[#a1a1aa]">
              Voce negou o acesso ao Teki Desktop.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading session
  if (status === 'loading') {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#09090b]">
        <div className="text-[#71717a]">Carregando...</div>
      </div>
    );
  }

  // Logged in — show code input
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="bg-[#0f0f12] border border-[#27272a] rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#2A8F9D]/10 flex items-center justify-center">
              <Monitor className="h-8 w-8 text-[#2A8F9D]" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              Autorizar Teki Desktop
            </h1>
            <p className="text-xs text-[#71717a]">
              Logado como {session?.user?.email}
            </p>
          </div>

          <p className="text-sm text-[#a1a1aa] text-center">
            Digite o codigo que aparece no desktop:
          </p>

          {/* Code input */}
          <div className="flex items-center justify-center gap-1.5">
            {code.map((char, i) => (
              <div key={i} className="flex items-center">
                <Input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={char}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className="w-11 h-14 text-center text-xl font-mono font-bold bg-[#18181b] border-[#3f3f46] focus:border-[#2A8F9D] text-white uppercase"
                />
                {i === 2 && (
                  <span className="mx-1.5 text-2xl text-[#3f3f46] font-light">
                    -
                  </span>
                )}
              </div>
            ))}
          </div>

          {errorMessage && (
            <div className="text-red-400 bg-red-500/10 rounded-lg p-3 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full h-11 bg-[#2A8F9D] hover:bg-[#237f8b] text-white font-medium"
              onClick={() => handleAuthorize(true)}
              disabled={!isComplete || isSubmitting}
            >
              {isSubmitting ? 'Autorizando...' : 'Autorizar Teki Desktop'}
            </Button>
            <Button
              variant="ghost"
              className="w-full h-11 text-[#71717a] hover:text-red-400"
              onClick={() => handleAuthorize(false)}
              disabled={!isComplete || isSubmitting}
            >
              Negar
            </Button>
          </div>

          <p className="text-xs text-[#52525b] text-center">
            O desktop tera acesso a sua conta. Voce pode revogar em
            Configuracoes &rarr; API Keys.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DeviceAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center bg-[#09090b]">
          <div className="text-[#71717a]">Carregando...</div>
        </div>
      }
    >
      <DeviceAuthContent />
    </Suspense>
  );
}
