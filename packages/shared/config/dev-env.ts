export type PlanName = 'free' | 'starter' | 'pro' | 'enterprise';
export type UserRole = 'owner' | 'admin' | 'agent' | 'viewer';
export type SeedScenario = 'empty' | 'basic' | 'full' | 'limit';

export interface DevConfig {
  enabled: boolean;
  plan: PlanName;
  role: UserRole;
  devTools: boolean;
  seed: SeedScenario;
}

export function getDevConfig(): DevConfig {
  const enabled = process.env.NODE_ENV === 'development';

  return {
    enabled,
    plan: (process.env.TEKI_DEV_PLAN as PlanName) || 'pro',
    role: (process.env.TEKI_DEV_ROLE as UserRole) || 'owner',
    devTools: process.env.TEKI_DEV_TOOLS !== 'false',
    seed: (process.env.TEKI_DEV_SEED as SeedScenario) || 'basic',
  };
}

export function assertDev(): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('DevTools not available in production');
  }
}
