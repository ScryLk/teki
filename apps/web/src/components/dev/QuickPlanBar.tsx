'use client';

import { useDevTools } from '@/stores/dev-tools.store';

export default function QuickPlanBar() {
  const planOverride = useDevTools((s) => s.planOverride);
  const roleOverride = useDevTools((s) => s.roleOverride);
  const setIsOpen = useDevTools((s) => s.setIsOpen);
  const setActiveSection = useDevTools((s) => s.setActiveSection);

  const plan = planOverride ?? (process.env.TEKI_DEV_PLAN as string) ?? 'pro';
  const role = roleOverride ?? (process.env.TEKI_DEV_ROLE as string) ?? 'owner';
  const seed = (process.env.TEKI_DEV_SEED as string) ?? 'basic';

  const openSection = (section: 'controls' | 'data' | 'inspector' | 'events' | 'info') => {
    setActiveSection(section);
    setIsOpen(true);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] flex h-6 items-center gap-3 bg-zinc-900 px-3 text-[11px] font-mono text-zinc-400 border-b border-zinc-800 select-none">
      <button
        onClick={() => openSection('controls')}
        className="flex items-center gap-1 hover:text-white transition-colors"
      >
        <span className="text-amber-400">DEV</span>
      </button>
      <span className="text-zinc-700">|</span>
      <button
        onClick={() => openSection('controls')}
        className="hover:text-white transition-colors"
      >
        Plan: <span className="text-emerald-400 capitalize">{plan}</span>
      </button>
      <span className="text-zinc-700">|</span>
      <button
        onClick={() => openSection('controls')}
        className="hover:text-white transition-colors"
      >
        Role: <span className="text-blue-400 capitalize">{role}</span>
      </button>
      <span className="text-zinc-700">|</span>
      <button
        onClick={() => openSection('data')}
        className="hover:text-white transition-colors"
      >
        Seed: <span className="text-purple-400">{seed}</span>
      </button>
      <div className="ml-auto text-zinc-600">Ctrl+Shift+D</div>
    </div>
  );
}
