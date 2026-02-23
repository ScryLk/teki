import { z } from 'zod';

export const priorities = ['high', 'medium', 'low'] as const;
export const ticketStatuses = ['open', 'in_progress', 'waiting_client', 'waiting_internal', 'resolved', 'closed'] as const;
export const frequencies = ['always', 'intermittent', 'first_time', 'after_update'] as const;
export const impacts = ['all_users', 'some_users', 'single_user', 'single_machine'] as const;
export const resolutionCategories = ['bug', 'config', 'user_error', 'environment', 'infrastructure', 'feature_request', 'duplicate'] as const;

export const errorSchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
  stacktrace: z.string().optional(),
  log_excerpt: z.string().optional(),
}).optional().nullable();

export const createTicketSchema = z.object({
  clientId: z.string().min(1),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(150).optional().nullable(),
  priority: z.enum(priorities).default('medium'),
  summary: z.string().min(1).max(500),
  description: z.string().optional().nullable(),
  categoryFields: z.record(z.unknown()).optional().nullable(),
  error: errorSchema,
  stepsToReproduce: z.array(z.string()).optional().default([]),
  frequency: z.enum(frequencies).optional().nullable(),
  impact: z.enum(impacts).optional().nullable(),
  attachments: z.array(z.object({
    url: z.string(),
    type: z.string().optional(),
    name: z.string().optional(),
  })).optional().default([]),
});

export const updateTicketSchema = z.object({
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(priorities).optional(),
  category: z.string().min(1).max(100).optional(),
  subcategory: z.string().max(150).optional().nullable(),
  resolutionNotes: z.string().optional().nullable(),
  resolutionCategory: z.enum(resolutionCategories).optional().nullable(),
});

export const ticketMessageSchema = z.object({
  content: z.string().min(1),
  senderType: z.enum(['attendant', 'client', 'system']).default('attendant'),
  internal: z.boolean().default(false),
  attachments: z.array(z.object({
    url: z.string(),
    type: z.string().optional(),
    name: z.string().optional(),
  })).optional().default([]),
});

export type CreateTicket = z.infer<typeof createTicketSchema>;
export type UpdateTicket = z.infer<typeof updateTicketSchema>;
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>;
