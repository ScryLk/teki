import { z } from 'zod';

export const fieldTypes = ['text', 'select', 'number', 'boolean', 'textarea', 'date'] as const;
export const aiWeights = ['high', 'medium', 'low'] as const;

export const createTemplateFieldSchema = z.object({
  category: z.string().min(1).max(100),
  subcategory: z.string().max(150).optional().nullable(),
  fieldKey: z.string().min(1).max(100).regex(/^[a-z_][a-z0-9_]*$/, 'fieldKey must be snake_case'),
  fieldLabel: z.string().min(1).max(200),
  fieldType: z.enum(fieldTypes).default('text'),
  fieldOptions: z.array(z.string()).optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  required: z.boolean().default(false),
  aiWeight: z.enum(aiWeights).default('medium'),
  displayOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const updateTemplateFieldSchema = createTemplateFieldSchema.partial().omit({ category: true, fieldKey: true });

export type CreateTemplateField = z.infer<typeof createTemplateFieldSchema>;
export type UpdateTemplateField = z.infer<typeof updateTemplateFieldSchema>;
