'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UsageBarProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  status: 'normal' | 'warning' | 'critical' | 'exceeded';
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  normal: '[&>div]:bg-[#2A8F9D]',
  warning: '[&>div]:bg-amber-500',
  critical: '[&>div]:bg-red-500',
  exceeded: '[&>div]:bg-red-500 [&>div]:animate-pulse',
};

export function UsageBar({
  label,
  current,
  limit,
  unit,
  status,
  showUpgrade,
  onUpgrade,
}: UsageBarProps) {
  const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
  const displayCurrent = unit ? `${current} ${unit}` : current;
  const displayLimit = unit ? `${limit} ${unit}` : limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-foreground tabular-nums">
            {displayCurrent}/{displayLimit}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {Math.round(percentage)}%
          </span>
        </div>
      </div>
      <Progress
        value={percentage}
        className={cn('h-2', STATUS_COLORS[status])}
      />
      {showUpgrade && status === 'exceeded' && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="text-xs text-[#2A8F9D] hover:underline"
        >
          Fazer upgrade &rarr;
        </button>
      )}
    </div>
  );
}
