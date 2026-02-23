import { prisma } from './prisma';
import type { Client, Tenant } from '@prisma/client';
import type { CreateTicket } from './validations/tickets';

interface TicketContextJson {
  $schema: string;
  ticket_id: string;
  timestamp: string;
  priority: string;
  tenant: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
    contract_plan: string | null;
    software: {
      name: string | null;
      version: string | null;
      build: string | null;
      modules_active: string[];
    };
    environment: Record<string, unknown>;
  };
  issue: {
    category: string;
    subcategory: string | null;
    summary: string;
    description: string | null;
    error: Record<string, unknown> | null;
    steps_to_reproduce: string[];
    frequency: string | null;
    started_after: string | null;
    impact: string | null;
  };
  category_fields: Record<string, unknown>;
  history: {
    previous_tickets: string[];
    solutions_already_attempted: string[];
    recurrence_count: number;
    last_occurrence: string | null;
  };
  attachments: {
    screenshots: string[];
    log_files: string[];
    config_files: string[];
  };
}

export async function buildContextJson(
  tenant: Tenant,
  client: Client,
  ticketNumber: string,
  data: CreateTicket
): Promise<TicketContextJson> {
  const env = (client.environmentJson as Record<string, unknown>) ?? {};

  // Find previous tickets from this client in this category
  const previousTickets = await prisma.ticket.findMany({
    where: {
      tenantId: tenant.id,
      clientId: client.id,
      category: data.category,
      status: { in: ['resolved', 'closed'] },
    },
    select: { ticketNumber: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const attachments = data.attachments ?? [];
  const screenshots = attachments.filter(a => a.type?.startsWith('image')).map(a => a.url);
  const logFiles = attachments.filter(a => a.name?.endsWith('.log') || a.name?.endsWith('.txt')).map(a => a.url);
  const configFiles = attachments.filter(a => !a.type?.startsWith('image') && !a.name?.endsWith('.log') && !a.name?.endsWith('.txt')).map(a => a.url);

  return {
    $schema: 'teki/ticket-context/v1',
    ticket_id: ticketNumber,
    timestamp: new Date().toISOString(),
    priority: data.priority,
    tenant: {
      id: tenant.id,
      name: tenant.name,
    },
    client: {
      id: client.id,
      name: client.name,
      contract_plan: client.contractPlan,
      software: {
        name: tenant.softwareName ?? null,
        version: client.softwareVersion ?? null,
        build: null,
        modules_active: [],
      },
      environment: env,
    },
    issue: {
      category: data.category,
      subcategory: data.subcategory ?? null,
      summary: data.summary,
      description: data.description ?? null,
      error: data.error ?? null,
      steps_to_reproduce: data.stepsToReproduce ?? [],
      frequency: data.frequency ?? null,
      started_after: null,
      impact: data.impact ?? null,
    },
    category_fields: (data.categoryFields as Record<string, unknown>) ?? {},
    history: {
      previous_tickets: previousTickets.map(t => t.ticketNumber),
      solutions_already_attempted: [],
      recurrence_count: previousTickets.length,
      last_occurrence: previousTickets[0]?.createdAt?.toISOString() ?? null,
    },
    attachments: {
      screenshots,
      log_files: logFiles,
      config_files: configFiles,
    },
  };
}

export async function generateTicketNumber(tenantId: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

  const lastTicket = await prisma.ticket.findFirst({
    where: {
      tenantId,
      ticketNumber: { startsWith: `TK-${dateStr}` },
    },
    orderBy: { ticketNumber: 'desc' },
    select: { ticketNumber: true },
  });

  let seq = 1;
  if (lastTicket) {
    const parts = lastTicket.ticketNumber.split('-');
    seq = parseInt(parts[2], 10) + 1;
  }

  return `TK-${dateStr}-${seq.toString().padStart(4, '0')}`;
}
