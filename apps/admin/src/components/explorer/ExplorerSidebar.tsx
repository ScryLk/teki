'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import {
  Users, Building2, UserPlus, MessagesSquare, MessageSquare,
  Bot, Cpu, Radio, ClipboardList, Bell, Monitor, BarChart3,
  TrendingUp, Webhook, BookOpen, Database, BarChart,
} from 'lucide-react';
import type { ModelSummary, ModelCategory } from '@/lib/explorer/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Building2, UserPlus, MessagesSquare, MessageSquare,
  Bot, Cpu, Radio, ClipboardList, Bell, Monitor, BarChart3,
  TrendingUp, Webhook, BookOpen, Database,
};

const CATEGORY_ORDER: ModelCategory[] = [
  'core', 'messaging', 'ai', 'billing', 'integrations', 'system',
];

const CATEGORY_LABELS: Record<ModelCategory, string> = {
  core: 'Core',
  messaging: 'Mensagens',
  ai: 'Inteligencia Artificial',
  billing: 'Billing',
  social: 'Social',
  integrations: 'Integracoes',
  system: 'Sistema',
};

interface ExplorerSidebarProps {
  models: ModelSummary[];
}

export default function ExplorerSidebar({ models }: ExplorerSidebarProps) {
  const pathname = usePathname();

  const grouped = CATEGORY_ORDER
    .map((cat) => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: models.filter((m) => m.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="w-full space-y-4">
      {/* Dashboard link */}
      <Link
        href="/explorer/metrics"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
          pathname === '/explorer/metrics'
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <BarChart className="w-4 h-4" />
        <span>Metricas</span>
      </Link>

      <div className="h-px bg-border" />

      {grouped.map((group) => (
        <div key={group.category}>
          <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((model) => {
              const Icon = ICON_MAP[model.icon] || Database;
              const href = `/explorer/${model.prismaModel}`;
              const isActive =
                pathname === href || pathname.startsWith(href + '/');

              return (
                <Link
                  key={model.prismaModel}
                  href={href}
                  className={cn(
                    'flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{model.displayName}</span>
                  </div>
                  <span className="text-[10px] tabular-nums text-muted-foreground flex-shrink-0">
                    {formatNumber(model.recordCount)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
