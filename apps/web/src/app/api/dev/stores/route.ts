import { NextResponse } from 'next/server';
import { devOnlyGuard } from '@/lib/dev-only';

export async function GET() {
  const guard = devOnlyGuard();
  if (guard) return guard;

  // Server-side store snapshot — client stores are inspected directly by the DevTools panel
  return NextResponse.json({
    ok: true,
    stores: {
      note: 'Client-side Zustand stores are inspected directly in the browser. Use the DevTools Inspector tab.',
    },
  });
}
