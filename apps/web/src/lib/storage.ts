import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = 'documents';

export async function uploadFile(
  userId: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const path = `${userId}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });

  if (error) throw new Error(`Upload error: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(
  userId: string,
  filename: string
): Promise<void> {
  await supabase.storage.from(BUCKET).remove([`${userId}/${filename}`]);
}
