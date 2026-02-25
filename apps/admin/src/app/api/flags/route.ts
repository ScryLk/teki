import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Feature flags are stored in a simple JSON settings field on each tenant
// This API provides a unified view across all tenants

export async function GET() {
  // Get all tenants with their settings to extract feature flags
  const tenants = await prisma.tenant.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      name: true,
      plan: true,
      settings: true,
    },
    orderBy: { name: 'asc' },
  });

  // Collect flags from tenant settings
  const flagsMap = new Map<string, { enabled: number; disabled: number; tenants: string[] }>();

  for (const tenant of tenants) {
    const settings = tenant.settings as Record<string, unknown> | null;
    if (!settings || typeof settings !== 'object') continue;

    const flags = (settings.featureFlags || {}) as Record<string, boolean>;
    for (const [key, value] of Object.entries(flags)) {
      const existing = flagsMap.get(key) || { enabled: 0, disabled: 0, tenants: [] };
      if (value) {
        existing.enabled++;
        existing.tenants.push(tenant.name);
      } else {
        existing.disabled++;
      }
      flagsMap.set(key, existing);
    }
  }

  const flags = Array.from(flagsMap.entries()).map(([name, data]) => ({
    name,
    enabled: data.enabled,
    disabled: data.disabled,
    total: data.enabled + data.disabled,
    enabledTenants: data.tenants,
  }));

  return NextResponse.json({
    flags,
    totalTenants: tenants.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { flagName, tenantId, enabled } = body;

  if (!flagName || !tenantId) {
    return NextResponse.json({ error: 'flagName e tenantId obrigatorios' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant nao encontrado' }, { status: 404 });
  }

  const settings = (tenant.settings as Record<string, unknown>) || {};
  const flags = (settings.featureFlags || {}) as Record<string, boolean>;
  flags[flagName] = !!enabled;
  settings.featureFlags = flags;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { settings },
  });

  return NextResponse.json({ success: true });
}
