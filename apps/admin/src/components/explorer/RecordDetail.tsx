'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { X, Copy, Check, ChevronDown, ChevronRight, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ModelConfig } from '@/lib/explorer/types';

interface RecordDetailProps {
  model: string;
  recordId: string;
  config: ModelConfig;
  onClose: () => void;
}

export default function RecordDetail({
  model,
  recordId,
  config,
  onClose,
}: RecordDetailProps) {
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [expandedRels, setExpandedRels] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`/api/explorer/models/${model}/records/${recordId}`)
      .then((r) => r.json())
      .then((data) => {
        setRecord(data.record);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [model, recordId]);

  async function handleSave() {
    if (Object.keys(editData).length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/explorer/models/${model}/records/${recordId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRecord(data.record);
        setEditMode(false);
        setEditData({});
      }
    } finally {
      setSaving(false);
    }
  }

  function toggleRelation(name: string) {
    setExpandedRels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border shadow-xl z-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border shadow-xl z-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">Registro nao encontrado</p>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const scalarFields = Object.entries(record).filter(
    ([key, val]) =>
      !config.hiddenFields.includes(key) &&
      typeof val !== 'object' ||
      val === null
  );

  const relationFields = Object.entries(record).filter(
    ([key, val]) =>
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      key !== 'id'
  );

  const arrayFields = Object.entries(record).filter(
    ([, val]) => Array.isArray(val)
  );

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-background border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {String(record[config.titleField] || record.id)}
          </p>
          {config.subtitleField && record[config.subtitleField] != null && (
            <p className="text-xs text-muted-foreground truncate">
              {String(record[config.subtitleField])}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {config.allowEdit && (
            <>
              {editMode ? (
                <Button
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={handleSave}
                  disabled={saving || Object.keys(editData).length === 0}
                >
                  <Save className="w-3 h-3" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </Button>
              )}
            </>
          )}
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Scalar fields */}
        <div className="space-y-2">
          {scalarFields.map(([key, value]) => {
            const isEditable =
              editMode && config.editableFields?.includes(key);
            const isReadOnly = config.readOnlyFields.includes(key);

            return (
              <FieldRow
                key={key}
                label={key}
                value={value}
                editable={!!isEditable}
                readOnly={isReadOnly}
                editValue={editData[key]}
                onEdit={(val) =>
                  setEditData((prev) => ({ ...prev, [key]: val }))
                }
              />
            );
          })}
        </div>

        {/* Inline relations */}
        {relationFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Relacoes
            </p>
            {relationFields.map(([key, value]) => (
              <div key={key} className="p-2 rounded-lg bg-muted/30 border border-border">
                <button
                  onClick={() => toggleRelation(key)}
                  className="flex items-center gap-1 text-xs font-medium text-foreground w-full"
                >
                  {expandedRels.has(key) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {key}
                </button>
                {expandedRels.has(key) && (
                  <pre className="mt-2 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-40">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Array relations */}
        {arrayFields.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Colecoes
            </p>
            {arrayFields.map(([key, value]) => (
              <div key={key} className="p-2 rounded-lg bg-muted/30 border border-border">
                <button
                  onClick={() => toggleRelation(key)}
                  className="flex items-center justify-between gap-1 text-xs font-medium text-foreground w-full"
                >
                  <span className="flex items-center gap-1">
                    {expandedRels.has(key) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    {key}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {(value as unknown[]).length} items
                  </span>
                </button>
                {expandedRels.has(key) && (
                  <pre className="mt-2 text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-60">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  editable,
  readOnly,
  editValue,
  onEdit,
}: {
  label: string;
  value: unknown;
  editable: boolean;
  readOnly: boolean;
  editValue?: unknown;
  onEdit: (val: unknown) => void;
}) {
  const [copied, setCopied] = useState(false);

  const displayValue =
    value === null || value === undefined
      ? '-'
      : value instanceof Date
        ? formatDate(value)
        : typeof value === 'object'
          ? JSON.stringify(value)
          : String(value);

  return (
    <div className="flex items-start gap-2 py-1 border-b border-border/50 last:border-0">
      <span className="text-[11px] font-mono text-muted-foreground w-36 flex-shrink-0 pt-0.5">
        {label}
        {readOnly && (
          <span className="ml-1 text-[9px] text-muted-foreground/50">(ro)</span>
        )}
      </span>
      {editable ? (
        <Input
          value={editValue !== undefined ? String(editValue) : displayValue}
          onChange={(e) => onEdit(e.target.value)}
          className="h-7 text-xs flex-1"
        />
      ) : (
        <div className="flex items-center gap-1 flex-1 min-w-0 group">
          <span className="text-xs text-foreground break-all">{displayValue}</span>
          {label === 'id' && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(displayValue);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-muted transition-all flex-shrink-0"
            >
              {copied ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
