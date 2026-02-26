import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      aiProviderConfigs: {
        select: {
          id: true,
          provider: true,
          isActive: true,
          currentMonthCostUsd: true,
          currentMonthRequests: true,
        },
      },
      _count: {
        select: {
          members: true,
          conversations: true,
          aiUsageDaily: true,
        },
      },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant nao encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    ...tenant,
    createdAt: tenant.createdAt.toISOString(),
    updatedAt: tenant.updatedAt.toISOString(),
    planStartedAt: tenant.planStartedAt?.toISOString() ?? null,
    planExpiresAt: tenant.planExpiresAt?.toISOString() ?? null,
    trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
    members: tenant.members.map((m) => ({
      id: m.id,
      role: m.role,
      status: m.status,
      userId: m.user.id,
      email: m.user.email,
      name: `${m.user.firstName} ${m.user.lastName || ''}`.trim(),
      userStatus: m.user.status,
    })),
    aiProviders: tenant.aiProviderConfigs.map((p) => ({
      ...p,
      currentMonthCostUsd: Number(p.currentMonthCostUsd),
    })),
    stats: {
      members: tenant._count.members,
      conversations: tenant._count.conversations,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['plan', 'status', 'name', 'email', 'billingEmail'];
  const data: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  const tenant = await prisma.tenant.update({
    where: { id },
    data,
    select: { id: true, name: true, plan: true, status: true },
  });

  return NextResponse.json(tenant);
}
