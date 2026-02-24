'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface KbDuplicateWarningProps {
  articleTitle: string;
  similarity: number;
  onViewExisting: () => void;
  onCreateAnyway: () => void;
}

export function KbDuplicateWarning({
  articleTitle,
  similarity,
  onViewExisting,
  onCreateAnyway,
}: KbDuplicateWarningProps) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
      <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-200">
          Artigo similar encontrado
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          &quot;{articleTitle}&quot; — Similaridade: {Math.round(similarity * 100)}%
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onViewExisting}>
            Ver existente
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onCreateAnyway}>
            Criar mesmo assim
          </Button>
        </div>
      </div>
    </div>
  );
}
