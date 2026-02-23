import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requirePlatformOwner,
  handleAdminError,
} from '@/lib/logging/require-platform-owner';
import type { Prisma, PlatformLog } from '@prisma/client';

const MAX_EXPORT_ROWS = 10000;

export async function POST(req: NextRequest) {
  try {
    await requirePlatformOwner(req);

    const body = await req.json();
    const {
      format = 'json',
      filters = {},
      fields,
    } = body as {
      format: 'csv' | 'json';
      filters: Record<string, string>;
      fields?: string[];
    };

    // Build WHERE clause
    const where: Prisma.PlatformLogWhereInput = {};
    if (filters.category) where.category = filters.category.toUpperCase() as Prisma.EnumLogCategoryFilter;
    if (filters.severity) where.severity = filters.severity.toUpperCase() as Prisma.EnumLogSeverityFilter;
    if (filters.tenant_id) where.tenantId = filters.tenant_id;
    if (filters.user_id) where.userId = filters.user_id;
    if (filters.event_type) where.eventType = { contains: filters.event_type, mode: 'insensitive' };
    if (filters.search) where.summary = { contains: filters.search, mode: 'insensitive' };
    if (filters.date_from || filters.date_to) {
      where.createdAt = {};
      if (filters.date_from) where.createdAt.gte = new Date(filters.date_from);
      if (filters.date_to) {
        const end = new Date(filters.date_to);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const logs = await prisma.platformLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: MAX_EXPORT_ROWS,
    });

    // Filter fields if specified
    const defaultFields = [
      'id', 'createdAt', 'category', 'eventType', 'severity',
      'tenantId', 'userId', 'userEmail', 'summary', 'details', 'durationMs',
    ];
    const selectedFields = fields ?? defaultFields;

    const filterFields = (log: PlatformLog) => {
      const filtered: Record<string, unknown> = {};
      for (const field of selectedFields) {
        if (field in log) {
          filtered[field] = log[field as keyof PlatformLog];
        }
      }
      return filtered;
    };

    if (format === 'csv') {
      const filteredLogs = logs.map(filterFields);
      const headers = selectedFields.join(',');
      const rows = filteredLogs.map((log) =>
        selectedFields.map((field) => {
          const val = log[field];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      );

      const csv = [headers, ...rows].join('\n');

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="teki-logs-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON format
    const filteredLogs = logs.map(filterFields);

    return new Response(JSON.stringify({ data: filteredLogs, total: filteredLogs.length }, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="teki-logs-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return handleAdminError(error);
  }
}
