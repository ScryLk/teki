import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

const BUCKET = 'documents';

export async function uploadFile(
  userId: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const path = `${userId}/${filename}`;

  const { error } = await getSupabase().storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload error: ${error.message}`);

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(
  userId: string,
  filename: string
): Promise<void> {
  await getSupabase().storage.from(BUCKET).remove([`${userId}/${filename}`]);
}
