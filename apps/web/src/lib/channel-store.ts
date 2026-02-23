import fs from 'fs/promises';
import path from 'path';

const OPENCLAW_DIR = path.join(process.cwd(), 'uploads', 'openclaw');
const CONVERSATIONS_DIR = path.join(OPENCLAW_DIR, 'conversations');
const CHANNEL_USERS_FILE = path.join(OPENCLAW_DIR, 'channel-users.json');
const VERIFICATIONS_FILE = path.join(OPENCLAW_DIR, 'verifications.json');

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ChannelUser {
  id: string;
  sender: string;         // e.g. "+5555999887766", "telegram:123456"
  senderName: string;
  channel: string;        // whatsapp | telegram | discord | slack | signal
  createdAt: string;
  linkedUserId?: string;  // future: link to a Teki account
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Verification {
  id: string;
  sender: string;
  senderName: string;
  channel: string;
  code: string;
  expiresAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureDirs() {
  await fs.mkdir(CONVERSATIONS_DIR, { recursive: true });
}

async function readJSON<T>(file: string, fallback: T): Promise<T> {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return fallback;
  }
}

async function writeJSON(file: string, data: unknown): Promise<void> {
  await ensureDirs();
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Write locks per file to avoid concurrent write corruption
const locks = new Map<string, Promise<void>>();
function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn).finally(() => {
    if (locks.get(key) === next) locks.delete(key);
  });
  locks.set(key, next as unknown as Promise<void>);
  return next;
}

// ── Channel Users ─────────────────────────────────────────────────────────────

export async function findOrCreateChannelUser(
  sender: string,
  senderName: string,
  channel: string
): Promise<ChannelUser> {
  return withLock('channel-users', async () => {
    await ensureDirs();
    const users = await readJSON<ChannelUser[]>(CHANNEL_USERS_FILE, []);
    const existing = users.find(
      (u) => u.sender === sender && u.channel === channel
    );
    if (existing) return existing;

    const newUser: ChannelUser = {
      id: `cu_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      sender,
      senderName: senderName || `Usuário ${channel}`,
      channel,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await writeJSON(CHANNEL_USERS_FILE, users);
    return newUser;
  });
}

export async function linkChannelUser(
  sender: string,
  channel: string,
  linkedUserId: string
): Promise<void> {
  return withLock('channel-users', async () => {
    const users = await readJSON<ChannelUser[]>(CHANNEL_USERS_FILE, []);
    const idx = users.findIndex(
      (u) => u.sender === sender && u.channel === channel
    );
    if (idx !== -1) {
      users[idx].linkedUserId = linkedUserId;
      await writeJSON(CHANNEL_USERS_FILE, users);
    }
  });
}

// ── Conversation History ──────────────────────────────────────────────────────

function conversationFile(sessionKey: string): string {
  // Sanitize sessionKey to be safe as filename
  const safe = sessionKey.replace(/[^a-zA-Z0-9_\-+.:]/g, '_').slice(0, 200);
  return path.join(CONVERSATIONS_DIR, `${safe}.json`);
}

export async function getHistory(
  sessionKey: string,
  limit = 10
): Promise<ConversationMessage[]> {
  const messages = await readJSON<ConversationMessage[]>(
    conversationFile(sessionKey),
    []
  );
  return messages.slice(-limit * 2); // limit pairs
}

export async function appendMessages(
  sessionKey: string,
  messages: ConversationMessage[]
): Promise<void> {
  const file = conversationFile(sessionKey);
  return withLock(sessionKey, async () => {
    await ensureDirs();
    const existing = await readJSON<ConversationMessage[]>(file, []);
    const updated = [...existing, ...messages].slice(-200); // keep last 200 messages max
    await writeJSON(file, updated);
  });
}

// ── Verifications (account linking codes) ────────────────────────────────────

export async function createVerification(
  sender: string,
  senderName: string,
  channel: string
): Promise<string> {
  return withLock('verifications', async () => {
    await ensureDirs();
    const verifications = await readJSON<Verification[]>(
      VERIFICATIONS_FILE,
      []
    );

    // Remove expired entries
    const now = new Date();
    const active = verifications.filter(
      (v) => new Date(v.expiresAt) > now
    );

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const newVerification: Verification = {
      id: `ver_${Date.now()}`,
      sender,
      senderName,
      channel,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    };

    active.push(newVerification);
    await writeJSON(VERIFICATIONS_FILE, active);
    return code;
  });
}

export async function findValidVerification(
  code: string,
  channel: string
): Promise<Verification | null> {
  const verifications = await readJSON<Verification[]>(
    VERIFICATIONS_FILE,
    []
  );
  const now = new Date();
  return (
    verifications.find(
      (v) =>
        v.code === code &&
        v.channel === channel &&
        new Date(v.expiresAt) > now
    ) ?? null
  );
}

export async function deleteVerification(id: string): Promise<void> {
  return withLock('verifications', async () => {
    const verifications = await readJSON<Verification[]>(
      VERIFICATIONS_FILE,
      []
    );
    const updated = verifications.filter((v) => v.id !== id);
    await writeJSON(VERIFICATIONS_FILE, updated);
  });
}
