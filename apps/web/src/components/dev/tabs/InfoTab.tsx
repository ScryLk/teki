'use client';

import { useEffect, useState } from 'react';
import { useDevTools } from '@/stores/dev-tools.store';

interface DbStats {
  tables: Record<string, number>;
}

export function InfoTab() {
  const planOverride = useDevTools((s) => s.planOverride);
  const roleOverride = useDevTools((s) => s.roleOverride);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/dev/db/stats');
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      {/* Environment */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Environment</h3>
        <div className="space-y-1 text-[11px] font-mono">
          <InfoRow label="Next.js" value="16.x" />
          <InfoRow label="React" value="19.x" />
          <InfoRow label="TypeScript" value="5.x" />
          <InfoRow label="pnpm" value="10.x" />
          <InfoRow label="Node" value={typeof process !== 'undefined' ? process.version ?? 'N/A' : 'N/A'} />
        </div>
      </section>

      {/* Database */}
      <section className="rounded border border-zinc-700 p-2.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-zinc-300">Database</h3>
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="text-[10px] text-zinc-600 hover:text-zinc-400"
          >
            {loadingStats ? '...' : 'Refresh'}
          </button>
        </div>
        <div className="space-y-1 text-[11px] font-mono">
          <InfoRow label="Type" value="PostgreSQL" />
          {dbStats?.tables && (
            <>
              {Object.entries(dbStats.tables).map(([table, count]) => (
                <InfoRow key={table} label={table} value={String(count)} />
              ))}
            </>
          )}
          {!dbStats && !loadingStats && (
            <p className="text-[10px] text-zinc-600 italic">
              Could not connect to database
            </p>
          )}
        </div>
      </section>

      {/* Active Flags */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Active Flags</h3>
        <div className="space-y-1 text-[11px] font-mono">
          <div className="text-zinc-500">
            <span className="text-zinc-600">CLI: </span>
            --plan={process.env.TEKI_DEV_PLAN ?? 'pro'} --role=
            {process.env.TEKI_DEV_ROLE ?? 'owner'} --seed=
            {process.env.TEKI_DEV_SEED ?? 'basic'}
          </div>
          <div className="text-zinc-500">
            <span className="text-zinc-600">ENV: </span>
            TEKI_DEV_PLAN={process.env.TEKI_DEV_PLAN ?? 'pro'}{' '}
            TEKI_DEV_ROLE={process.env.TEKI_DEV_ROLE ?? 'owner'}{' '}
            TEKI_DEV_TOOLS={process.env.TEKI_DEV_TOOLS ?? 'true'}
          </div>
        </div>
        <div className="mt-2">
          <span className="text-[10px] text-zinc-600">Overrides active:</span>
          {planOverride || roleOverride ? (
            <div className="mt-0.5 text-[11px] text-amber-400 font-mono">
              {planOverride && `plan=${planOverride} `}
              {roleOverride && `role=${roleOverride}`}
            </div>
          ) : (
            <div className="mt-0.5 text-[10px] text-zinc-600 italic">
              None &mdash; using CLI values
            </div>
          )}
        </div>
      </section>

      {/* Hotkeys */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Hotkeys</h3>
        <div className="space-y-1 text-[11px]">
          <HotkeyRow keys="Ctrl+Shift+D" action="Toggle DevTools" />
          <HotkeyRow keys="Ctrl+Shift+P" action="Quick switch plan" />
          <HotkeyRow keys="Ctrl+Shift+R" action="Quick switch role" />
          <HotkeyRow keys="Ctrl+Shift+1-4" action="Set plan directly" />
          <HotkeyRow keys="Ctrl+Shift+0" action="Reset overrides" />
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}:</span>
      <span className="text-zinc-300">{value}</span>
    </div>
  );
}

function HotkeyRow({ keys, action }: { keys: string; action: string }) {
  return (
    <div className="flex justify-between">
      <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
        {keys}
      </span>
      <span className="text-zinc-400">{action}</span>
    </div>
  );
}
