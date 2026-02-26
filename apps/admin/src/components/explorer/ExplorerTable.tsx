'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import {
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Copy, Check, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ColumnConfig } from '@/lib/explorer/types';

interface ExplorerTableProps {
  columns: ColumnConfig[];
  data: Record<string, unknown>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  sort?: string;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onRowClick: (row: Record<string, unknown>) => void;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="opacity-0 group-hover/cell:opacity-100 ml-1 p-0.5 rounded hover:bg-muted transition-all"
      title="Copiar"
    >
      {copied ? (
        <Check className="w-3 h-3 text-emerald-400" />
      ) : (
        <Copy className="w-3 h-3 text-muted-foreground" />
      )}
    </button>
  );
}

function CellValue({
  column,
  value,
}: {
  column: ColumnConfig;
  value: unknown;
}) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50">-</span>;
  }

  switch (column.type) {
    case 'id':
      return (
        <div className="flex items-center gap-0.5 group/cell">
          <code className="text-[11px] font-mono text-muted-foreground">
            {column.truncate
              ? String(value).slice(0, column.truncate)
              : String(value)}
          </code>
          {column.copyable && <CopyButton value={String(value)} />}
        </div>
      );

    case 'boolean':
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold',
            value
              ? 'bg-emerald-400/20 text-emerald-400'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {value ? 'S' : 'N'}
        </span>
      );

    case 'enum':
      return (
        <span
          className="inline-flex items-center gap-1.5 text-xs"
        >
          {column.enumColors?.[String(value)] && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: column.enumColors[String(value)] }}
            />
          )}
          <span>{String(value)}</span>
        </span>
      );

    case 'datetime':
    case 'date':
      return (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(value as string | Date)}
        </span>
      );

    case 'number':
      return (
        <span className="text-xs tabular-nums">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value)}
        </span>
      );

    case 'email':
      return (
        <div className="flex items-center gap-0.5 group/cell">
          <span className="text-xs truncate">{String(value)}</span>
          {column.copyable && <CopyButton value={String(value)} />}
        </div>
      );

    case 'json':
      return (
        <code className="text-[10px] font-mono text-muted-foreground truncate block max-w-[200px]">
          {column.truncate
            ? JSON.stringify(value).slice(0, column.truncate)
            : JSON.stringify(value)}
        </code>
      );

    case 'relation':
      if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        const display =
          obj.displayName || obj.name || obj.firstName || obj.title || obj.id;
        return (
          <span className="text-xs text-primary/80 flex items-center gap-1">
            {String(display)}
            <ExternalLink className="w-3 h-3" />
          </span>
        );
      }
      return <span className="text-xs">{String(value)}</span>;

    default:
      return (
        <div className="flex items-center gap-0.5 group/cell">
          <span className={cn('text-xs', column.truncate && 'truncate')} style={column.truncate ? { maxWidth: `${column.truncate * 7}px` } : undefined}>
            {String(value)}
          </span>
          {column.copyable && <CopyButton value={String(value)} />}
        </div>
      );
  }
}

export default function ExplorerTable({
  columns,
  data,
  pagination,
  sort,
  onSort,
  onPageChange,
  onRowClick,
}: ExplorerTableProps) {
  const currentSortField = sort?.startsWith('-') ? sort.slice(1) : sort;
  const currentSortDir = sort?.startsWith('-') ? 'desc' : 'asc';

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.field}
                  className={cn(
                    'px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground'
                  )}
                  style={{ width: col.width, minWidth: col.width }}
                  onClick={() => col.sortable && onSort(col.field)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && currentSortField === col.field && (
                      currentSortDir === 'asc' ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-16 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={String(row.id) || idx}
                  className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onRowClick(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.field}
                      className="px-3 py-2"
                      style={{ width: col.width, maxWidth: col.width }}
                    >
                      <CellValue column={col} value={row[col.field]} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
        <span className="text-xs text-muted-foreground">
          Mostrando {((pagination.page - 1) * pagination.pageSize) + 1}-
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
          {pagination.total.toLocaleString('pt-BR')} registros
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!pagination.hasPrev}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground px-2 tabular-nums">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={!pagination.hasNext}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
