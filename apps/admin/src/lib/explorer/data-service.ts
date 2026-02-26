import { prisma } from '@/lib/prisma';
import { getModelConfigOrFail } from './model-registry';
import type { ExplorerQuery, ModelConfig, PaginatedResult } from './types';

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function getDelegate(modelName: string) {
  return (prisma as Record<string, unknown>)[toCamelCase(modelName)] as Record<string, Function>;
}

/**
 * Build Prisma WHERE clause from explorer query filters.
 */
function buildWhere(config: ModelConfig, query: ExplorerQuery): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  // Soft delete filter
  if (config.softDeleteField) {
    where[config.softDeleteField] = null;
  }

  // Text search
  if (query.search && config.searchableFields.length > 0) {
    where.OR = config.searchableFields.map((field) => ({
      [field]: { contains: query.search, mode: 'insensitive' },
    }));
  }

  // Dynamic filters
  if (query.filters) {
    for (const [field, value] of Object.entries(query.filters)) {
      const filterConfig = config.filters.find((f) => f.field === field);
      if (!filterConfig) continue;

      switch (filterConfig.type) {
        case 'select':
          where[field] = value;
          break;
        case 'multi_select':
          if (Array.isArray(value) && value.length > 0) {
            where[field] = { in: value };
          }
          break;
        case 'boolean':
          where[field] = value === 'true' || value === true;
          break;
        case 'date_range': {
          const range = value as { from?: string; to?: string };
          if (range.from || range.to) {
            const dateFilter: Record<string, Date> = {};
            if (range.from) dateFilter.gte = new Date(range.from);
            if (range.to) dateFilter.lte = new Date(range.to);
            where[field] = dateFilter;
          }
          break;
        }
        case 'number_range': {
          const numRange = value as { min?: number; max?: number };
          if (numRange.min !== undefined || numRange.max !== undefined) {
            const numFilter: Record<string, number> = {};
            if (numRange.min !== undefined) numFilter.gte = numRange.min;
            if (numRange.max !== undefined) numFilter.lte = numRange.max;
            where[field] = numFilter;
          }
          break;
        }
        case 'text':
          if (value) {
            where[field] = { contains: value as string, mode: 'insensitive' };
          }
          break;
      }
    }
  }

  return where;
}

/**
 * Build Prisma INCLUDE clause for relations.
 */
function buildInclude(config: ModelConfig, expand?: string[]): Record<string, boolean | object> | undefined {
  const include: Record<string, boolean | object> = {};

  // Always include inline relations with minimal fields
  for (const rel of config.inlineRelations) {
    include[rel] = {
      select: { id: true, displayName: true, name: true, firstName: true, lastName: true, avatarUrl: true, email: true },
    };
  }

  // Expand requested relations
  if (expand) {
    for (const rel of expand) {
      if (config.expandableRelations.includes(rel) || config.inlineRelations.includes(rel)) {
        if (!include[rel]) {
          include[rel] = true;
        }
      }
    }
  }

  return Object.keys(include).length > 0 ? include : undefined;
}

/**
 * Apply field masking to sensitive fields.
 */
function applyMasking(record: Record<string, unknown>, config: ModelConfig): Record<string, unknown> {
  const masked = { ...record };

  for (const field of config.maskedFields) {
    if (masked[field] && typeof masked[field] === 'string') {
      masked[field] = maskValue(masked[field] as string, field);
    }
  }

  // Remove hidden fields
  for (const field of config.hiddenFields) {
    delete masked[field];
  }

  return masked;
}

function maskValue(value: string, fieldName: string): string {
  if (fieldName === 'email' || value.includes('@')) {
    const [user, domain] = value.split('@');
    if (!domain) return '****';
    return `${user[0]}${'*'.repeat(Math.max(3, user.length - 1))}@${domain[0]}${'*'.repeat(Math.max(3, domain.length - 4))}${domain.slice(-4)}`;
  }
  if (value.length <= 4) return '****';
  return `${value.slice(0, 2)}${'*'.repeat(value.length - 4)}${value.slice(-2)}`;
}

// ═══════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════

export async function listRecords(
  modelName: string,
  query: ExplorerQuery
): Promise<PaginatedResult> {
  const config = getModelConfigOrFail(modelName);
  const delegate = getDelegate(modelName);

  const page = Math.max(1, query.page || 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize || 25));

  const where = buildWhere(config, query);
  const include = buildInclude(config, query.expand);

  // Sort
  let orderBy: Record<string, 'asc' | 'desc'> = {};
  if (query.sort) {
    const desc = query.sort.startsWith('-');
    const field = desc ? query.sort.slice(1) : query.sort;
    orderBy = { [field]: desc ? 'desc' : 'asc' };
  } else {
    orderBy = { [config.defaultSortField]: config.defaultSortOrder };
  }

  const [records, total] = await Promise.all([
    delegate.findMany({
      where,
      orderBy,
      include,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    delegate.count({ where }),
  ]);

  const maskedRecords = (records as Record<string, unknown>[]).map((record) =>
    applyMasking(record, config)
  );

  return {
    data: maskedRecords,
    pagination: {
      page,
      pageSize,
      total: total as number,
      totalPages: Math.ceil((total as number) / pageSize),
      hasNext: page * pageSize < (total as number),
      hasPrev: page > 1,
    },
  };
}

export async function getRecord(
  modelName: string,
  id: string
): Promise<Record<string, unknown>> {
  const config = getModelConfigOrFail(modelName);
  const delegate = getDelegate(modelName);

  const include: Record<string, boolean | object> = {};
  for (const rel of [...config.expandableRelations, ...config.inlineRelations]) {
    include[rel] = true;
  }

  const record = await delegate.findUnique({
    where: { id },
    include: Object.keys(include).length > 0 ? include : undefined,
  });

  if (!record) {
    throw new Error('RECORD_NOT_FOUND');
  }

  return applyMasking(record as Record<string, unknown>, config);
}

export async function updateRecord(
  modelName: string,
  id: string,
  data: Record<string, unknown>,
  adminEmail: string
): Promise<Record<string, unknown>> {
  const config = getModelConfigOrFail(modelName);
  if (!config.allowEdit) throw new Error('EDIT_NOT_ALLOWED');

  const delegate = getDelegate(modelName);

  // Whitelist only editable fields
  const sanitizedData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (config.editableFields?.includes(key)) {
      sanitizedData[key] = value;
    }
  }

  if (Object.keys(sanitizedData).length === 0) {
    throw new Error('NO_EDITABLE_FIELDS');
  }

  // Get before state for audit
  const before = await delegate.findUnique({ where: { id } });
  if (!before) throw new Error('RECORD_NOT_FOUND');

  const updated = await delegate.update({
    where: { id },
    data: sanitizedData,
  });

  // Build changes diff
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const [key, value] of Object.entries(sanitizedData)) {
    if ((before as Record<string, unknown>)[key] !== value) {
      changes[key] = { from: (before as Record<string, unknown>)[key], to: value };
    }
  }

  // Audit log
  await prisma.dataAccessLog.create({
    data: {
      accessorId: '00000000-0000-0000-0000-000000000000',
      accessorType: 'ADMIN',
      subjectId: id.length === 36 ? id : '00000000-0000-0000-0000-000000000000',
      action: 'MODIFY',
      dataCategories: [`admin.explorer.${modelName}.update`],
      details: { adminEmail, changes, model: modelName, recordId: id },
      legalBasis: 'LEGITIMATE_INTEREST',
      justification: `Admin explorer edit by ${adminEmail}`,
    },
  });

  return applyMasking(updated as Record<string, unknown>, config);
}

export async function deleteRecord(
  modelName: string,
  id: string,
  adminEmail: string,
  hard: boolean = false
): Promise<void> {
  const config = getModelConfigOrFail(modelName);

  if (hard && !config.allowHardDelete) throw new Error('HARD_DELETE_NOT_ALLOWED');
  if (!hard && !config.allowDelete) throw new Error('DELETE_NOT_ALLOWED');

  const delegate = getDelegate(modelName);

  if (hard) {
    await delegate.delete({ where: { id } });
  } else if (config.softDeleteField) {
    await delegate.update({
      where: { id },
      data: { [config.softDeleteField]: new Date() },
    });
  } else {
    throw new Error('NO_SOFT_DELETE_FIELD');
  }

  await prisma.dataAccessLog.create({
    data: {
      accessorId: '00000000-0000-0000-0000-000000000000',
      accessorType: 'ADMIN',
      subjectId: id.length === 36 ? id : '00000000-0000-0000-0000-000000000000',
      action: 'DELETE',
      dataCategories: [`admin.explorer.${modelName}.${hard ? 'hard_delete' : 'soft_delete'}`],
      details: { adminEmail, model: modelName, recordId: id, hard },
      legalBasis: 'LEGITIMATE_INTEREST',
      justification: `Admin explorer ${hard ? 'hard' : 'soft'} delete by ${adminEmail}`,
    },
  });
}

export async function exportRecords(
  modelName: string,
  query: ExplorerQuery
): Promise<{ data: Record<string, unknown>[]; filename: string }> {
  const config = getModelConfigOrFail(modelName);
  if (!config.exportable) throw new Error('EXPORT_NOT_ALLOWED');

  const result = await listRecords(modelName, {
    ...query,
    page: 1,
    pageSize: config.maxExportRows,
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${modelName.toLowerCase()}_${timestamp}`;

  return { data: result.data, filename };
}
