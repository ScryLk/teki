import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { ticketMessageSchema } from '@/lib/validations/tickets';
import { ZodError } from 'zod';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);
    const { id } = await params;

    const ticket = await prisma.ticket.findFirst({
      where: { id, tenantId: tenant.id },
    });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket não encontrado.' }, { status: 404 });
    }

    const body = await req.json();
    const data = ticketMessageSchema.parse(body);

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderType: data.senderType,
        senderId: user.id,
        content: data.content,
        internal: data.internal,
        attachments: data.attachments,
      },
    });

    // Update first response time if this is the first attendant message
    if (data.senderType === 'attendant' && !ticket.firstResponseAt) {
      await prisma.ticket.update({
        where: { id },
        data: { firstResponseAt: new Date() },
      });
    }

    return NextResponse.json(message, { status: 201 });
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
    console.error('POST /api/tickets/[id]/messages error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
