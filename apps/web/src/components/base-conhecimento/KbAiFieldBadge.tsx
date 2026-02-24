'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles, Pencil } from 'lucide-react';

interface KbAiFieldBadgeProps {
  source: 'ai' | 'user';
}

export function KbAiFieldBadge({ source }: KbAiFieldBadgeProps) {
  if (source === 'ai') {
    return (
      <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0 h-5">
        <Sparkles size={10} className="text-amber-400" />
        IA
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-[10px] px-1.5 py-0 h-5">
      <Pencil size={10} />
      Editado
    </Badge>
  );
}
