import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD!;
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'teki-admin-secret-change-me'
);
const COOKIE_NAME = 'teki-admin-token';
const TOKEN_EXPIRY = '8h';

export interface AdminSession {
  email: string;
  iat: number;
  exp: number;
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<string | null> {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return null;
  }

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(
  request: NextRequest
): Promise<AdminSession | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME };
