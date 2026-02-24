import React, { useCallback, useRef, useState } from 'react';
import type { ConnectorPlatform, FieldMapping, FieldMappingGroupData } from './types';
import { GLPI_DEFAULT_MAPPINGS } from './types';

interface FieldMappingBoardProps {
  platform: ConnectorPlatform;
}

const FieldMappingBoard: React.FC<FieldMappingBoardProps> = ({ platform }) => {
  const [groups, setGroups] = useState<FieldMappingGroupData[]>(
    platform === 'glpi' ? GLPI_DEFAULT_MAPPINGS : GLPI_DEFAULT_MAPPINGS
  );

  const handleMappingChange = (groupIdx: number, mappingIdx: number, newTekiValue: string) => {
    setGroups((prev) => prev.map((g, gi) => {
      if (gi !== groupIdx) return g;
      const opt = g.tekiOptions.find((o) => o.value === newTekiValue);
      return {
        ...g,
        mappings: g.mappings.map((m, mi) =>
          mi !== mappingIdx ? m : {
            ...m,
            tekiValue: newTekiValue,
            tekiLabel: opt?.label ?? newTekiValue,
            isCustom: true,
          }
        ),
      };
    }));
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#71717a] mb-3">
        Defina como os campos do sistema externo correspondem aos campos do Teki.
        Valores padrão foram aplicados automaticamente.
      </p>

      {groups.map((group, gi) => (
        <MappingGroup
          key={group.fieldName}
          group={group}
          onMappingChange={(mi, val) => handleMappingChange(gi, mi, val)}
        />
      ))}

      <div className="flex justify-end pt-2">
        <button className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors">
          Salvar
        </button>
      </div>
    </div>
  );
};

// ─── Mapping Group ──────────────────────────────────────────────────────────

const MappingGroup: React.FC<{
  group: FieldMappingGroupData;
  onMappingChange: (mappingIdx: number, newTekiValue: string) => void;
}> = ({ group, onMappingChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  // Check for N:1 mappings
  const tekiValueCounts = new Map<string, number>();
  group.mappings.forEach((m) => {
    if (m.tekiValue) {
      tekiValueCounts.set(m.tekiValue, (tekiValueCounts.get(m.tekiValue) ?? 0) + 1);
    }
  });

  return (
    <div ref={containerRef} className="rounded-xl border border-[#27272a] bg-[#0f0f12] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#18181b] border-b border-[#27272a]">
        <span className="text-xs font-medium text-[#fafafa]">{group.label}</span>
      </div>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] text-[#52525b] uppercase tracking-wider font-medium">Externo (origem)</span>
          <span className="text-[10px] text-[#52525b] uppercase tracking-wider font-medium">Teki (destino)</span>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {group.mappings.map((mapping, mi) => {
            const isN1 = mapping.tekiValue && (tekiValueCounts.get(mapping.tekiValue) ?? 0) > 1;
            return (
              <div key={mapping.externalValue} className="flex items-center gap-3">
                {/* External value (source) */}
                <div
                  className="flex-1 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors"
                  draggable
                  onDragStart={() => setDragFrom(mi)}
                  onDragEnd={() => setDragFrom(null)}
                >
                  {mapping.externalLabel}
                </div>

                {/* Arrow */}
                <svg width={20} height={10} viewBox="0 0 20 10" className="flex-shrink-0">
                  <line x1="0" y1="5" x2="16" y2="5" stroke={mapping.tekiValue ? '#2A8F9D' : '#3f3f46'} strokeWidth={1.5} />
                  <polygon points="14,2 20,5 14,8" fill={mapping.tekiValue ? '#2A8F9D' : '#3f3f46'} />
                </svg>

                {/* Teki value (target dropdown) */}
                <div className="flex-1 relative">
                  <select
                    value={mapping.tekiValue ?? ''}
                    onChange={(e) => onMappingChange(mi, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-accent appearance-none cursor-pointer hover:border-accent/50 transition-colors focus:outline-none focus:border-accent"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-accent', 'bg-accent/5');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-accent', 'bg-accent/5');
                      // When dragging onto a target, keep the current value
                    }}
                  >
                    <option value="">—</option>
                    {group.tekiOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* N:1 badge */}
                {isN1 && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#f5a524]/10 text-[#f5a524] border border-[#f5a524]/30">
                    N:1
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FieldMappingBoard;
