'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import type { LogFilters } from './logs-filter-panel';

const EXPORT_FIELDS = [
  { key: 'createdAt', label: 'Timestamp', defaultChecked: true },
  { key: 'category', label: 'Categoria', defaultChecked: true },
  { key: 'eventType', label: 'Evento', defaultChecked: true },
  { key: 'severity', label: 'Severidade', defaultChecked: true },
  { key: 'tenantId', label: 'Tenant', defaultChecked: true },
  { key: 'userEmail', label: 'Usuario', defaultChecked: true },
  { key: 'summary', label: 'Resumo', defaultChecked: true },
  { key: 'details', label: 'Detalhes', defaultChecked: true },
  { key: 'ipAddress', label: 'IP', defaultChecked: false },
  { key: 'userAgent', label: 'User Agent', defaultChecked: false },
  { key: 'requestPath', label: 'Request Path', defaultChecked: false },
  { key: 'durationMs', label: 'Duracao', defaultChecked: true },
];

export function LogExportModal({
  open,
  onClose,
  filters,
  totalRecords,
}: {
  open: boolean;
  onClose: () => void;
  filters: LogFilters;
  totalRecords: number;
}) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter((f) => f.defaultChecked).map((f) => f.key)
  );
  const [exporting, setExporting] = useState(false);

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/logs/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          filters: {
            category: filters.category || undefined,
            severity: filters.severity || undefined,
            tenant_id: filters.tenant_id || undefined,
            user_id: filters.user_id || undefined,
            event_type: filters.event_type || undefined,
            search: filters.search || undefined,
            date_from: filters.date_from || undefined,
            date_to: filters.date_to || undefined,
          },
          fields: selectedFields,
        }),
      });

      if (!res.ok) throw new Error('Erro na exportacao');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teki-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  // Active filters summary
  const activeFilters: string[] = [];
  if (filters.category) activeFilters.push(`Categoria: ${filters.category}`);
  if (filters.severity) activeFilters.push(`Severidade: ${filters.severity}`);
  if (filters.date_from) activeFilters.push(`De: ${filters.date_from}`);
  if (filters.date_to) activeFilters.push(`Ate: ${filters.date_to}`);
  if (filters.search) activeFilters.push(`Busca: "${filters.search}"`);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Logs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format */}
          <div>
            <Label className="text-xs text-zinc-500 mb-2 block">Formato</Label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={`rounded-md border px-4 py-2 text-sm ${
                  format === 'csv'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 text-zinc-400'
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`rounded-md border px-4 py-2 text-sm ${
                  format === 'json'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-white/10 text-zinc-400'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div>
              <Label className="text-xs text-zinc-500 mb-1 block">Filtros ativos</Label>
              <ul className="text-xs text-zinc-400 space-y-0.5">
                {activeFilters.map((f, i) => (
                  <li key={i}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Record count */}
          <p className="text-sm text-zinc-300">
            Registros encontrados: <strong>{totalRecords.toLocaleString('pt-BR')}</strong>
          </p>

          {/* Fields */}
          <div>
            <Label className="text-xs text-zinc-500 mb-2 block">Campos a exportar</Label>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_FIELDS.map((field) => (
                <label key={field.key} className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                  <Checkbox
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>

          {/* Warning for large exports with details */}
          {selectedFields.includes('details') && totalRecords > 1000 && (
            <p className="text-xs text-amber-400/80">
              Exportacoes com detalhes completos (prompts/respostas IA) podem gerar arquivos grandes.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={exporting}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={exporting || selectedFields.length === 0}>
            {exporting ? (
              <>
                <Loader2 size={14} className="mr-1 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download size={14} className="mr-1" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
