import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthError } from '@/lib/auth-middleware';
import { deleteProviderKey } from '@/lib/provider-keys';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    const { user } = await requireAuth(req);
    const { provider } = await params;

    await deleteProviderKey(user.id, provider);

    return NextResponse.json({ success: true, message: `Chave ${provider} removida.` });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: error.message } }, { status: 401 });
    }
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
