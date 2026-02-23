'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LogsMetricsBar } from './logs-metrics-bar';
import { LogsFilterPanel, type LogFilters, EMPTY_FILTERS } from './logs-filter-panel';
import { LogsTimeline } from './logs-timeline';
import { LogDetailDrawer } from './log-detail-drawer';
import { LogExportModal } from './log-export-modal';
import type { LogRecord } from './log-entry';
import {
  ClipboardList,
  Bot,
  Shield,
  Settings,
  List,
} from 'lucide-react';

interface Metrics {
  audit_count_24h: number;
  ai_count_24h: number;
  security_count_24h: number;
  error_count_24h: number;
  ai_cost_today_usd: number;
  avg_latency_ms: number;
  active_tenants_24h: number;
  total_requests_today: number;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export function LogsDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<LogFilters>({ ...EMPTY_FILTERS });
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch metrics
  useEffect(() => {
    fetch('/api/admin/logs/metrics')
      .then((r) => r.json())
      .then((r) => setMetrics(r.data))
      .catch(console.error);
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', '50');

      // Tab overrides category filter
      const category = activeTab !== 'all' ? activeTab.toUpperCase() : filters.category;
      if (category) params.set('category', category);
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.tenant_id) params.set('tenant_id', filters.tenant_id);
      if (filters.user_id) params.set('user_id', filters.user_id);
      if (filters.event_type) params.set('event_type', filters.event_type);
      if (filters.search) params.set('search', filters.search);
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await res.json();
      setLogs(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters, activeTab]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSelectLog = (log: LogRecord) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters: LogFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  // Tab counts from metrics
  const totalAll = metrics
    ? metrics.audit_count_24h + metrics.ai_count_24h + metrics.security_count_24h + metrics.error_count_24h
    : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Metrics bar */}
      <LogsMetricsBar metrics={metrics} />

      {/* Filters */}
      <LogsFilterPanel
        filters={filters}
        onChange={handleFiltersChange}
        onExport={() => setExportOpen(true)}
      />

      {/* Category tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="all" className="gap-1.5">
            <List size={14} />
            Todos
            {metrics && <span className="ml-1 text-xs text-zinc-500">({totalAll.toLocaleString('pt-BR')})</span>}
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-1.5">
            <ClipboardList size={14} className="text-violet-400" />
            Auditoria
            {metrics && <span className="ml-1 text-xs text-zinc-500">({metrics.audit_count_24h.toLocaleString('pt-BR')})</span>}
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Bot size={14} className="text-emerald-400" />
            IA
            {metrics && <span className="ml-1 text-xs text-zinc-500">({metrics.ai_count_24h.toLocaleString('pt-BR')})</span>}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield size={14} className="text-amber-400" />
            Seguranca
            {metrics && <span className="ml-1 text-xs text-zinc-500">({metrics.security_count_24h.toLocaleString('pt-BR')})</span>}
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5">
            <Settings size={14} className="text-slate-400" />
            Sistema
            {metrics && <span className="ml-1 text-xs text-zinc-500">({metrics.error_count_24h.toLocaleString('pt-BR')})</span>}
          </TabsTrigger>
        </TabsList>

        {/* All tabs share the same timeline content — filtering is done via API */}
        {['all', 'audit', 'ai', 'security', 'system'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="rounded-lg border border-white/5 bg-white/[0.01]">
              <LogsTimeline
                logs={logs}
                pagination={pagination}
                loading={loading}
                onSelect={handleSelectLog}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail drawer */}
      <LogDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Export modal */}
      <LogExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        filters={filters}
        totalRecords={pagination?.total ?? 0}
      />
    </div>
  );
}
