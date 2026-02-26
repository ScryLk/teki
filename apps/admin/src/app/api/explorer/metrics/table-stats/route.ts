import { NextResponse } from 'next/server';
import { getTableStats } from '@/lib/explorer/metrics-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getTableStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load table stats' },
      { status: 500 }
    );
  }
}
