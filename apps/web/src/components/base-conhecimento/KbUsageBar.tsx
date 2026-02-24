'use client';

import { Button } from '@/components/ui/button';
import type { KbUsageSummary } from '@/lib/kb/types';

interface KbUsageBarProps {
  plan: string;
  usage: KbUsageSummary;
  onUpgradeClick: () => void;
}

function UsageProgress({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  const color =
    percentage > 95
      ? 'bg-destructive'
      : percentage > 80
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function KbUsageBar({ plan, usage, onUpgradeClick }: KbUsageBarProps) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="rounded-lg border p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Plano: {planLabel}</span>
        {plan !== 'enterprise' && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={onUpgradeClick}
          >
            Fazer Upgrade
          </Button>
        )}
      </div>

      <UsageProgress
        label="Artigos"
        value={`${usage.articles.used} / ${usage.articles.limit}`}
        percentage={usage.articles.percentage}
      />

      <UsageProgress
        label="Armazenamento"
        value={`${usage.storage.usedFormatted} / ${usage.storage.limitFormatted}`}
        percentage={usage.storage.percentage}
      />

      <UsageProgress
        label="Sugestões IA (hoje)"
        value={`${usage.aiSuggestions.usedToday} / ${usage.aiSuggestions.limitPerDay}`}
        percentage={usage.aiSuggestions.percentage}
      />

      {(usage.articles.percentage > 80 ||
        usage.storage.percentage > 80) && (
        <p className="text-[10px] text-amber-400">
          {usage.articles.percentage >= 100 || usage.storage.percentage >= 100
            ? 'Limite atingido! Considere fazer upgrade.'
            : 'Você está se aproximando do limite.'}
        </p>
      )}
    </div>
  );
}
