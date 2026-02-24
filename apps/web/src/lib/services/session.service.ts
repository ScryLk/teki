import { prisma } from '../prisma';
import crypto from 'crypto';

// ═══════════════════════════════════════════════════════════════
// SessionService — Multi-device session management
// Creates, validates, revokes, and cleans up user sessions
// ═══════════════════════════════════════════════════════════════

const SESSION_EXPIRY_DAYS = 30;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export interface CreateSessionInput {
  userId: string;
  tenantId?: string;
  ipAddress: string;
  userAgent?: string;
  deviceType?: 'DESKTOP_APP' | 'WEB_BROWSER' | 'MOBILE_APP' | 'API_CLIENT';
  deviceName?: string;
  geoCountry?: string;
  geoRegion?: string;
  geoCity?: string;
}

export interface SessionTokens {
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
}

export async function createSession(input: CreateSessionInput): Promise<SessionTokens> {
  const sessionToken = generateToken();
  const refreshToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      userId: input.userId,
      tenantId: input.tenantId,
      tokenHash: hashToken(sessionToken),
      refreshTokenHash: hashToken(refreshToken),
      ipAddress: input.ipAddress,
      deviceType: input.deviceType ?? 'WEB_BROWSER',
      deviceName: input.deviceName,
      browser: input.userAgent?.slice(0, 50),
      geoCountry: input.geoCountry,
      geoRegion: input.geoRegion,
      geoCity: input.geoCity,
      expiresAt,
    },
  });

  return { sessionToken, refreshToken, expiresAt };
}

export async function validateSession(sessionToken: string) {
  const tokenHash = hashToken(sessionToken);

  const session = await prisma.userSession.findFirst({
    where: {
      tokenHash,
      isActive: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
      tenant: true,
    },
  });

  if (!session) return null;

  // Update last activity (fire-and-forget)
  prisma.userSession.update({
    where: { id: session.id },
    data: { lastActivityAt: new Date() },
  }).catch(() => {});

  return session;
}

export async function refreshSession(refreshToken: string): Promise<SessionTokens | null> {
  const refreshHash = hashToken(refreshToken);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshTokenHash: refreshHash,
      isActive: true,
    },
  });

  if (!session) return null;

  // Generate new tokens
  const newSessionToken = generateToken();
  const newRefreshToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(newSessionToken),
      refreshTokenHash: hashToken(newRefreshToken),
      expiresAt,
      lastActivityAt: new Date(),
    },
  });

  return { sessionToken: newSessionToken, refreshToken: newRefreshToken, expiresAt };
}

export async function revokeSession(
  sessionId: string,
  revokedBy: string,
  reason: 'USER_LOGOUT' | 'ADMIN_REVOKE' | 'PASSWORD_CHANGED' | 'SUSPICIOUS_ACTIVITY' | 'SESSION_LIMIT' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_ANONYMIZED'
) {
  await prisma.userSession.update({
    where: { id: sessionId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedBy: revokedBy,
      revokeReason: reason,
    },
  });
}

export async function revokeAllSessions(
  userId: string,
  revokedBy: string,
  reason: 'PASSWORD_CHANGED' | 'ADMIN_REVOKE' | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_ANONYMIZED',
  excludeSessionId?: string
) {
  await prisma.userSession.updateMany({
    where: {
      userId,
      isActive: true,
      ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
    },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedBy: revokedBy,
      revokeReason: reason,
    },
  });
}

export async function listActiveSessions(userId: string) {
  return prisma.userSession.findMany({
    where: { userId, isActive: true, expiresAt: { gt: new Date() } },
    select: {
      id: true,
      deviceType: true,
      deviceName: true,
      browser: true,
      os: true,
      geoCountry: true,
      geoCity: true,
      ipAddress: true,
      lastActivityAt: true,
      createdAt: true,
    },
    orderBy: { lastActivityAt: 'desc' },
  });
}

export async function cleanupExpiredSessions() {
  const result = await prisma.userSession.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: new Date() },
    },
    data: {
      isActive: false,
      revokeReason: 'SESSION_LIMIT',
    },
  });
  return result.count;
}
