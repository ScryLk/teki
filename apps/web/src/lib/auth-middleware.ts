import { NextRequest } from 'next/server';
import { auth } from './auth';
import { authenticateApiKey } from './api-keys';
import type { User } from '@prisma/client';

export interface AuthenticatedRequest {
  user: User;
  isTest: boolean;
  authMethod: 'session' | 'apikey';
}

export async function getAuthenticatedUser(
  req: NextRequest
): Promise<AuthenticatedRequest | null> {
  // 1. Try API key (Authorization: Bearer tk_live_...)
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer tk_')) {
    const key = authHeader.slice(7);
    const result = await authenticateApiKey(key);
    if (result) {
      return {
        user: result.user,
        isTest: result.isTest,
        authMethod: 'apikey',
      };
    }
    return null;
  }

  // 2. Try session cookie (NextAuth)
  const session = await auth();
  if (session?.user?.id) {
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (user) {
      return { user, isTest: false, authMethod: 'session' };
    }
  }

  return null;
}

export async function requireAuth(
  req: NextRequest
): Promise<AuthenticatedRequest> {
  const result = await getAuthenticatedUser(req);
  if (!result) {
    throw new AuthError(
      'Não autenticado. Envie um header Authorization: Bearer tk_live_...'
    );
  }
  return result;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
