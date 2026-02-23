import { extractText } from './text-extraction';
import { chunkText } from './chunking';
import { updateSolution } from './solutions-store';
import type { SolutionRecord } from './types';

export async function processSolution(
  solution: SolutionRecord,
  fileBuffer: Buffer
): Promise<void> {
  try {
    // Step 1: Extract text
    await updateSolution(solution.id, { status: 'extracting' });

    const text = await extractText(fileBuffer, solution.fileType);

    if (text.trim().length < 50) {
      throw new Error(
        'Conteudo extraido muito curto (menos de 50 caracteres). Verifique o arquivo.'
      );
    }

    // Step 2: Chunk
    await updateSolution(solution.id, { status: 'indexing' });

    const chunks = chunkText(text);

    if (chunks.length > 20) {
      console.warn(
        `Solution ${solution.id} generated ${chunks.length} chunks (documento extenso)`
      );
    }

    // Step 3: Done
    await updateSolution(solution.id, {
      status: 'indexed',
      totalChunks: chunks.length,
    });
  } catch (error) {
    console.error(`Error processing solution ${solution.id}:`, error);
    await updateSolution(solution.id, {
      status: 'error',
      errorMessage:
        error instanceof Error ? error.message : 'Erro desconhecido no processamento',
    });
  }
}
