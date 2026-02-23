import crypto from 'crypto';
import { prisma } from './prisma';

const API_KEY_PREFIX_LIVE = 'tk_live_';
const API_KEY_PREFIX_TEST = 'tk_test_';

export async function createApiKey(
  userId: string,
  name: string,
  type: 'LIVE' | 'TEST'
): Promise<{ key: string; id: string }> {
  const prefix = type === 'LIVE' ? API_KEY_PREFIX_LIVE : API_KEY_PREFIX_TEST;
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const key = `${prefix}${randomPart}`;
  const keyHash = hashKey(key);
  const keyPrefix = key.slice(0, 12);

  const count = await prisma.apiKey.count({
    where: { userId, isRevoked: false },
  });
  if (count >= 5) {
    throw new Error('Limite de 5 chaves ativas atingido.');
  }

  const record = await prisma.apiKey.create({
    data: { userId, keyHash, keyPrefix, name, type },
  });

  return { key, id: record.id };
}

export async function authenticateApiKey(key: string) {
  if (!key.startsWith('tk_live_') && !key.startsWith('tk_test_')) {
    return null;
  }

  const keyHash = hashKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKey || apiKey.isRevoked) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null;

  // Update lastUsedAt (fire-and-forget)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  return {
    user: apiKey.user,
    apiKey,
    isTest: apiKey.type === 'TEST',
  };
}

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}
