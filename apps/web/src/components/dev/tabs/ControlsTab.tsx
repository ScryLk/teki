'use client';

import { useDevTools } from '@/stores/dev-tools.store';
import type { PlanName, UserRole } from '@/stores/dev-tools.store';

const PLANS: { id: PlanName; label: string; desc: string }[] = [
  { id: 'free', label: 'Free', desc: '1 agent, 50 msgs, 5MB' },
  { id: 'starter', label: 'Starter', desc: '1 agent, 500 msgs, 25MB' },
  { id: 'pro', label: 'Pro', desc: '5 agents, 2k msgs, 100MB' },
  { id: 'enterprise', label: 'Enterprise', desc: 'unlimited' },
];

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'owner', label: 'Owner' },
  { id: 'admin', label: 'Admin' },
  { id: 'agent', label: 'Agent' },
  { id: 'viewer', label: 'Viewer' },
];

export function ControlsTab() {
  const planOverride = useDevTools((s) => s.planOverride);
  const roleOverride = useDevTools((s) => s.roleOverride);
  const mockLatency = useDevTools((s) => s.mockLatency);
  const mockAiEnabled = useDevTools((s) => s.mockAiEnabled);
  const forceOffline = useDevTools((s) => s.forceOffline);
  const showPlanGates = useDevTools((s) => s.showPlanGates);
  const setPlan = useDevTools((s) => s.setPlan);
  const setRole = useDevTools((s) => s.setRole);
  const setMockLatency = useDevTools((s) => s.setMockLatency);
  const setMockAiEnabled = useDevTools((s) => s.setMockAiEnabled);
  const setForceOffline = useDevTools((s) => s.setForceOffline);
  const setShowPlanGates = useDevTools((s) => s.setShowPlanGates);
  const resetOverrides = useDevTools((s) => s.resetOverrides);

  const currentPlan =
    planOverride ?? (process.env.TEKI_DEV_PLAN as PlanName) ?? 'pro';
  const currentRole =
    roleOverride ?? (process.env.TEKI_DEV_ROLE as UserRole) ?? 'owner';

  return (
    <div className="space-y-4">
      {/* Plan & Permissions */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">
          Plan & Permissions
        </h3>

        <div className="mb-2">
          <label className="mb-1 block text-[10px] text-zinc-500 uppercase tracking-wide">
            Plan
          </label>
          <div className="flex flex-wrap gap-1">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setPlan(plan.id)}
                className={`rounded px-2 py-1 text-[11px] transition-colors ${
                  currentPlan === plan.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
                title={plan.desc}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2">
          <label className="mb-1 block text-[10px] text-zinc-500 uppercase tracking-wide">
            Role
          </label>
          <div className="flex flex-wrap gap-1">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => setRole(role.id)}
                className={`rounded px-2 py-1 text-[11px] transition-colors ${
                  currentRole === role.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 space-y-0.5 text-[10px] text-zinc-500">
          {PLANS.map((plan) => (
            <div key={plan.id} className="flex items-center gap-1">
              <span
                className={
                  currentPlan === plan.id
                    ? 'text-emerald-400'
                    : 'text-zinc-600'
                }
              >
                {currentPlan === plan.id ? '\u25CF' : '\u25CB'}
              </span>
              <span
                className={
                  currentPlan === plan.id ? 'text-zinc-300' : undefined
                }
              >
                {plan.id} &mdash; {plan.desc}
              </span>
            </div>
          ))}
        </div>

        <label className="mt-2 flex items-center gap-2 text-[11px] text-zinc-400">
          <input
            type="checkbox"
            checked={showPlanGates}
            onChange={(e) => setShowPlanGates(e.target.checked)}
            className="accent-emerald-500"
          />
          Highlight plan gates in UI
        </label>
      </section>

      {/* Simulation */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Simulation</h3>

        <div className="mb-2">
          <label className="mb-1 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wide">
            <span>Mock Latency</span>
            <span className="text-zinc-400 normal-case">{mockLatency}ms</span>
          </label>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={mockLatency}
            onChange={(e) => setMockLatency(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <label className="flex items-center gap-2 text-[11px] text-zinc-400">
          <input
            type="checkbox"
            checked={mockAiEnabled}
            onChange={(e) => setMockAiEnabled(e.target.checked)}
            className="accent-emerald-500"
          />
          Mock AI (fake responses, no API call)
        </label>

        <label className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
          <input
            type="checkbox"
            checked={forceOffline}
            onChange={(e) => setForceOffline(e.target.checked)}
            className="accent-emerald-500"
          />
          Offline mode (simulate no internet)
        </label>
      </section>

      {/* Quick Info */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="mb-2 font-semibold text-zinc-300">Quick Info</h3>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-zinc-500">Tenant:</span>
            <span className="text-zinc-300">dev-tenant-001</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">User:</span>
            <span className="text-zinc-300">
              dev@teki.local ({currentRole})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Plan:</span>
            <span className="text-zinc-300 capitalize">
              {currentPlan}
              {planOverride ? ' (override)' : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Seed:</span>
            <span className="text-zinc-300">
              {process.env.TEKI_DEV_SEED ?? 'basic'}
            </span>
          </div>
        </div>
      </section>

      {/* Reset */}
      <button
        onClick={resetOverrides}
        className="w-full rounded bg-zinc-800 px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white"
      >
        Reset All Overrides
      </button>
    </div>
  );
}
