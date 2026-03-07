'use client';

import { useEffect, useState } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, truncate } from '@/lib/utils';
import { ClipboardList } from 'lucide-react';

interface AuditEntry {
  id: string;
  accessorId: string;
  accessorType: string;
  accessorTenantId: string | null;
  subjectId: string;
  action: string;
  dataCategories: string[];
  details: unknown;
  legalBasis: string | null;
  justification: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const ACTION_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  VIEW: 'secondary',
  EXPORT: 'warning',
  MODIFY: 'warning',
  DELETE: 'destructive',
  ANONYMIZE: 'destructive',
  SHARE: 'warning',
  PROCESS: 'secondary',
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (action) params.set('action', action);

    fetch(`/api/audit?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs);
        setTotal(data.total);
        setLoading(false);
      });
  }, [action]);

  const columns: Column<AuditEntry>[] = [
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
      className: 'w-24',
      render: (row) => (
        <Badge variant={ACTION_VARIANT[row.action] || 'secondary'}>
          {row.action}
        </Badge>
      ),
    },
    {
      key: 'accessorType',
      header: 'Tipo',
      sortable: true,
      className: 'w-28',
      render: (row) => (
        <Badge variant="outline" className="text-[10px]">
          {row.accessorType}
        </Badge>
      ),
    },
    {
      key: 'dataCategories',
      header: 'Dados',
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.dataCategories.slice(0, 2).map((c) => (
            <Badge key={c} variant="secondary" className="text-[10px]">
              {c}
            </Badge>
          ))}
          {row.dataCategories.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{row.dataCategories.length - 2}
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
    {
      key: 'legalBasis',
      header: 'Base Legal',
      className: 'w-28',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.legalBasis || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Audit Log
          </h1>
          <p className="text-xs text-muted-foreground">
            {total} registros de auditoria (LGPD Art. 37)
          </p>
        </div>
        <Select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">Todas acoes</option>
          <option value="VIEW">VIEW</option>
          <option value="EXPORT">EXPORT</option>
          <option value="MODIFY">MODIFY</option>
          <option value="DELETE">DELETE</option>
          <option value="ANONYMIZE">ANONYMIZE</option>
          <option value="SHARE">SHARE</option>
          <option value="PROCESS">PROCESS</option>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          keyField="id"
          pageSize={25}
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
                <p className="text-muted-foreground">Justificativa</p>
                <p>{row.justification ? truncate(row.justification, 200) : '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">User Agent</p>
                <p className="truncate">{row.userAgent ? truncate(row.userAgent, 100) : '-'}</p>
              </div>
              {row.details != null && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Detalhes</p>
                  <pre className="text-[10px] bg-muted p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(row.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
