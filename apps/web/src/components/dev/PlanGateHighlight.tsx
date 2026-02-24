'use client';

import { useDevTools } from '@/stores/dev-tools.store';
import type { PlanName } from '@/stores/dev-tools.store';

const PLAN_ORDER: PlanName[] = ['free', 'starter', 'pro', 'enterprise'];

function isPlanAllowed(current: PlanName, required: PlanName): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

interface PlanGateHighlightProps {
  feature: string;
  requiredPlan: PlanName;
  children: React.ReactNode;
}

export function PlanGateHighlight({
  feature,
  requiredPlan,
  children,
}: PlanGateHighlightProps) {
  const showGates = useDevTools((s) => s.showPlanGates);
  const planOverride = useDevTools((s) => s.planOverride);

  const currentPlan =
    planOverride ?? ((process.env.TEKI_DEV_PLAN as PlanName) ?? 'pro');
  const isLocked = !isPlanAllowed(currentPlan, requiredPlan);

  if (!showGates || process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${
        isLocked
          ? 'outline outline-2 outline-dashed outline-red-500'
          : 'outline outline-2 outline-dashed outline-green-500'
      }`}
      data-dev-gate={feature}
      data-dev-required-plan={requiredPlan}
    >
      <span
        className={`absolute -top-2 -right-2 z-50 rounded-full px-1.5 py-0.5 font-mono text-[9px] ${
          isLocked
            ? 'bg-red-500 text-white'
            : 'bg-green-500 text-white'
        }`}
      >
        {isLocked ? `\u{1F512} ${requiredPlan}` : '\u2705'}
      </span>
      {children}
    </div>
  );
}
