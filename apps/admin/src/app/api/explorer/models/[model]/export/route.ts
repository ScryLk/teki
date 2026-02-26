import { NextRequest, NextResponse } from 'next/server';
import { exportRecords } from '@/lib/explorer/data-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    const search = searchParams.get('search') || undefined;
    const sort = searchParams.get('sort') || undefined;

    // Parse filters
    const filters: Record<string, unknown> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_')) {
        const fieldName = key.slice(7);
        try {
          filters[fieldName] = JSON.parse(value);
        } catch {
          filters[fieldName] = value;
        }
      }
    }

    const { data, filename } = await exportRecords(model, {
      search,
      sort,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    });

    if (format === 'csv') {
      // Simple CSV generation
      if (data.length === 0) {
        return new NextResponse('', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(','),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
              // Escape CSV values
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(',')
        ),
      ];

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // JSON format (default)
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'EXPORT_NOT_ALLOWED') {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
