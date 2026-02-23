import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { updateTicketSchema } from '@/lib/validations/tickets';
import { ZodError } from 'zod';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: { id, tenantId: tenant.id },
      include: {
        client: true,
        attendant: { select: { id: true, name: true, email: true, avatarUrl: true } },
        resolvedBy: { select: { id: true, name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/tickets/[id] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { id } = await params;

    const body = await req.json();
    const data = updateTicketSchema.parse(body);

    const existing = await prisma.ticket.findFirst({
      where: { id, tenantId: tenant.id },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Ticket não encontrado.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (data.status) {
      updateData.status = data.status;

      if (data.status === 'resolved' && existing.status !== 'resolved') {
        updateData.resolvedById = user.id;
        updateData.resolvedAt = new Date();
        if (data.resolutionNotes) updateData.resolutionNotes = data.resolutionNotes;
        if (data.resolutionCategory) updateData.resolutionCategory = data.resolutionCategory;
      }

      if (data.status === 'closed' && !existing.closedAt) {
        updateData.closedAt = new Date();
      }

      // Track first response
      if (!existing.firstResponseAt && data.status === 'in_progress') {
        updateData.firstResponseAt = new Date();
      }
    }

    if (data.priority) updateData.priority = data.priority;
    if (data.category) updateData.category = data.category;
    if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
    if (data.resolutionNotes !== undefined) updateData.resolutionNotes = data.resolutionNotes;
    if (data.resolutionCategory !== undefined) updateData.resolutionCategory = data.resolutionCategory;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, email: true } },
        attendant: { select: { id: true, name: true, email: true } },
      },
    });

    // Create system message for status change
    if (data.status && data.status !== existing.status) {
      await prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderType: 'system',
          content: `Status alterado de "${existing.status}" para "${data.status}" por ${user.name}.`,
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
    }
    console.error('PUT /api/tickets/[id] error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
