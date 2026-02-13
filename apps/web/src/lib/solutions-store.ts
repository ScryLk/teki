import fs from 'fs/promises';
import path from 'path';
import type { SolutionRecord } from './types';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'solucoes');
const METADATA_FILE = path.join(UPLOADS_DIR, 'metadata.json');

let writeLock: Promise<void> = Promise.resolve();

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}

async function readMetadata(): Promise<SolutionRecord[]> {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeMetadata(records: SolutionRecord[]): Promise<void> {
  await ensureUploadsDir();
  await fs.writeFile(METADATA_FILE, JSON.stringify(records, null, 2));
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeLock.then(fn);
  writeLock = result.then(
    () => {},
    () => {}
  );
  return result;
}

export async function readAllSolutions(): Promise<SolutionRecord[]> {
  return readMetadata();
}

export async function readSolution(id: string): Promise<SolutionRecord | null> {
  const records = await readMetadata();
  return records.find((r) => r.id === id) ?? null;
}

export async function writeSolution(solution: SolutionRecord): Promise<void> {
  return withLock(async () => {
    const records = await readMetadata();
    records.push(solution);
    await writeMetadata(records);
  });
}

export async function updateSolution(
  id: string,
  updates: Partial<SolutionRecord>
): Promise<void> {
  return withLock(async () => {
    const records = await readMetadata();
    const index = records.findIndex((r) => r.id === id);
    if (index !== -1) {
      records[index] = { ...records[index], ...updates };
      await writeMetadata(records);
    }
  });
}

export async function deleteSolutionRecord(id: string): Promise<SolutionRecord | null> {
  return withLock(async () => {
    const records = await readMetadata();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) return null;
    const [removed] = records.splice(index, 1);
    await writeMetadata(records);
    return removed;
  });
}
