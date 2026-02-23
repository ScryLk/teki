'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface LogFilters {
  category: string;
  severity: string;
  tenant_id: string;
  user_id: string;
  event_type: string;
  search: string;
  date_from: string;
  date_to: string;
  period: string;
}

const EMPTY_FILTERS: LogFilters = {
  category: '',
  severity: '',
  tenant_id: '',
  user_id: '',
  event_type: '',
  search: '',
  date_from: '',
  date_to: '',
  period: 'today',
};

const PERIODS = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'custom', label: 'Custom' },
];

export function LogsFilterPanel({
  filters,
  onChange,
  onExport,
}: {
  filters: LogFilters;
  onChange: (filters: LogFilters) => void;
  onExport: () => void;
}) {
  const update = (key: keyof LogFilters, value: string) => {
    const next = { ...filters, [key]: value };

    // Handle period changes -> set date_from/date_to
    if (key === 'period' && value !== 'custom') {
      const now = new Date();
      next.date_to = now.toISOString().split('T')[0];
      if (value === 'today') {
        next.date_from = now.toISOString().split('T')[0];
      } else if (value === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        next.date_from = d.toISOString().split('T')[0];
      } else if (value === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        next.date_from = d.toISOString().split('T')[0];
      }
    }
    onChange(next);
  };

  const clearFilters = () => onChange({ ...EMPTY_FILTERS });

  const hasFilters = Object.entries(filters).some(
    ([key, val]) => val && val !== EMPTY_FILTERS[key as keyof LogFilters]
  );

  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Select value={filters.category || 'all'} onValueChange={(v) => update('category', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="AUDIT">Auditoria</SelectItem>
            <SelectItem value="AI">IA</SelectItem>
            <SelectItem value="SECURITY">Seguranca</SelectItem>
            <SelectItem value="SYSTEM">Sistema</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.severity || 'all'} onValueChange={(v) => update('severity', v === 'all' ? '' : v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas severidades</SelectItem>
            <SelectItem value="DEBUG">Debug</SelectItem>
            <SelectItem value="INFO">Info</SelectItem>
            <SelectItem value="WARN">Warn</SelectItem>
            <SelectItem value="ERROR">Error</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
          <Input
            placeholder="Buscar nos logs..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => update('period', p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.period === p.value
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {filters.period === 'custom' && (
          <>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => update('date_from', e.target.value)}
              className="text-xs"
            />
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => update('date_to', e.target.value)}
              className="text-xs"
            />
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500">
            <X size={14} className="mr-1" />
            Limpar filtros
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onExport}>
          Exportar
        </Button>
      </div>
    </div>
  );
}

export { EMPTY_FILTERS };
