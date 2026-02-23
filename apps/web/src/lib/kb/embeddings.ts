export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada para embeddings.');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Embedding error: ${(err as Record<string, Record<string, string>>)?.error?.message || response.status}`
    );
  }

  const data = await response.json();
  return data.embedding.values;
}

export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada.');

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: texts.map((text) => ({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        })),
      }),
    }
  );

  if (!response.ok)
    throw new Error(`Batch embedding error: ${response.status}`);

  const data = await response.json();
  return data.embeddings.map(
    (e: { values: number[] }) => e.values
  );
}
