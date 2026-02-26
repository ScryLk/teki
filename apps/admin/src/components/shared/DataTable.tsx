'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  expandedContent?: (row: T) => React.ReactNode;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  pageSize = 20,
  onRowClick,
  expandedContent,
  emptyMessage = 'Nenhum dado encontrado',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null || bVal == null) return 0;
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-left text-xs font-medium text-muted-foreground',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground',
                    col.className
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? (
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
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row) => {
                const rowKey = String(row[keyField]);
                const isExpanded = expandedRow === rowKey;
                return (
                  <tr key={rowKey} className="group">
                    <td colSpan={columns.length} className="p-0">
                      <div
                        className={cn(
                          'grid transition-colors',
                          onRowClick && 'cursor-pointer',
                          'hover:bg-muted/30'
                        )}
                        style={{
                          gridTemplateColumns: columns
                            .map(() => '1fr')
                            .join(' '),
                        }}
                        onClick={() => {
                          if (expandedContent) {
                            setExpandedRow(isExpanded ? null : rowKey);
                          }
                          onRowClick?.(row);
                        }}
                      >
                        {columns.map((col) => (
                          <div
                            key={col.key}
                            className={cn(
                              'px-4 py-2.5 border-b border-border text-foreground',
                              col.className
                            )}
                          >
                            {col.render
                              ? col.render(row)
                              : String(row[col.key] ?? '')}
                          </div>
                        ))}
                      </div>
                      {expandedContent && isExpanded && (
                        <div className="px-4 py-3 bg-muted/20 border-b border-border">
                          {expandedContent(row)}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            {sorted.length} registros | Pagina {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
