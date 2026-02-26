'use client';

import { useEffect, useState } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  Users,
  Building2,
  MessageSquare,
  MessagesSquare,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardData {
  kpis: {
    totalUsers: number;
    activeUsers: number;
    newUsersToday: number;
    newUsersLast7d: number;
    totalTenants: number;
    activeTenants: number;
    totalConversations: number;
    conversationsToday: number;
    totalMessages: number;
    messagesToday: number;
  };
  planDistribution: { plan: string; count: number }[];
  recentActivity: {
    id: string;
    email: string;
    firstName: string;
    lastName: string | null;
    createdAt: string;
    status: string;
  }[];
  messageTrend: { date: string; count: number }[];
  signupTrend: { date: string; count: number }[];
}

const PLAN_COLORS: Record<string, string> = {
  FREE: 'oklch(0.6 0 0)',
  STARTER: 'oklch(0.696 0.17 162.48)',
  PRO: 'oklch(0.623 0.214 259)',
  ENTERPRISE: 'oklch(0.627 0.265 303.9)',
};

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'destructive',
  DEACTIVATED: 'secondary',
  ANONYMIZED: 'secondary',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Usuarios"
          value={formatNumber(kpis.totalUsers)}
          subtitle={`${kpis.activeUsers} ativos`}
          icon={Users}
          trend={{ value: kpis.newUsersLast7d, label: 'ultimos 7 dias' }}
        />
        <KpiCard
          title="Tenants"
          value={formatNumber(kpis.totalTenants)}
          subtitle={`${kpis.activeTenants} ativos`}
          icon={Building2}
        />
        <KpiCard
          title="Conversas"
          value={formatNumber(kpis.totalConversations)}
          subtitle={`${kpis.conversationsToday} hoje`}
          icon={MessagesSquare}
        />
        <KpiCard
          title="Mensagens"
          value={formatNumber(kpis.totalMessages)}
          subtitle={`${kpis.messagesToday} hoje`}
          icon={MessageSquare}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mensagens (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.messageTrend}>
                  <defs>
                    <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.623 0.214 259)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.623 0.214 259)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    tickFormatter={(v: string) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.16 0 0)',
                      border: '1px solid oklch(0.26 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="oklch(0.623 0.214 259)"
                    fillOpacity={1}
                    fill="url(#colorMsg)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao de Planos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.planDistribution}
                    dataKey="count"
                    nameKey="plan"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {data.planDistribution.map((entry) => (
                      <Cell
                        key={entry.plan}
                        fill={PLAN_COLORS[entry.plan] || 'oklch(0.4 0 0)'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.16 0 0)',
                      border: '1px solid oklch(0.26 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {data.planDistribution.map((entry) => (
                <div key={entry.plan} className="flex items-center gap-1.5 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        PLAN_COLORS[entry.plan] || 'oklch(0.4 0 0)',
                    }}
                  />
                  <span className="text-muted-foreground">
                    {entry.plan} ({entry.count})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity + Signup Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Usuarios Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {data.recentActivity.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                >
                  <div>
                    <p className="text-sm text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[user.status] || 'secondary'}>
                      {user.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Signup Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Cadastros (30 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.signupTrend}>
                  <defs>
                    <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.696 0.17 162.48)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    tickFormatter={(v: string) => v.slice(5)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'oklch(0.6 0 0)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(0.16 0 0)',
                      border: '1px solid oklch(0.26 0 0)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="oklch(0.696 0.17 162.48)"
                    fillOpacity={1}
                    fill="url(#colorSignup)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
