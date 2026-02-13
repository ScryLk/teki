'use client';

import { Badge } from '@/components/ui/badge';
import type { Criticality } from '@/lib/types';

interface CriticalityBadgeProps {
  criticality: Criticality;
}

const config: Record<Criticality, { label: string; className: string }> = {
  baixa: {
    label: 'Baixa',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30',
  },
  media: {
    label: 'Media',
    className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
  },
  alta: {
    label: 'Alta',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30',
  },
  critica: {
    label: 'Critica',
    className: 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30',
  },
};

export function CriticalityBadge({ criticality }: CriticalityBadgeProps) {
  const c = config[criticality];
  return (
    <Badge variant="outline" className={`text-[10px] ${c.className}`}>
      {c.label}
    </Badge>
  );
}
