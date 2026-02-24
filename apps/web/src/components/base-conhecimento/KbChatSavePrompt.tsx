'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, Check } from 'lucide-react';

interface KbChatSavePromptProps {
  chatSessionId: string;
  ticketId?: string;
  ticketCategory?: string;
  onSaved: () => void;
  onAnalyzed: (data: {
    suggestion: Record<string, unknown>;
    ai: Record<string, unknown>;
    categories: Array<Record<string, unknown>>;
  }) => void;
}

export function KbChatSavePrompt({
  chatSessionId,
  ticketId,
  ticketCategory,
  onAnalyzed,
}: KbChatSavePromptProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kb/articles/from-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatSessionId, ticketId, ticketCategory }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao analisar conversa');
      }

      const data = await res.json();
      onAnalyzed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 mb-4 p-4 rounded-lg border bg-accent/30">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <Check size={16} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Ticket resolvido</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deseja salvar esta solução na Base de Conhecimento? A IA vai extrair
            o problema e a solução automaticamente.
          </p>
          {error && (
            <p className="text-xs text-destructive mt-1">{error}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDismissed(true)}
              disabled={loading}
            >
              Não, obrigado
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <MessageSquare size={12} />
              )}
              Salvar na KB
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
