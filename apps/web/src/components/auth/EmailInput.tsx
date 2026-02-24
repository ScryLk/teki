'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { IconArrowRight, IconLoader2 } from '@tabler/icons-react';

interface EmailInputProps {
  onResult: (result: {
    email: string;
    action: 'login' | 'register' | 'sso' | 'invite';
    ssoProvider?: string;
    inviteToken?: string;
  }) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function EmailInput({ onResult, onError, disabled }: EmailInputProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) return;

      setLoading(true);
      try {
        const res = await fetch('/api/auth/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        });
        const data = await res.json();

        if (!res.ok) {
          onError?.(data.error?.message ?? 'Erro ao verificar email');
          return;
        }

        onResult({
          email: trimmed,
          action: data.action,
          ssoProvider: data.ssoProvider,
          inviteToken: data.inviteToken,
        });
      } catch {
        onError?.('Erro de conexao. Tente novamente.');
      } finally {
        setLoading(false);
      }
    },
    [email, onResult, onError]
  );

  return (
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
          disabled={disabled || loading}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={disabled || loading || !email.trim()}
      >
        {loading ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <>
            Continuar
            <IconArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
