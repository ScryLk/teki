import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { requireTenant, TenantError } from '@/lib/tenant';
import { createTicketSchema } from '@/lib/validations/tickets';
import { buildContextJson, generateTicketNumber } from '@/lib/ticket-context';
import { ZodError } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const clientId = searchParams.get('clientId');
    const attendantId = searchParams.get('attendantId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId: tenant.id };
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (clientId) where.clientId = clientId;
    if (attendantId) where.attendantId = attendantId;
    if (dateFrom || dateTo) {
      where.createdAt = {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      };
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          attendant: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    return NextResponse.json({
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof TenantError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error('GET /api/tickets error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const tenant = await requireTenant(user);

    const body = await req.json();
    const data = createTicketSchema.parse(body);

    // Validate client belongs to tenant
    const client = await prisma.client.findFirst({
      where: { id: data.clientId, tenantId: tenant.id, active: true },
    });
    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
    }

    const ticketNumber = await generateTicketNumber(tenant.id);
    const contextJson = await buildContextJson(tenant, client, ticketNumber, data);

    const ticket = await prisma.ticket.create({
      data: {
        tenantId: tenant.id,
        ticketNumber,
        clientId: client.id,
        attendantId: user.id,
        category: data.category,
        subcategory: data.subcategory,
        priority: data.priority,
        summary: data.summary,
        description: data.description,
        contextJson: JSON.parse(JSON.stringify(contextJson)),
        categoryFieldsJson: data.categoryFields ? JSON.parse(JSON.stringify(data.categoryFields)) : undefined,
        errorJson: data.error ? JSON.parse(JSON.stringify(data.error)) : undefined,
        stepsToReproduce: data.stepsToReproduce ?? [],
        frequency: data.frequency,
        impact: data.impact,
        attachments: data.attachments ?? [],
      },
      include: {
        client: { select: { id: true, name: true, email: true } },
        attendant: { select: { id: true, name: true, email: true } },
      },
    });

    // Create initial system message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderType: 'system',
        content: `Ticket ${ticketNumber} criado por ${user.name}. Categoria: ${data.category}. Prioridade: ${data.priority}.`,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
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
    console.error('POST /api/tickets error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
