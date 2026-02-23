import { prisma } from './prisma';
import type { User, Tenant } from '@prisma/client';

export interface TenantContext {
  user: User;
  tenant: Tenant;
}

export async function getTenantForUser(user: User): Promise<Tenant | null> {
  if (!user.tenantId) return null;

  return prisma.tenant.findUnique({
    where: { id: user.tenantId, active: true },
  });
}

export async function requireTenant(user: User): Promise<Tenant> {
  const tenant = await getTenantForUser(user);
  if (!tenant) {
    throw new TenantError('Usuário não está associado a nenhuma empresa ativa.');
  }
  return tenant;
}

export function getTenantSettings(tenant: Tenant) {
  const defaults = {
    ai_config: {
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      temperature: 0.3,
      auto_suggest: true,
      auto_respond_threshold: 0.9,
      language: 'pt-BR',
      max_kb_articles_in_context: 5,
      max_similar_tickets_in_context: 3,
    },
    ticket_config: {
      auto_assign: true,
      sla_hours: { high: 4, medium: 12, low: 48 },
      require_category: true,
      require_subcategory: false,
      auto_detect_category: true,
    },
    kb_config: {
      require_review: true,
      auto_suggest_articles: true,
      semantic_search_enabled: true,
      min_relevance_score: 30,
    },
  };

  const settings = (tenant.settings as Record<string, unknown>) ?? {};
  return {
    ai_config: { ...defaults.ai_config, ...(settings.ai_config as Record<string, unknown> ?? {}) },
    ticket_config: { ...defaults.ticket_config, ...(settings.ticket_config as Record<string, unknown> ?? {}) },
    kb_config: { ...defaults.kb_config, ...(settings.kb_config as Record<string, unknown> ?? {}) },
  };
}

export class TenantError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantError';
  }
}
