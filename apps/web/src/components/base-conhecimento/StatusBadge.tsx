'use client';

import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import type { SolutionStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: SolutionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'uploading':
    case 'extracting':
    case 'indexing':
      return (
        <Badge variant="secondary" className="gap-1 text-[10px]">
          <Loader2 size={10} className="animate-spin" />
          Processando
        </Badge>
      );
    case 'indexed':
      return (
        <Badge variant="default" className="gap-1 text-[10px] bg-emerald-600 hover:bg-emerald-700">
          <CheckCircle2 size={10} />
          Indexado
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive" className="gap-1 text-[10px]">
          <XCircle size={10} />
          Erro
        </Badge>
      );
  }
}
