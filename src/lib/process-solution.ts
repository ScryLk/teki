import { extractText } from './text-extraction';
import { chunkText } from './chunking';
import { getAdminClient, SOLUCOES_INDEX } from './algolia-admin';
import { updateSolution } from './solutions-store';
import type { AlgoliaSolutionRecord, SolutionRecord } from './types';

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

    // Step 3: Build Algolia records
    const records: AlgoliaSolutionRecord[] = chunks.map((chunk) => ({
      objectID: `${solution.id}_chunk_${chunk.index}`,
      solution_id: solution.id,
      title: solution.titulo,
      description: solution.descricao,
      category: solution.categoria,
      tags: solution.tags,
      related_systems: solution.sistemasRelacionados,
      criticality: solution.criticidade,
      content: chunk.content,
      chunk_index: chunk.index,
      total_chunks: chunks.length,
      author: solution.author,
      created_at: solution.createdAt,
      file_url: `/api/uploads/${solution.id}.${solution.fileType}`,
      file_type: solution.fileType,
      source_type: 'manual_upload',
    }));

    // Step 4: Index to Algolia
    await getAdminClient().saveObjects({
      indexName: SOLUCOES_INDEX,
      objects: records as unknown as Record<string, unknown>[],
    });

    // Step 5: Done
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
