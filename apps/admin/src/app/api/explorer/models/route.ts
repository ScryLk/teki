import { NextResponse } from 'next/server';
import { getRegisteredModels } from '@/lib/explorer/schema-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const models = await getRegisteredModels();
    return NextResponse.json({ models });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load models' },
      { status: 500 }
    );
  }
}
