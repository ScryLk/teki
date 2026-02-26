import { NextRequest, NextResponse } from 'next/server';
import { getModelSchema } from '@/lib/explorer/schema-service';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await params;
    const schema = getModelSchema(model);
    return NextResponse.json({ schema });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'MODEL_NOT_FOUND') {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
