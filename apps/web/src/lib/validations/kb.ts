import { z } from 'zod';

export const kbStatuses = ['draft', 'published', 'archived', 'deprecated'] as const;
export const solutionTypes = ['workaround', 'permanent_fix', 'configuration', 'known_issue'] as const;

export const createKbArticleSchema = z.object({
  title: z.string().min(1).max(500),
  category: z.string().min(1).max(100),
  subcategory: z.string().max(150).optional().nullable(),
  softwareName: z.string().max(200).optional().nullable(),
  versionMin: z.string().max(20).optional().nullable(),
  versionMax: z.string().max(20).optional().nullable(),
  problemDescription: z.string().min(1),
  solutionSteps: z.string().min(1),
  solutionType: z.enum(solutionTypes).optional().nullable(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(kbStatuses).default('draft'),
});

export const updateKbArticleSchema = createKbArticleSchema.partial();

export const kbSearchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  errorCode: z.string().optional(),
  softwareVersion: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export const kbFeedbackSchema = z.object({
  articleId: z.string().min(1),
  ticketId: z.string().optional(),
  helpful: z.boolean(),
});

export type CreateKbArticle = z.infer<typeof createKbArticleSchema>;
export type UpdateKbArticle = z.infer<typeof updateKbArticleSchema>;
export type KbSearch = z.infer<typeof kbSearchSchema>;
