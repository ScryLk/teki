import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Fetch recent system-level notifications (broadcasts)
  const broadcasts = await prisma.notification.findMany({
    where: {
      type: { in: ['system_maintenance', 'system_update', 'plan_upgraded', 'plan_expiring'] },
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      priority: true,
      isRead: true,
      createdAt: true,
      tenant: { select: { name: true } },
      recipient: { select: { email: true, firstName: true } },
    },
  });

  return NextResponse.json({
    broadcasts: broadcasts.map((b) => ({
      id: b.id,
      type: b.type,
      title: b.title,
      body: b.body,
      priority: b.priority,
      isRead: b.isRead,
      createdAt: b.createdAt.toISOString(),
      tenantName: b.tenant.name,
      recipientEmail: b.recipient.email,
      recipientName: b.recipient.firstName,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, body: messageBody, priority = 'NORMAL', tenantIds } = body;

  if (!title || !messageBody) {
    return NextResponse.json(
      { error: 'titulo e corpo sao obrigatorios' },
      { status: 400 }
    );
  }

  // Get all active members from the specified tenants (or all if not specified)
  const memberWhere: Record<string, unknown> = { status: 'ACTIVE' };
  if (tenantIds?.length) {
    memberWhere.tenantId = { in: tenantIds };
  }

  const members = await prisma.tenantMember.findMany({
    where: memberWhere,
    select: {
      userId: true,
      tenantId: true,
    },
    distinct: ['userId'],
  });

  // Create notifications in batch
  const notifications = members.map((m) => ({
    tenantId: m.tenantId,
    recipientId: m.userId,
    type: 'system_maintenance',
    title,
    body: messageBody,
    priority,
  }));

  const result = await prisma.notification.createMany({
    data: notifications,
  });

  return NextResponse.json({
    success: true,
    sent: result.count,
  });
}
