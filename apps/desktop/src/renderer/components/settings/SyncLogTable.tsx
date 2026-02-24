import React from 'react';
import type { SyncLog } from './types';
import { DEMO_SYNC_LOGS } from './types';

const SyncLogTable: React.FC = () => {
  const logs = DEMO_SYNC_LOGS;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-[#27272a] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#18181b] border-b border-[#27272a]">
              <th className="text-left px-3 py-2 text-[#71717a] font-medium">Quando</th>
              <th className="text-left px-3 py-2 text-[#71717a] font-medium">Tipo</th>
              <th className="text-right px-3 py-2 text-[#71717a] font-medium">Tickets</th>
              <th className="text-right px-3 py-2 text-[#71717a] font-medium">Erros</th>
              <th className="text-right px-3 py-2 text-[#71717a] font-medium">Duração</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="border-b border-[#27272a] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2 text-[#a1a1aa]">{log.when}</td>
                  <td className="px-3 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      log.type === 'poll' ? 'bg-[#27272a] text-[#a1a1aa]'
                        : log.type === 'on_demand' ? 'bg-accent/10 text-accent'
                          : log.type === 'webhook' ? 'bg-[#6366f1]/10 text-[#818cf8]'
                            : 'bg-[#f5a524]/10 text-[#f5a524]'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-[#fafafa]">{log.tickets}</td>
                  <td className="px-3 py-2 text-right">
                    {log.errors > 0 ? (
                      <span className="text-[#f5a524]">{log.errors}</span>
                    ) : (
                      <span className="text-[#52525b]">0</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-[#a1a1aa]">{log.duration}</td>
                </tr>
                {log.errorDetail && (
                  <tr className="border-b border-[#27272a]">
                    <td colSpan={5} className="px-3 py-2">
                      <div className="flex items-start gap-1.5 text-[11px] text-[#f5a524]">
                        <span className="flex-shrink-0 mt-0.5">
                          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        </span>
                        {log.errorDetail}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#52525b]">
        Mostrando últimas 24h.{' '}
        <button className="text-accent hover:underline">Ver todos</button>
      </p>
    </div>
  );
};

export default SyncLogTable;
