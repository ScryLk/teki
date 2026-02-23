import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requirePlatformOwner,
  handleAdminError,
} from '@/lib/logging/require-platform-owner';
import type { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requirePlatformOwner(req);

    const url = req.nextUrl;
    const category = url.searchParams.get('category');
    const severity = url.searchParams.get('severity');
    const tenantId = url.searchParams.get('tenant_id');
    const userId = url.searchParams.get('user_id');
    const eventType = url.searchParams.get('event_type');
    const entityType = url.searchParams.get('entity_type');
    const entityId = url.searchParams.get('entity_id');
    const search = url.searchParams.get('search');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
    const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page') ?? '50')));
    const sort = url.searchParams.get('sort') ?? 'created_at:desc';

    // Build WHERE clause
    const where: Prisma.PlatformLogWhereInput = {};

    if (category) {
      const validCategories = ['AUDIT', 'AI', 'SECURITY', 'SYSTEM'];
      if (validCategories.includes(category.toUpperCase())) {
        where.category = category.toUpperCase() as Prisma.EnumLogCategoryFilter;
      }
    }

    if (severity) {
      const validSeverities = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
      if (validSeverities.includes(severity.toUpperCase())) {
        where.severity = severity.toUpperCase() as Prisma.EnumLogSeverityFilter;
      }
    }

    if (tenantId) where.tenantId = tenantId;
    if (userId) where.userId = userId;
    if (eventType) where.eventType = { contains: eventType, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (search) {
      where.summary = { contains: search, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Build ORDER BY
    const [sortField, sortDir] = sort.split(':');
    const orderByField = sortField === 'created_at' ? 'createdAt' : 'createdAt';
    const orderBy: Prisma.PlatformLogOrderByWithRelationInput = {
      [orderByField]: sortDir === 'asc' ? 'asc' : 'desc',
    };

    const [logs, total] = await Promise.all([
      prisma.platformLog.findMany({
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.platformLog.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
