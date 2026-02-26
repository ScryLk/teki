import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          tenant: { select: { id: true, name: true, plan: true } },
        },
      },
      sessions: {
        where: { isActive: true },
        orderBy: { lastActivityAt: 'desc' },
        take: 5,
        select: {
          id: true,
          deviceType: true,
          browser: true,
          os: true,
          ipAddress: true,
          lastActivityAt: true,
          createdAt: true,
        },
      },
      credentials: {
        select: {
          mfaEnabled: true,
          failedAttempts: true,
          lockedUntil: true,
          passwordChangedAt: true,
        },
      },
      _count: {
        select: {
          sentMessages: true,
          conversationsCreated: true,
          messageFeedback: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    credentials: user.credentials
      ? {
          ...user.credentials,
          lockedUntil: user.credentials.lockedUntil?.toISOString() ?? null,
          passwordChangedAt: user.credentials.passwordChangedAt.toISOString(),
        }
      : null,
    sessions: user.sessions.map((s) => ({
      ...s,
      lastActivityAt: s.lastActivityAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    })),
    memberships: user.memberships.map((m) => ({
      id: m.id,
      role: m.role,
      status: m.status,
      tenantId: m.tenant.id,
      tenantName: m.tenant.name,
      tenantPlan: m.tenant.plan,
    })),
    stats: {
      messages: user._count.sentMessages,
      conversations: user._count.conversationsCreated,
      feedback: user._count.messageFeedback,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['status', 'firstName', 'lastName', 'displayName', 'phone'];
  const data: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (field in body) {
      data[field] = body[field];
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, status: true, firstName: true },
  });

  return NextResponse.json(user);
}
