'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ExplorerTable from '@/components/explorer/ExplorerTable';
import ExplorerFilters from '@/components/explorer/ExplorerFilters';
import RecordDetail from '@/components/explorer/RecordDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { ColumnConfig, FilterConfig, ModelConfig } from '@/lib/explorer/types';

interface SchemaData {
  modelName: string;
  displayName: string;
  config: {
    allowEdit: boolean;
    allowDelete: boolean;
    allowHardDelete: boolean;
    searchableFields: string[];
    filters: FilterConfig[];
    listColumns: ColumnConfig[];
    exportable: boolean;
  };
}

interface RecordsResponse {
  data: Record<string, unknown>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function ModelExplorerPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [schema, setSchema] = useState<SchemaData | null>(null);
  const [records, setRecords] = useState<RecordsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Query state
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [filters, setFilters] = useState<Record<string, unknown>>(() => {
    const f: Record<string, unknown> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        try {
          f[key.slice(7)] = JSON.parse(value);
        } catch {
          f[key.slice(7)] = value;
        }
      }
    }
    return f;
  });

  // Debounce search
  const [searchDebounced, setSearchDebounced] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Load schema
  useEffect(() => {
    setSchema(null);
    setRecords(null);
    setLoading(true);
    setSelectedId(null);
    setPage(1);
    setSearch('');
    setSort('');
    setFilters({});

    fetch(`/api/explorer/models/${model}/schema`)
      .then((r) => r.json())
      .then((data) => setSchema(data.schema))
      .catch(() => {});
  }, [model]);

  // Load records
  const fetchRecords = useCallback(async () => {
    if (!schema) return;
    setLoading(true);

    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', '25');
    if (searchDebounced) params.set('search', searchDebounced);
    if (sort) params.set('sort', sort);

    for (const [key, value] of Object.entries(filters)) {
      params.set(`filter_${key}`, typeof value === 'string' ? value : JSON.stringify(value));
    }

    try {
      const res = await fetch(
        `/api/explorer/models/${model}/records?${params.toString()}`
      );
      const data = await res.json();
      setRecords(data);
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  }, [model, schema, page, searchDebounced, sort, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  function handleSort(field: string) {
    if (sort === field) {
      setSort(`-${field}`);
    } else if (sort === `-${field}`) {
      setSort('');
    } else {
      setSort(field);
    }
    setPage(1);
  }

  function handleExport(format: 'json' | 'csv') {
    const params = new URLSearchParams();
    params.set('format', format);
    if (searchDebounced) params.set('search', searchDebounced);
    if (sort) params.set('sort', sort);
    for (const [key, value] of Object.entries(filters)) {
      params.set(`filter_${key}`, typeof value === 'string' ? value : JSON.stringify(value));
    }
    window.open(`/api/explorer/models/${model}/export?${params.toString()}`, '_blank');
  }

  if (!schema) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded" />
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/explorer" className="hover:text-foreground transition-colors">
          Explorer
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{schema.displayName}</span>
        {selectedId && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-mono text-xs">
              {selectedId.slice(0, 8)}...
            </span>
          </>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{schema.displayName}</h1>
        {records && (
          <span className="text-xs text-muted-foreground">
            {records.pagination.total.toLocaleString('pt-BR')} registros
          </span>
        )}
      </div>

      {/* Filters */}
      <ExplorerFilters
        searchableFields={schema.config.searchableFields}
        filters={schema.config.filters}
        search={search}
        activeFilters={filters}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        onFilterChange={(f) => {
          setFilters(f);
          setPage(1);
        }}
        onExport={handleExport}
        exportable={schema.config.exportable}
      />

      {/* Table */}
      {loading && !records ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : records ? (
        <div className={loading ? 'opacity-50 pointer-events-none transition-opacity' : ''}>
          <ExplorerTable
            columns={schema.config.listColumns}
            data={records.data}
            pagination={records.pagination}
            sort={sort}
            onSort={handleSort}
            onPageChange={setPage}
            onRowClick={(row) => setSelectedId(String(row.id))}
          />
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          Erro ao carregar registros
        </p>
      )}

      {/* Detail panel */}
      {selectedId && schema && (
        <RecordDetail
          model={model}
          recordId={selectedId}
          config={{
            prismaModel: schema.modelName,
            displayName: schema.displayName,
            titleField: 'displayName',
            subtitleField: undefined,
            hiddenFields: [],
            maskedFields: [],
            readOnlyFields: [],
            searchableFields: schema.config.searchableFields,
            defaultSortField: 'createdAt',
            defaultSortOrder: 'desc',
            listColumns: schema.config.listColumns,
            filters: schema.config.filters,
            expandableRelations: [],
            inlineRelations: [],
            allowEdit: schema.config.allowEdit,
            allowDelete: schema.config.allowDelete,
            allowHardDelete: schema.config.allowHardDelete,
            editableFields: [],
            exportable: schema.config.exportable,
            maxExportRows: 10000,
            icon: '',
            category: 'core',
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
