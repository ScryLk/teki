'use client';

import { useEffect, useState, useCallback } from 'react';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusDot from '@/components/shared/StatusDot';
import { formatDate, formatNumber, formatCurrency } from '@/lib/utils';
import { Search, Building2, X, Users, MessageSquare } from 'lucide-react';

interface TenantRow {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  plan: string;
  status: string;
  country: string;
  createdAt: string;
  planExpiresAt: string | null;
  memberCount: number;
  conversationCount: number;
}

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  plan: string;
  status: string;
  country: string;
  createdAt: string;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  trialEndsAt: string | null;
  billingEmail: string | null;
  members: {
    id: string;
    role: string;
    status: string;
    userId: string;
    email: string;
    name: string;
    userStatus: string;
  }[];
  aiProviders: {
    id: string;
    provider: string;
    isActive: boolean;
    currentMonthCostUsd: number;
    currentMonthRequests: number;
  }[];
  stats: { members: number; conversations: number };
}

const PLAN_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  FREE: 'secondary',
  STARTER: 'outline',
  PRO: 'default',
  ENTERPRISE: 'default',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  TRIAL: 'warning',
  SUSPENDED: 'destructive',
  CANCELLED: 'secondary',
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const [detail, setDetail] = useState<TenantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (plan) params.set('plan', plan);
    if (status) params.set('status', status);

    const res = await fetch(`/api/tenants?${params}`);
    const data = await res.json();
    setTenants(data.tenants);
    setTotal(data.total);
    setLoading(false);
  }, [search, plan, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchTenants, 300);
    return () => clearTimeout(timeout);
  }, [fetchTenants]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    const res = await fetch(`/api/tenants/${id}`);
    const data = await res.json();
    setDetail(data);
    setDetailLoading(false);
  }

  async function updateTenant(field: string, value: string) {
    if (!detail) return;
    await fetch(`/api/tenants/${detail.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    setDetail((prev) => (prev ? { ...prev, [field]: value } : prev));
    fetchTenants();
  }

  const columns: Column<TenantRow>[] = [
    {
      key: 'name',
      header: 'Tenant',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.slug}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plano',
      sortable: true,
      className: 'w-28',
      render: (row) => (
        <Badge variant={PLAN_VARIANT[row.plan] || 'secondary'}>
          {row.plan}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      className: 'w-28',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status] || 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'memberCount',
      header: 'Membros',
      sortable: true,
      className: 'w-24',
      render: (row) => <span className="text-sm">{row.memberCount}</span>,
    },
    {
      key: 'conversationCount',
      header: 'Conversas',
      sortable: true,
      className: 'w-24',
      render: (row) => <span className="text-sm">{row.conversationCount}</span>,
    },
    {
      key: 'createdAt',
      header: 'Criado',
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
            <Building2 className="w-5 h-5" /> Tenants
          </h1>
          <p className="text-xs text-muted-foreground">
            {formatNumber(total)} organizacoes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, slug ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
          <option value="">Todos planos</option>
          <option value="FREE">Free</option>
          <option value="STARTER">Starter</option>
          <option value="PRO">Pro</option>
          <option value="ENTERPRISE">Enterprise</option>
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Todos status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="TRIAL">Trial</option>
          <option value="SUSPENDED">Suspenso</option>
          <option value="CANCELLED">Cancelado</option>
        </Select>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={detail ? 'flex-1' : 'w-full'}>
          {loading ? (
            <Skeleton className="h-96 rounded-xl" />
          ) : (
            <DataTable
              columns={columns}
              data={tenants}
              keyField="id"
              pageSize={25}
              onRowClick={(row) => openDetail(row.id)}
            />
          )}
        </div>

        {/* Detail Panel */}
        {detail && (
          <Card className="w-96 flex-shrink-0 self-start sticky top-20">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">{detail.name}</CardTitle>
              <button
                onClick={() => setDetail(null)}
                className="p-1 rounded-md hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {detailLoading ? (
                <Skeleton className="h-48" />
              ) : (
                <>
                  <div className="flex gap-2">
                    <Badge variant={PLAN_VARIANT[detail.plan] || 'secondary'}>
                      {detail.plan}
                    </Badge>
                    <Badge variant={STATUS_VARIANT[detail.status] || 'secondary'}>
                      {detail.status}
                    </Badge>
                  </div>

                  {/* Plan management */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Alterar Plano
                    </p>
                    <div className="flex gap-1">
                      {['FREE', 'STARTER', 'PRO', 'ENTERPRISE'].map((p) => (
                        <Button
                          key={p}
                          variant={detail.plan === p ? 'default' : 'outline'}
                          size="sm"
                          className="text-[10px] px-2 h-7"
                          onClick={() => updateTenant('plan', p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Status actions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Status
                    </p>
                    <div className="flex gap-1">
                      {detail.status !== 'SUSPENDED' ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="text-xs"
                          onClick={() => updateTenant('status', 'SUSPENDED')}
                        >
                          Suspender
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => updateTenant('status', 'ACTIVE')}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary rounded-lg p-2.5 text-center">
                      <Users className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm font-bold">{detail.stats.members}</p>
                      <p className="text-[10px] text-muted-foreground">Membros</p>
                    </div>
                    <div className="bg-secondary rounded-lg p-2.5 text-center">
                      <MessageSquare className="w-3.5 h-3.5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm font-bold">{detail.stats.conversations}</p>
                      <p className="text-[10px] text-muted-foreground">Conversas</p>
                    </div>
                  </div>

                  {/* AI Providers */}
                  {detail.aiProviders.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                        AI Providers
                      </p>
                      {detail.aiProviders.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-1.5">
                            <StatusDot color={p.isActive ? 'green' : 'gray'} />
                            <span>{p.provider}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {formatCurrency(p.currentMonthCostUsd)} / {p.currentMonthRequests} req
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Members preview */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                      Membros ({detail.members.length})
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {detail.members.slice(0, 10).map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-xs py-1">
                          <div>
                            <span className="text-foreground">{m.name}</span>
                            <span className="text-muted-foreground ml-1">({m.role})</span>
                          </div>
                          <Badge
                            variant={m.status === 'ACTIVE' ? 'success' : 'secondary'}
                            className="text-[10px]"
                          >
                            {m.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="text-[10px] text-muted-foreground border-t border-border pt-2 space-y-0.5">
                    <p>Slug: {detail.slug}</p>
                    <p>Pais: {detail.country}</p>
                    <p>Criado: {formatDate(detail.createdAt)}</p>
                    {detail.planExpiresAt && (
                      <p>Plano expira: {formatDate(detail.planExpiresAt)}</p>
                    )}
                    <p className="font-mono">ID: {detail.id}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
