import React, { useState } from 'react';
import type { SyncDirection } from './types';

interface SyncConfigPanelProps {
  syncDirection: SyncDirection;
}

const SyncConfigPanel: React.FC<SyncConfigPanelProps> = ({ syncDirection: initial }) => {
  const [direction, setDirection] = useState<SyncDirection>(initial);
  const [interval, setInterval] = useState(5);
  const [statusFilters, setStatusFilters] = useState({
    novo: true, em_atendimento: true, planejado: true, pendente: true,
    solucionado: false, fechado: false,
  });
  const [writeBackOptions, setWriteBackOptions] = useState({
    aiSuggestions: false, internalNotes: false, kbLinks: false, resolution: false,
  });

  const toggleFilter = (key: keyof typeof statusFilters) => {
    setStatusFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleWriteBack = (key: keyof typeof writeBackOptions) => {
    setWriteBackOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-5">
      {/* Direction */}
      <div className="rounded-lg border border-[#27272a] p-4 space-y-3">
        <h5 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Direção</h5>
        {([
          { value: 'read_only' as const, label: 'Somente leitura', desc: 'O Teki lê tickets do sistema externo. Não altera nada.' },
          { value: 'bidirectional' as const, label: 'Bidirecional', desc: 'O Teki pode enviar notas e comentários de volta.' },
          { value: 'write_back_notes' as const, label: 'Apenas notas', desc: 'O Teki envia apenas notas internas de volta.' },
        ]).map((opt) => (
          <label key={opt.value} className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              checked={direction === opt.value}
              onChange={() => setDirection(opt.value)}
              className="accent-accent mt-0.5"
            />
            <div>
              <span className="text-xs text-[#fafafa] font-medium">{opt.label}</span>
              <p className="text-[11px] text-[#52525b]">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-[#27272a] p-4 space-y-3">
        <h5 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Filtros</h5>
        <div>
          <p className="text-xs text-[#71717a] mb-2">Status dos tickets para sincronizar:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statusFilters).map(([key, checked]) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFilter(key as keyof typeof statusFilters)}
                  className="accent-accent"
                />
                <span className="text-xs text-[#fafafa] capitalize">{key.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Grupo responsável:</label>
          <select className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] appearance-none cursor-pointer focus:outline-none focus:border-accent">
            <option>Todos os grupos</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-[#71717a] block mb-1.5">Apenas tickets criados após:</label>
          <input
            type="date"
            defaultValue="2026-01-01"
            className="px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Interval */}
      <div className="rounded-lg border border-[#27272a] p-4 space-y-2">
        <h5 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Intervalo</h5>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#71717a]">Sincronizar a cada:</span>
          <input
            type="number"
            min={1}
            max={60}
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
            className="w-16 px-2 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] text-center focus:outline-none focus:border-accent"
          />
          <span className="text-xs text-[#71717a]">minutos</span>
        </div>
        <p className="text-[11px] text-[#52525b]">Recomendado: 5 min. Mínimo: 1 min. Máximo: 60 min.</p>
      </div>

      {/* Write-back */}
      <div className={`rounded-lg border border-[#27272a] p-4 space-y-3 ${direction === 'read_only' ? 'opacity-50' : ''}`}>
        <h5 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Write-back</h5>
        {direction === 'read_only' ? (
          <p className="text-[11px] text-[#52525b]">Desativado (somente leitura selecionado)</p>
        ) : (
          <>
            <p className="text-xs text-[#71717a]">O que enviar de volta ao sistema externo:</p>
            {([
              { key: 'aiSuggestions' as const, label: 'Sugestões de IA aceitas' },
              { key: 'internalNotes' as const, label: 'Notas internas do Teki' },
              { key: 'kbLinks' as const, label: 'Links para artigos da KB' },
              { key: 'resolution' as const, label: 'Resolução escrita no Teki' },
            ]).map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={writeBackOptions[opt.key]}
                  onChange={() => toggleWriteBack(opt.key)}
                  className="accent-accent"
                />
                <span className="text-xs text-[#fafafa]">{opt.label}</span>
              </label>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors">
          Salvar
        </button>
      </div>
    </div>
  );
};

export default SyncConfigPanel;
