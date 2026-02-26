'use client';

import type { PlanTier } from '@prisma/client';
import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  planId: PlanTier;
  onClick?: () => void;
}

const PLAN_STYLES: Record<PlanTier, string> = {
  FREE: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  STARTER: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  PRO: 'bg-[#2A8F9D]/10 text-[#2A8F9D] border-[#2A8F9D]/30',
  ENTERPRISE: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};

const PLAN_LABELS: Record<PlanTier, string> = {
  FREE: 'Free',
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

export function PlanBadge({ planId, onClick }: PlanBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-xs px-2 py-0.5 rounded-full border transition-all',
        'hover:brightness-110 cursor-pointer',
        PLAN_STYLES[planId]
      )}
    >
      {PLAN_LABELS[planId]}
    </button>
  );
}
