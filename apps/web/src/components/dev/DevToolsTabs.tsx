'use client';

import { useDevTools } from '@/stores/dev-tools.store';
import type { DevToolsSection } from '@/stores/dev-tools.store';

const TABS: { id: DevToolsSection; label: string }[] = [
  { id: 'controls', label: 'Controls' },
  { id: 'data', label: 'Data' },
  { id: 'inspector', label: 'Inspector' },
  { id: 'events', label: 'Events' },
  { id: 'info', label: 'Info' },
  { id: 'query_expansion', label: 'KB Search' },
  { id: 'confidence', label: 'Confidence' },
];

export function DevToolsTabs() {
  const activeSection = useDevTools((s) => s.activeSection);
  const setActiveSection = useDevTools((s) => s.setActiveSection);

  return (
    <div className="flex border-b border-zinc-700">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveSection(tab.id)}
          className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors ${
            activeSection === tab.id
              ? 'text-white bg-zinc-800 border-b-2 border-emerald-400'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
