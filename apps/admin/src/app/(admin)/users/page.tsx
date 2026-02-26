'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import UserDrawer from '@/components/shared/UserDrawer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatNumber } from '@/lib/utils';
import { Search, Users as UsersIcon } from 'lucide-react';

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  status: string;
  emailVerified: boolean;
  phone: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  tenantCount: number;
  conversationCount: number;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'destructive',
  DEACTIVATED: 'secondary',
  ANONYMIZED: 'secondary',
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    const res = await fetch(`/api/users?${params}`);
    const data = await res.json();
    setUsers(data.users);
    setTotal(data.total);
    setLoading(false);
  }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  const columns: Column<UserRow>[] = [
    {
      key: 'firstName',
      header: 'Nome',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm text-foreground font-medium">
            {row.firstName} {row.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-36',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'tenantCount',
      header: 'Tenants',
      sortable: true,
      className: 'w-20',
      render: (row) => (
        <span className="text-sm">{row.tenantCount}</span>
      ),
    },
    {
      key: 'conversationCount',
      header: 'Conversas',
      sortable: true,
      className: 'w-24',
      render: (row) => (
        <span className="text-sm">{row.conversationCount}</span>
      ),
    },
    {
      key: 'lastLoginAt',
      header: 'Ultimo Login',
      sortable: true,
      className: 'w-36',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Nunca'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      sortable: true,
      className: 'w-36',
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <UsersIcon className="w-5 h-5" /> Usuarios
          </h1>
          <p className="text-xs text-muted-foreground">
            {formatNumber(total)} usuarios cadastrados
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="PENDING_VERIFICATION">Pendente</option>
          <option value="SUSPENDED">Suspenso</option>
          <option value="DEACTIVATED">Desativado</option>
          <option value="ANONYMIZED">Anonimizado</option>
        </Select>
      </div>

      {loading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : (
        <DataTable
          columns={columns}
          data={users}
          keyField="id"
          pageSize={25}
          onRowClick={(row) => setSelectedUserId(row.id)}
        />
      )}

      <UserDrawer
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
