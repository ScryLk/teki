import { NextResponse } from 'next/server';
import { withRequestLog } from '@/lib/request-logger';

async function _GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}

export const GET = withRequestLog(_GET);
