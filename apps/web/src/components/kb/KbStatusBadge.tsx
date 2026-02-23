'use client';

import { Badge } from '@/components/ui/badge';
import type { KbArticleStatus } from '@prisma/client';

const STATUS_CONFIG: Record<KbArticleStatus, { label: string; className: string }> = {
  DRAFT: { label: 'Rascunho', className: 'bg-zinc-600 hover:bg-zinc-700 text-white' },
  REVIEW: { label: 'Em revisao', className: 'bg-amber-600 hover:bg-amber-700 text-white' },
  PUBLISHED: { label: 'Publicado', className: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  ARCHIVED: { label: 'Arquivado', className: 'bg-zinc-700 hover:bg-zinc-800 text-zinc-300' },
  DEPRECATED: { label: 'Descontinuado', className: 'bg-red-600 hover:bg-red-700 text-white' },
};

interface KbStatusBadgeProps {
  status: KbArticleStatus;
  size?: 'sm' | 'default';
}

export function KbStatusBadge({ status, size = 'sm' }: KbStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={`${config.className} ${size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'}`}>
      {config.label}
    </Badge>
  );
}
