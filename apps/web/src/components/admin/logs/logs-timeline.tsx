'use client';

import { LogEntry, type LogRecord } from './log-entry';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export function LogsTimeline({
  logs,
  pagination,
  loading,
  onSelect,
  onPageChange,
}: {
  logs: LogRecord[];
  pagination: Pagination | null;
  loading: boolean;
  onSelect: (log: LogRecord) => void;
  onPageChange: (page: number) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
        <span className="ml-2 text-sm text-zinc-500">Carregando logs...</span>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <p className="text-sm">Nenhum log encontrado</p>
        <p className="text-xs mt-1">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div>
      <div className="divide-y divide-transparent">
        {logs.map((log) => (
          <LogEntry key={log.id} log={log} onSelect={onSelect} />
        ))}
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft size={14} className="mr-1" />
            Anterior
          </Button>

          <span className="text-xs text-zinc-500">
            Pagina {pagination.page} de {pagination.total_pages}
            <span className="ml-2 text-zinc-600">
              ({pagination.total.toLocaleString('pt-BR')} registros)
            </span>
          </span>

          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page >= pagination.total_pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Proxima
            <ChevronRight size={14} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
