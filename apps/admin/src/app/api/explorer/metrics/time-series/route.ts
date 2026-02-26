import { NextRequest, NextResponse } from 'next/server';
import { getTimeSeries } from '@/lib/explorer/metrics-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metric = searchParams.get('metric') || 'new_users';
    const period = searchParams.get('period') || '30d';

    const data = await getTimeSeries(metric, period);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'INVALID_METRIC') {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
