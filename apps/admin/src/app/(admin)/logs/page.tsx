'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, truncate } from '@/lib/utils';
import { Search } from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  accessorType: string;
  accessorId: string;
  subjectId: string;
  dataCategories: string[];
  legalBasis: string | null;
  justification: string | null;
  ipAddress: string | null;
  createdAt: string;
}

const ACTION_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  VIEW: 'secondary',
  EXPORT: 'default' as 'secondary',
  MODIFY: 'warning',
  DELETE: 'destructive',
  ANONYMIZE: 'destructive',
  SHARE: 'warning',
  PROCESS: 'secondary',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (level) params.set('level', level);

    const res = await fetch(`/api/logs?${params}`);
    const data = await res.json();
    setLogs(data.logs);
    setTotal(data.total);
    setLoading(false);
  }, [search, level]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns: Column<LogEntry>[] = [
    {
      key: 'createdAt',
      header: 'Data/Hora',
      sortable: true,
      className: 'w-40',
      render: (row) => (
        <span className="text-xs font-mono">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'action',
      header: 'Acao',
      sortable: true,
      className: 'w-28',
      render: (row) => (
        <Badge variant={ACTION_VARIANT[row.action] || 'secondary'}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: 'accessorType',
      header: 'Tipo Accessor',
      sortable: true,
      className: 'w-28',
      render: (row) => (
        <span className="text-xs">{row.accessorType}</span>
      ),
    },
    {
      key: 'dataCategories',
      header: 'Categorias',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.dataCategories.slice(0, 3).map((cat) => (
            <Badge key={cat} variant="outline" className="text-[10px]">
              {cat}
            </Badge>
          ))}
          {row.dataCategories.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{row.dataCategories.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      className: 'w-32',
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.ipAddress || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Logs de Acesso</h1>
          <p className="text-xs text-muted-foreground">
            {total} registros de acesso a dados pessoais (LGPD)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por justificativa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Todas acoes</option>
          <option value="INFO">VIEW</option>
          <option value="WARN">MODIFY</option>
          <option value="ERROR">DELETE</option>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          keyField="id"
          pageSize={20}
          expandedContent={(row) => (
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Accessor ID</p>
                <p className="font-mono">{row.accessorId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Subject ID</p>
                <p className="font-mono">{row.subjectId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Base Legal</p>
                <p>{row.legalBasis || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Justificativa</p>
                <p>{row.justification ? truncate(row.justification, 200) : '-'}</p>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
