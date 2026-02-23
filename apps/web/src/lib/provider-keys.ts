import crypto from 'crypto';
import { prisma } from './prisma';

const ENCRYPTION_KEY = process.env.PROVIDER_KEY_ENCRYPTION_KEY!;

export async function saveProviderKey(
  userId: string,
  provider: string,
  plainKey: string
) {
  const { encrypted, iv } = encrypt(plainKey);

  await prisma.providerKey.upsert({
    where: { userId_provider: { userId, provider } },
    update: {
      encryptedKey: encrypted,
      iv,
      status: 'valid',
      lastValidatedAt: new Date(),
    },
    create: {
      userId,
      provider,
      encryptedKey: encrypted,
      iv,
      status: 'valid',
      lastValidatedAt: new Date(),
    },
  });
}

export async function getProviderKey(
  userId: string,
  provider: string
): Promise<string | null> {
  const record = await prisma.providerKey.findUnique({
    where: { userId_provider: { userId, provider } },
  });

  if (!record || record.status !== 'valid') return null;
  return decrypt(record.encryptedKey, record.iv);
}

export async function getUserProviderKeys(
  userId: string
): Promise<Record<string, string>> {
  const keys = await prisma.providerKey.findMany({
    where: { userId, status: 'valid' },
  });

  const result: Record<string, string> = {};
  for (const k of keys) {
    result[k.provider] = decrypt(k.encryptedKey, k.iv);
  }
  return result;
}

export async function deleteProviderKey(
  userId: string,
  provider: string
): Promise<void> {
  await prisma.providerKey.deleteMany({
    where: { userId, provider },
  });
}

function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted: encrypted + ':' + authTag, iv: iv.toString('hex') };
}

function decrypt(encrypted: string, ivHex: string): string {
  const [encText, authTag] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
