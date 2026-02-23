'use client';

import { cn } from '@/lib/utils';

const SEVERITY_CONFIG: Record<string, { label: string; className: string }> = {
  DEBUG: {
    label: 'DEBUG',
    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  },
  INFO: {
    label: 'INFO',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  WARN: {
    label: 'WARN',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  ERROR: {
    label: 'ERROR',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  CRITICAL: {
    label: 'CRITICAL',
    className: 'bg-red-600/20 text-red-400 border-red-500/30 animate-pulse',
  },
};

export function SeverityBadge({ severity }: { severity: string }) {
  const config = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.INFO;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        config.className
      )}
    >
      <span className={cn(
        'mr-1.5 h-1.5 w-1.5 rounded-full',
        severity === 'DEBUG' && 'bg-gray-400',
        severity === 'INFO' && 'bg-blue-400',
        severity === 'WARN' && 'bg-yellow-400',
        severity === 'ERROR' && 'bg-red-400',
        severity === 'CRITICAL' && 'bg-red-500 animate-ping',
      )} />
      {config.label}
    </span>
  );
}
