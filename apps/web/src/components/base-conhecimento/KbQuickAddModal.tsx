'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Zap } from 'lucide-react';

interface KbQuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyzed: (data: { suggestion: Record<string, unknown>; ai: Record<string, unknown>; categories: Array<Record<string, unknown>> }) => void;
}

export function KbQuickAddModal({
  open,
  onOpenChange,
  onAnalyzed,
}: KbQuickAddModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = text.length;
  const isValid = charCount >= 50;

  const handleAnalyze = async () => {
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/kb/articles/quick-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao analisar texto');
      }

      const data = await res.json();
      onAnalyzed(data);
      setText('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Zap size={18} />
            Quick Add
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cole ou digite a solução abaixo. A IA vai preencher os campos
            automaticamente.
          </p>

          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ex: Erro 656 no JPosto, cliente com certificado A1 bloqueado. Acessar portal SEFAZ do estado, menu Serviços > NFC-e > Solicitar desbloqueio. Aguardar 15 min e retransmitir..."
              rows={8}
              className="text-sm resize-none pr-4"
              disabled={loading}
            />
            <span
              className={`absolute bottom-2 right-3 text-xs ${
                isValid ? 'text-muted-foreground' : 'text-destructive'
              }`}
            >
              {charCount}/50 chars
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!isValid || loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              Analisar com IA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
