import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { logDataAccess } from '@/lib/services/data-access-log.service';
import type { DataAccessAction, DataCategory } from '@teki/shared';

const VALID_ACTIONS: DataAccessAction[] = ['view', 'export', 'modify', 'delete', 'process', 'share'];

/**
 * POST /api/v1/logs
 * Receives action logs from the desktop app.
 * Expects: { action, event, details? }
 */
export async function POST(req: NextRequest) {
  try {
    const { user, authMethod } = await requireAuth(req);

    const body = await req.json();
    const { event, action, details, dataCategories } = body as {
      event: string;
      action?: DataAccessAction;
      details?: Record<string, unknown>;
      dataCategories?: DataCategory[];
    };

    if (!event) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'Campo "event" obrigatorio' } },
        { status: 400 },
      );
    }

    const resolvedAction: DataAccessAction = (action && VALID_ACTIONS.includes(action)) ? action : 'process';
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const userAgent = req.headers.get('user-agent') ?? undefined;

    await logDataAccess({
      accessorId: user.id,
      accessorType: authMethod === 'apikey' ? 'api' : 'user',
      subjectId: user.id,
      action: resolvedAction,
      dataCategories: dataCategories ?? ['activity'],
      details: { event, source: 'desktop', ...details },
      legalBasis: 'LEGITIMATE_INTEREST',
      justification: event,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: 401 },
      );
    }
    console.error('[v1/logs]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
