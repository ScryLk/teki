'use client';

import {
  ClipboardList,
  Bot,
  Shield,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_CONFIG: Record<string, { icon: typeof ClipboardList; label: string; className: string }> = {
  AUDIT: {
    icon: ClipboardList,
    label: 'Auditoria',
    className: 'text-violet-400',
  },
  AI: {
    icon: Bot,
    label: 'IA',
    className: 'text-emerald-400',
  },
  SECURITY: {
    icon: Shield,
    label: 'Seguranca',
    className: 'text-amber-400',
  },
  SYSTEM: {
    icon: Settings,
    label: 'Sistema',
    className: 'text-slate-400',
  },
};

export function CategoryIcon({
  category,
  showLabel = false,
  size = 16,
}: {
  category: string;
  showLabel?: boolean;
  size?: number;
}) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.SYSTEM;
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5', config.className)}>
      <Icon size={size} />
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </span>
  );
}

export function getCategoryLabel(category: string) {
  return CATEGORY_CONFIG[category]?.label ?? category;
}
