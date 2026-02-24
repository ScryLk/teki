import { NextRequest, NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';

const VALID_EVENTS = [
  'new_ticket',
  'new_message',
  'ticket_resolved',
  'ai_error',
  'rate_limit',
  'login_failed',
  'slow_query',
  'error_500',
  'new_suggestion',
  'ocr_result',
  'audio_transcript',
  'limit_reached_articles',
  'limit_reached_storage',
  'ai_streaming_response',
  'fallback_provider',
  'cost_alert',
] as const;

export async function POST(req: NextRequest) {
  const guard = devOnlyGuard();
  if (guard) return guard;

  const body = await req.json();
  const event = body.event as string;
  const data = body.data ?? {};

  if (!event || !VALID_EVENTS.includes(event as (typeof VALID_EVENTS)[number])) {
    return NextResponse.json(
      {
        error: `Invalid event. Valid events: ${VALID_EVENTS.join(', ')}`,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    event,
    data,
    timestamp: new Date().toISOString(),
    message: `Event "${event}" simulated`,
  });
}
