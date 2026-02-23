'use client';

import { Badge } from '@/components/ui/badge';
import type { KbSolutionType } from '@prisma/client';

const SOLUTION_TYPE_CONFIG: Record<KbSolutionType, { label: string; className: string }> = {
  PERMANENT_FIX: { label: 'Correcao definitiva', className: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30' },
  WORKAROUND: { label: 'Contorno temporario', className: 'bg-amber-600/20 text-amber-400 border-amber-600/30' },
  CONFIGURATION: { label: 'Configuracao', className: 'bg-blue-600/20 text-blue-400 border-blue-600/30' },
  KNOWN_ISSUE: { label: 'Problema conhecido', className: 'bg-orange-600/20 text-orange-400 border-orange-600/30' },
  INFORMATIONAL: { label: 'Informativo', className: 'bg-zinc-600/20 text-zinc-400 border-zinc-600/30' },
};

interface KbSolutionTypeBadgeProps {
  type: KbSolutionType;
}

export function KbSolutionTypeBadge({ type }: KbSolutionTypeBadgeProps) {
  const config = SOLUTION_TYPE_CONFIG[type];
  return (
    <Badge variant="outline" className={`text-[10px] ${config.className}`}>
      {config.label}
    </Badge>
  );
}
