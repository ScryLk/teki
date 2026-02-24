'use client';

import { useState } from 'react';
import { useDevTools } from '@/stores/dev-tools.store';
import type { PlanName } from '@/stores/dev-tools.store';

interface PlanGateInfo {
  feature: string;
  requiredPlan: PlanName;
  label: string;
}

const PLAN_GATES: PlanGateInfo[] = [
  { feature: 'file_upload', requiredPlan: 'pro', label: 'File Upload' },
  { feature: 'from_chat', requiredPlan: 'starter', label: 'From Chat' },
  { feature: 'quick_add', requiredPlan: 'free', label: 'Quick Add' },
  { feature: 'full_form', requiredPlan: 'free', label: 'Full Form' },
  { feature: 'byok', requiredPlan: 'pro', label: 'Bring Your Own Key' },
  { feature: 'openclaw', requiredPlan: 'pro', label: 'OpenClaw Channels' },
  { feature: 'model_per_agent', requiredPlan: 'starter', label: 'Model Per Agent' },
  { feature: 'onboarding', requiredPlan: 'pro', label: 'Guided Onboarding' },
];

const PLAN_ORDER: PlanName[] = ['free', 'starter', 'pro', 'enterprise'];

function isPlanAllowed(current: PlanName, required: PlanName): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

export function InspectorTab() {
  const planOverride = useDevTools((s) => s.planOverride);
  const aiCallsLog = useDevTools((s) => s.aiCallsLog);
  const clearAiCallsLog = useDevTools((s) => s.clearAiCallsLog);
  const [expandedStore, setExpandedStore] = useState<string | null>(null);

  const currentPlan = planOverride ?? ((process.env.TEKI_DEV_PLAN as PlanName) ?? 'pro');

  const toggleStore = (name: string) => {
    setExpandedStore(expandedStore === name ? null : name);
  };

  return (
    <div className="space-y-4">
      {/* Zustand Stores */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Zustand Stores</h3>
        <div className="space-y-1">
          {['devToolsStore', 'appStore', 'authStore'].map((store) => (
            <div key={store}>
              <button
                onClick={() => toggleStore(store)}
                className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <span className="text-zinc-600">
                  {expandedStore === store ? '\u25BE' : '\u25B8'}
                </span>
                {store}
              </button>
              {expandedStore === store && (
                <div className="ml-3 mt-1 rounded bg-zinc-800/50 p-2 font-mono text-[10px] text-zinc-500">
                  {store === 'devToolsStore' && (
                    <>
                      <div>planOverride: {JSON.stringify(planOverride)}</div>
                      <div>
                        roleOverride:{' '}
                        {JSON.stringify(
                          useDevTools.getState().roleOverride
                        )}
                      </div>
                      <div>
                        mockLatency: {useDevTools.getState().mockLatency}
                      </div>
                      <div>
                        mockAiEnabled:{' '}
                        {String(useDevTools.getState().mockAiEnabled)}
                      </div>
                    </>
                  )}
                  {store !== 'devToolsStore' && (
                    <div className="text-zinc-600 italic">
                      Connect to inspect client-side state
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* AI Call Log */}
      <section className="rounded border border-zinc-700 p-2.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-zinc-300">
            AI Call Log ({aiCallsLog.length})
          </h3>
          {aiCallsLog.length > 0 && (
            <button
              onClick={clearAiCallsLog}
              className="text-[10px] text-zinc-600 hover:text-zinc-400"
            >
              Clear
            </button>
          )}
        </div>
        {aiCallsLog.length === 0 ? (
          <p className="text-[10px] text-zinc-600 italic">No AI calls yet</p>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {aiCallsLog.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="rounded bg-zinc-800/50 p-1.5 text-[10px]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-zinc-400">
                    {entry.provider}/{entry.model}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-zinc-500">{entry.operation}</span>
                  <span
                    className={
                      entry.status === 'success'
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }
                  >
                    {entry.status === 'success' ? '\u2705' : '\u274C'}{' '}
                    {entry.latencyMs ? `${entry.latencyMs}ms` : '\u2014'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Plan Gates */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">
          Plan Gates ({currentPlan})
        </h3>
        <div className="space-y-1">
          {PLAN_GATES.map((gate) => {
            const allowed = isPlanAllowed(currentPlan, gate.requiredPlan);
            return (
              <div
                key={gate.feature}
                className="flex items-center justify-between text-[11px]"
              >
                <span className="text-zinc-400">{gate.label}</span>
                <span
                  className={
                    allowed ? 'text-emerald-400' : 'text-red-400'
                  }
                >
                  {allowed
                    ? '\u2705 allowed'
                    : `\u{1F512} ${gate.requiredPlan}`}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
