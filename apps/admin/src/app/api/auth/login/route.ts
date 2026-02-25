import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email e senha sao obrigatorios' },
      { status: 400 }
    );
  }

  const token = await authenticateAdmin(email, password);

  if (!token) {
    return NextResponse.json(
      { error: 'Credenciais invalidas' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });

  return response;
}
