import { NextRequest, NextResponse } from 'next/server';
import { listRecords } from '@/lib/explorer/data-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await params;
    const searchParams = request.nextUrl.searchParams;

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;
    const expandStr = searchParams.get('expand');
    const expand = expandStr ? expandStr.split(',') : undefined;

    // Parse filters from query params (filter_fieldName=value)
    const filters: Record<string, unknown> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        const fieldName = key.slice(7);
        // Try to parse JSON values (for arrays, objects)
        try {
          filters[fieldName] = JSON.parse(value);
        } catch {
          filters[fieldName] = value;
        }
      }
    }

    const result = await listRecords(model, {
      page,
      pageSize,
      search,
      sort,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      expand,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
