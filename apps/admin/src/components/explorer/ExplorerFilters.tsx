'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, Download } from 'lucide-react';
import type { FilterConfig } from '@/lib/explorer/types';

interface ExplorerFiltersProps {
  searchableFields: string[];
  filters: FilterConfig[];
  search: string;
  activeFilters: Record<string, unknown>;
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: Record<string, unknown>) => void;
  onExport: (format: 'json' | 'csv') => void;
  exportable: boolean;
}

export default function ExplorerFilters({
  searchableFields,
  filters,
  search,
  activeFilters,
  onSearchChange,
  onFilterChange,
  onExport,
  exportable,
}: ExplorerFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeCount = Object.keys(activeFilters).length;

  function setFilter(field: string, value: unknown) {
    const next = { ...activeFilters };
    if (
      value === '' ||
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete next[field];
    } else {
      next[field] = value;
    }
    onFilterChange(next);
  }

  function clearAll() {
    onFilterChange({});
    onSearchChange('');
  }

  return (
    <div className="space-y-3">
      {/* Search + Actions bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              searchableFields.length > 0
                ? `Buscar em ${searchableFields.join(', ')}...`
                : 'Busca indisponivel'
            }
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
            disabled={searchableFields.length === 0}
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
              {activeCount}
            </span>
          )}
        </Button>

        {(activeCount > 0 || search) && (
          <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={clearAll}>
            Limpar
          </Button>
        )}

        {exportable && (
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => onExport('csv')}>
              <Download className="w-3.5 h-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => onExport('json')}>
              <Download className="w-3.5 h-3.5" />
              JSON
            </Button>
          </div>
        )}
      </div>

      {/* Expandable filter panel */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg border border-border">
          {filters.map((filter) => (
            <div key={filter.field} className="space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {filter.label}
              </label>
              <FilterInput
                filter={filter}
                value={activeFilters[filter.field]}
                onChange={(val) => setFilter(filter.field, val)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterInput({
  filter,
  value,
  onChange,
}: {
  filter: FilterConfig;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  switch (filter.type) {
    case 'text':
      return (
        <Input
          placeholder={filter.placeholder || filter.label}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-40 text-xs"
        />
      );

    case 'select':
      return (
        <select
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground"
        >
          <option value="">Todos</option>
          {filter.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'multi_select': {
      const selected = (value as string[]) || [];
      return (
        <div className="flex flex-wrap gap-1">
          {filter.options?.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  if (isSelected) {
                    onChange(selected.filter((v) => v !== opt.value));
                  } else {
                    onChange([...selected, opt.value]);
                  }
                }}
                className={`px-2 py-0.5 text-[11px] rounded-full border transition-colors ${
                  isSelected
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'border-border text-muted-foreground hover:border-foreground/30'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    }

    case 'boolean':
      return (
        <select
          value={value === undefined ? '' : String(value)}
          onChange={(e) =>
            onChange(e.target.value === '' ? undefined : e.target.value)
          }
          className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground"
        >
          <option value="">Todos</option>
          <option value="true">Sim</option>
          <option value="false">Nao</option>
        </select>
      );

    case 'date_range': {
      const range = (value as { from?: string; to?: string }) || {};
      return (
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={range.from || ''}
            onChange={(e) => onChange({ ...range, from: e.target.value || undefined })}
            className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground"
          />
          <span className="text-muted-foreground text-xs">a</span>
          <input
            type="date"
            value={range.to || ''}
            onChange={(e) => onChange({ ...range, to: e.target.value || undefined })}
            className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground"
          />
        </div>
      );
    }

    default:
      return null;
  }
}
