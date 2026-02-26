import { NextRequest, NextResponse } from 'next/server';
import { deleteRecord } from '@/lib/explorer/data-service';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const { model, id } = await params;
    const session = await getSession();

    await deleteRecord(model, id, session?.email || 'unknown', true);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'HARD_DELETE_NOT_ALLOWED') {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
