import React, { useState } from 'react';
import type { MonitoredService, ProbeType } from '@teki/shared';
import { useMonitorStore } from '@/stores/monitor-store';

interface Props {
  onClose: () => void;
  editService?: MonitoredService;
}

const PROBE_TYPES: { value: ProbeType; label: string; placeholder: string }[] = [
  { value: 'http', label: 'HTTP', placeholder: 'https://api.example.com/health' },
  { value: 'tcp', label: 'TCP', placeholder: 'host:port (ex: 192.168.1.1:5432)' },
  { value: 'pg', label: 'PostgreSQL', placeholder: 'postgresql://user:pass@host:5432/db' },
];

const INTERVALS = [
  { value: 10_000, label: '10s' },
  { value: 30_000, label: '30s' },
  { value: 60_000, label: '1min' },
  { value: 300_000, label: '5min' },
];

const ServiceConfigModal: React.FC<Props> = ({ onClose, editService }) => {
  const [name, setName] = useState(editService?.name || '');
  const [type, setType] = useState<ProbeType>(editService?.type || 'http');
  const [target, setTarget] = useState(editService?.target || '');
  const [intervalMs, setIntervalMs] = useState(editService?.intervalMs || 30_000);
  const [saving, setSaving] = useState(false);

  const addService = useMonitorStore((s) => s.addService);
  const updateService = useMonitorStore((s) => s.updateService);

  const handleSave = async () => {
    if (!name.trim() || !target.trim()) return;
    setSaving(true);

    try {
      if (editService) {
        const updated: MonitoredService = { ...editService, name, type, target, intervalMs, enabled: true };
        await window.tekiAPI?.monitorUpdateService(updated);
        updateService(updated);
      } else {
        const created = await window.tekiAPI?.monitorAddService({ name, type, target, intervalMs, enabled: true });
        if (created) addService(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save service:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedProbe = PROBE_TYPES.find((p) => p.value === type)!;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-xl shadow-2xl w-[420px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <h2 className="text-text-primary text-sm font-semibold mb-4">
            {editService ? 'Editar Serviço' : 'Adicionar Serviço'}
          </h2>

          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="text-text-muted text-xs block mb-1">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: API Backend, PostgreSQL Prod"
                className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-text-muted text-xs block mb-1">Tipo</label>
              <div className="flex gap-2">
                {PROBE_TYPES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setType(p.value)}
                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                      type === p.value
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-bg border-border text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="text-text-muted text-xs block mb-1">Destino</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={selectedProbe.placeholder}
                className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-sm text-text-primary outline-none focus:border-accent font-mono text-xs"
              />
            </div>

            {/* Interval */}
            <div>
              <label className="text-text-muted text-xs block mb-1">Intervalo</label>
              <div className="flex gap-2">
                {INTERVALS.map((iv) => (
                  <button
                    key={iv.value}
                    onClick={() => setIntervalMs(iv.value)}
                    className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                      intervalMs === iv.value
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-bg border-border text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {iv.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || !target.trim() || saving}
              className="px-4 py-1.5 text-xs bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Salvando...' : editService ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigModal;
