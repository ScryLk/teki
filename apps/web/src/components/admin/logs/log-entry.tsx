'use client';

import { SeverityBadge } from './severity-badge';
import { CategoryIcon } from './category-icon';
import { ChevronRight } from 'lucide-react';

export interface LogRecord {
  id: string;
  category: string;
  eventType: string;
  severity: string;
  tenantId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  action?: string | null;
  summary: string;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  device?: string | null;
  requestMethod?: string | null;
  requestPath?: string | null;
  requestId?: string | null;
  durationMs?: number | null;
  statusCode?: number | null;
  createdAt: string;
}

export function LogEntry({
  log,
  onSelect,
}: {
  log: LogRecord;
  onSelect: (log: LogRecord) => void;
}) {
  const time = new Date(log.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const details = log.details as Record<string, unknown> | null;
  const tokens = details?.usage as Record<string, number> | undefined;
  const costUsd = typeof details?.cost_usd === 'number' ? details.cost_usd : null;
  const latency = log.durationMs;

  return (
    <button
      onClick={() => onSelect(log)}
      className="group w-full text-left transition-colors hover:bg-white/[0.03]"
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Timeline dot + icon */}
        <div className="flex flex-col items-center pt-0.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <CategoryIcon category={log.category} size={14} />
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">{time}</span>
            <SeverityBadge severity={log.severity} />
          </div>

          <p className="mt-1 text-sm text-zinc-200 line-clamp-2">{log.summary}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
            {log.tenantId && (
              <span>Tenant: {log.tenantId.slice(0, 8)}...</span>
            )}
            {log.ipAddress && (
              <span>IP: {log.ipAddress}</span>
            )}
            {tokens && (
              <span>Tokens: {(tokens.total_tokens ?? 0).toLocaleString('pt-BR')}</span>
            )}
            {costUsd !== null && (
              <span>${costUsd.toFixed(4)}</span>
            )}
            {latency && (
              <span>{latency.toLocaleString('pt-BR')}ms</span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={16}
          className="mt-1 shrink-0 text-zinc-600 transition-colors group-hover:text-zinc-400"
        />
      </div>

      <div className="ml-[52px] border-b border-white/5" />
    </button>
  );
}
