import { NextRequest, NextResponse } from 'next/server';
import { getRecord, updateRecord, deleteRecord } from '@/lib/explorer/data-service';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const { model, id } = await params;
    const record = await getRecord(model, id);
    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'RECORD_NOT_FOUND') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const { model, id } = await params;
    const session = await getSession();
    const body = await request.json();

    const record = await updateRecord(
      model,
      id,
      body,
      session?.email || 'unknown'
    );
    return NextResponse.json({ record });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'RECORD_NOT_FOUND') {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    if (message === 'EDIT_NOT_ALLOWED' || message === 'NO_EDITABLE_FIELDS') {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ model: string; id: string }> }
) {
  try {
    const { model, id } = await params;
    const session = await getSession();

    await deleteRecord(model, id, session?.email || 'unknown', false);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'DELETE_NOT_ALLOWED' || message === 'NO_SOFT_DELETE_FIELD') {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
