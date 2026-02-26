'use client';

import { X, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageNudgeProps {
  type: 'warning' | 'exceeded';
  current: number;
  limit: number;
  onUpgrade: () => void;
  onDismiss?: () => void;
}

export function UsageNudge({
  type,
  current,
  limit,
  onUpgrade,
  onDismiss,
}: UsageNudgeProps) {
  const remaining = Math.max(0, limit - current);

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm border-b',
        type === 'warning' &&
          'bg-amber-500/10 border-amber-500/30 text-amber-200',
        type === 'exceeded' &&
          'bg-red-500/10 border-red-500/30 text-red-200'
      )}
    >
      {type === 'warning' ? (
        <AlertTriangle size={16} className="flex-shrink-0" />
      ) : (
        <Ban size={16} className="flex-shrink-0" />
      )}

      <span className="flex-1">
        {type === 'warning' ? (
          <>
            Voce usou {current} de {limit} mensagens este mes. Restam{' '}
            {remaining} mensagens.
          </>
        ) : (
          <>Limite de {limit} mensagens atingido. Faca upgrade para continuar.</>
        )}
      </span>

      <button
        onClick={onUpgrade}
        className={cn(
          'text-xs font-medium hover:underline flex-shrink-0',
          type === 'warning' && 'text-amber-300',
          type === 'exceeded' && 'text-red-300'
        )}
      >
        {type === 'warning' ? 'Ver planos' : 'Fazer upgrade'}
      </button>

      {onDismiss && type === 'warning' && (
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
