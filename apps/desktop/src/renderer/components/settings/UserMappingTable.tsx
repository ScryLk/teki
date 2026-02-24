import React, { useState } from 'react';
import type { UserMapping } from './types';
import { DEMO_USER_MAPPINGS } from './types';

const UserMappingTable: React.FC = () => {
  const [mappings] = useState<UserMapping[]>(DEMO_USER_MAPPINGS);
  const [method, setMethod] = useState<'auto' | 'manual'>('auto');

  const matched = mappings.filter((m) => m.status === 'matched').length;
  const total = mappings.length;
  const needAction = mappings.filter((m) => m.status !== 'matched').length;

  return (
    <div className="space-y-4">
      <p className="text-xs text-[#71717a]">
        Vincula técnicos do sistema externo aos usuários do Teki para que o Teki
        saiba quem está atendendo cada ticket.
      </p>

      {/* Method toggle */}
      <div className="flex items-center gap-4">
        <label className="text-xs text-[#71717a]">Método:</label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={method === 'auto'}
            onChange={() => setMethod('auto')}
            className="accent-accent"
          />
          <span className="text-xs text-[#fafafa]">Automático (por email)</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={method === 'manual'}
            onChange={() => setMethod('manual')}
            className="accent-accent"
          />
          <span className="text-xs text-[#fafafa]">Manual</span>
        </label>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#27272a] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#18181b] border-b border-[#27272a]">
              <th className="text-left px-3 py-2 text-[#71717a] font-medium">Externo</th>
              <th className="text-left px-3 py-2 text-[#71717a] font-medium">Teki</th>
              <th className="text-center px-3 py-2 text-[#71717a] font-medium w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.externalId} className="border-b border-[#27272a] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5">
                  <div>
                    <p className="text-[#fafafa] font-medium">{m.externalName}</p>
                    <p className="text-[#52525b] mt-0.5">{m.externalEmail}</p>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  {m.status === 'matched' ? (
                    <div>
                      <p className="text-[#fafafa]">{m.tekiName}</p>
                    </div>
                  ) : m.status === 'unmatched' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[#71717a]">Sem correspondência</span>
                      <button className="px-2 py-0.5 rounded text-[10px] text-accent border border-accent/30 hover:bg-accent/10 transition-colors">
                        Vincular
                      </button>
                    </div>
                  ) : (
                    <span className="text-[#52525b] italic">Conta de sistema</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {m.status === 'matched' && (
                    <span className="inline-flex items-center gap-1 text-[#17c964]">
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      auto
                    </span>
                  )}
                  {m.status === 'unmatched' && (
                    <span className="text-[#f5a524]">?</span>
                  )}
                  {m.status === 'ignored' && (
                    <span className="text-[#52525b]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <p className="text-xs text-[#71717a]">
        {matched} de {total} usuários mapeados automaticamente.
        {needAction > 0 && ` ${needAction} precisam de ação.`}
      </p>

      <div className="flex items-center justify-between">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Re-mapear todos
        </button>
        <button className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors">
          Salvar
        </button>
      </div>
    </div>
  );
};

export default UserMappingTable;
