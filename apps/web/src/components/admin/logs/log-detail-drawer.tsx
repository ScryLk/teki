'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SeverityBadge } from './severity-badge';
import { CategoryIcon, getCategoryLabel } from './category-icon';
import { LogJsonViewer } from './log-json-viewer';
import type { LogRecord } from './log-entry';

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h4>
      {children}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="shrink-0 text-xs text-zinc-500">{label}</span>
      <span className="text-right text-xs text-zinc-300 break-all">{value}</span>
    </div>
  );
}

export function LogDetailDrawer({
  log,
  open,
  onClose,
}: {
  log: LogRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!log) return null;

  const details = log.details as Record<string, unknown> | null;
  const createdAt = new Date(log.createdAt);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-full max-w-lg sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sm">
            <CategoryIcon category={log.category} size={18} />
            Detalhes do Log
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-6">
          {/* ID + Timestamp */}
          <div className="space-y-1">
            <p className="font-mono text-xs text-zinc-600">ID: {log.id}</p>
            <p className="text-xs text-zinc-500">
              {createdAt.toLocaleDateString('pt-BR')} {createdAt.toLocaleTimeString('pt-BR', { fractionalSecondDigits: 3 })}
            </p>
          </div>

          {/* Classification */}
          <DetailSection title="Classificacao">
            <DetailRow label="Categoria" value={getCategoryLabel(log.category)} />
            <DetailRow label="Evento" value={log.eventType} />
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="shrink-0 text-xs text-zinc-500">Severidade</span>
              <SeverityBadge severity={log.severity} />
            </div>
          </DetailSection>

          {/* Context */}
          <DetailSection title="Contexto">
            <DetailRow label="Tenant" value={log.tenantId} />
            <DetailRow label="Usuario" value={log.userName ?? log.userEmail ?? log.userId} />
            <DetailRow label="Email" value={log.userEmail} />
            <DetailRow label="Entidade" value={log.entityType ? `${log.entityType} (${log.entityId ?? '-'})` : null} />
            <DetailRow label="Acao" value={log.action} />
          </DetailSection>

          {/* Summary */}
          <DetailSection title="Resumo">
            <p className="text-sm text-zinc-300">{log.summary}</p>
          </DetailSection>

          {/* Details JSON */}
          {details && Object.keys(details).length > 0 && (
            <DetailSection title="Detalhes (JSON)">
              <LogJsonViewer data={details} />
            </DetailSection>
          )}

          {/* Request info */}
          {(log.ipAddress || log.device || log.requestMethod) && (
            <DetailSection title="Request">
              <DetailRow label="IP" value={log.ipAddress} />
              <DetailRow label="Device" value={log.device} />
              <DetailRow label="Metodo" value={log.requestMethod ? `${log.requestMethod} ${log.requestPath ?? ''}` : null} />
              <DetailRow label="Request ID" value={log.requestId} />
              <DetailRow label="Status" value={log.statusCode ? String(log.statusCode) : null} />
              <DetailRow label="Duracao" value={log.durationMs ? `${log.durationMs.toLocaleString('pt-BR')}ms` : null} />
            </DetailSection>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
