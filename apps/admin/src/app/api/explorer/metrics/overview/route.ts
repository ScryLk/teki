import { NextResponse } from 'next/server';
import { getOverview } from '@/lib/explorer/metrics-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const overview = await getOverview();
    return NextResponse.json(overview);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load metrics' },
      { status: 500 }
    );
  }
}
