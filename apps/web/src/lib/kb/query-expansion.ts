// ═══════════════════════════════════════════════════════════════════
// Query Expansion Fallback — Busca Inteligente Progressiva
// ═══════════════════════════════════════════════════════════════════
//
// Pipeline de busca progressiva que ativa camadas de expansão de query
// apenas quando a busca primária falha. ~75% das buscas resolvem
// no Layer 0 (custo zero). Cada layer adicional gasta tokens proporcionais
// à dificuldade da query.
//
// Layers:
//   0 — Busca Primária (sempre roda, custo zero)
//   1 — Expansão Semântica PT (reformulações em português)
//   2 — Tradução Técnica PT→EN (termos técnicos em inglês)
//   3 — Decomposição de Conceito (sub-problemas independentes)
// ═══════════════════════════════════════════════════════════════════

import { searchKnowledgeBase, formatKBContext } from './search';
import { getProvider } from '@/lib/ai/router';
import type { ProviderResponse } from '@/lib/ai/types';
import { getRelevantTerms, getLanguageInfo, FALLBACK_LANGUAGES } from './term-maps';

// ─── Types ───────────────────────────────────────────────────────

/** Resultado individual de um artigo KB encontrado */
export interface KBSearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  filename: string;
  matchSource: 'primary' | 'expansion_pt' | 'translation_en' | 'decomposition';
  matchedQuery: string;
}

/** Resultado de uma layer individual de expansão */
export interface ExpansionLayerResult {
  layer: 0 | 1 | 2 | 3;
  layerName: string;
  queriesUsed: string[];
  results: KBSearchResult[];
  bestScore: number;
  tokensUsed: number;
  latencyMs: number;
  accepted: boolean;
}

/** Resultado final do pipeline completo */
export interface QueryExpansionResult {
  originalQuery: string;
  finalResults: KBSearchResult[];
  finalBestScore: number;
  layers: ExpansionLayerResult[];
  resolvedAtLayer: number; // 0-3 = qual layer resolveu, -1 = nenhuma
  fallbackActivated: boolean;
  totalTokensUsed: number;
  totalLatencyMs: number;
  budgetRemaining: number;
}

/** Configuração de idioma de fallback */
export interface FallbackLanguageConfig {
  code: string;
  enabled: boolean;
}

/** Configuração do pipeline */
export interface QueryExpansionConfig {
  enabled: boolean;
  primaryThreshold: number;
  fallbackThreshold: number;
  lastResortThreshold: number;
  maxLayers: 1 | 2 | 3;
  maxVariationsPerLayer: number;
  maxTotalTokens: number;
  maxTotalLatencyMs: number;
  expansionModelId: string;
  primaryLanguage: string;
  fallbackLanguages: string[];
  fallbackLanguageConfigs: FallbackLanguageConfig[];
  logExpansions: boolean;
}

/** Parâmetros de busca */
export interface ExpansionSearchParams {
  agentId: string;
  query: string;
  topK?: number;
  minSimilarity?: number;
  errorCode?: string;
  software?: string;
  category?: string;
  extraContext?: Record<string, unknown>;
}

/** Metadados de expansão para salvar no message_ai_metadata */
export interface ExpansionMetadata {
  activated: boolean;
  resolvedAtLayer: number;
  layersExecuted: number;
  expansionTokens: number;
  expansionLatencyMs: number;
  queriesGenerated: string[];
  improvement: {
    l0BestScore: number;
    finalBestScore: number;
    scoreDelta: number;
  };
}

// ─── Default Config ──────────────────────────────────────────────

export const DEFAULT_EXPANSION_CONFIG: QueryExpansionConfig = {
  enabled: true,
  primaryThreshold: 0.5,
  fallbackThreshold: 0.5,
  lastResortThreshold: 0.4,
  maxLayers: 3,
  maxVariationsPerLayer: 5,
  maxTotalTokens: 800,
  maxTotalLatencyMs: 5000,
  expansionModelId: 'gemini-flash',
  primaryLanguage: 'pt',
  fallbackLanguages: ['en'],
  fallbackLanguageConfigs: [{ code: 'en', enabled: true }],
  logExpansions: true,
};

/** Config override para screen inspection (latência crítica) */
export const SCREEN_INSPECTION_EXPANSION_CONFIG: Partial<QueryExpansionConfig> = {
  maxLayers: 1,
  maxTotalLatencyMs: 800,
  maxVariationsPerLayer: 3,
};

// ─── Prompt Builders ─────────────────────────────────────────────

function buildLayer1Prompt(params: ExpansionSearchParams, maxVariations: number): string {
  const parts = [
    `Gere ${maxVariations} reformulações de busca em PORTUGUÊS para o problema técnico abaixo.`,
    ``,
    `PROBLEMA: "${params.query}"`,
  ];

  if (params.errorCode) parts.push(`CÓDIGO DE ERRO: ${params.errorCode}`);
  if (params.software) parts.push(`SOFTWARE: ${params.software}`);
  if (params.category) parts.push(`CATEGORIA: ${params.category}`);

  parts.push(``);
  parts.push(`REGRAS:`);
  parts.push(`- Use sinônimos e termos técnicos alternativos`);
  parts.push(`- Inclua variações com siglas expandidas e vice-versa (NFe ↔ Nota Fiscal Eletrônica)`);
  parts.push(`- Se houver código de erro, varie: "rejeição X", "cStat X", "código X", "status X", "erro X"`);
  parts.push(`- Inclua a mensagem provável por trás do código se você souber`);
  parts.push(`- Cada variação deve ter 3-8 palavras`);
  parts.push(`- NÃO repita a query original`);
  parts.push(`- NÃO numere as linhas`);
  parts.push(``);
  parts.push(`Responda APENAS com as variações, uma por linha:`);

  return parts.join('\n');
}

function buildLayer2Prompt(
  params: ExpansionSearchParams,
  maxVariations: number,
  languageCode: string = 'en',
): string {
  const langInfo = getLanguageInfo(languageCode);
  const languageName = langInfo?.nativeName ?? 'English';

  const parts = [
    `Translate this Brazilian technical support query into ${maxVariations} ${languageName} search queries.`,
    ``,
    `ORIGINAL (Portuguese): "${params.query}"`,
  ];

  if (params.errorCode) parts.push(`ERROR CODE: ${params.errorCode}`);
  if (params.software) parts.push(`SOFTWARE: ${params.software}`);

  // Use term maps for the target language
  const relevantTerms = getRelevantTerms(params.query, languageCode);
  if (relevantTerms) {
    parts.push(``);
    parts.push(`TRANSLATION MAP for Brazilian terms → ${languageName}:`);
    parts.push(relevantTerms);
  }

  parts.push(``);
  parts.push(`RULES:`);
  parts.push(`- Keep error codes and numbers unchanged`);
  parts.push(`- 3-8 words per query`);
  parts.push(`- Use terms found in technical documentation`);
  parts.push(`- Do NOT number the lines`);
  parts.push(``);
  parts.push(`Return ONLY the queries, one per line:`);

  return parts.join('\n');
}

function buildLayer3Prompt(params: ExpansionSearchParams, maxVariations: number): string {
  const parts = [
    `Você é um analista de suporte. O problema abaixo não foi encontrado na base de conhecimento com buscas diretas nem traduzidas. Decomponha-o em sub-problemas independentes.`,
    ``,
    `PROBLEMA: "${params.query}"`,
  ];

  if (params.errorCode) parts.push(`CÓDIGO: ${params.errorCode}`);
  if (params.software) parts.push(`SOFTWARE: ${params.software}`);

  parts.push(``);
  parts.push(`Gere ${maxVariations} sub-queries, cada uma atacando um ÂNGULO DIFERENTE:`);
  parts.push(``);
  parts.push(`ÂNGULOS OBRIGATÓRIOS (escolha os mais relevantes):`);
  parts.push(`REDE/CONECTIVIDADE — timeout, porta, DNS, firewall, proxy`);
  parts.push(`AUTENTICAÇÃO — certificado, token, credencial, expirado, revogado`);
  parts.push(`CONFIGURAÇÃO — parâmetro, versão, ambiente, variável, path`);
  parts.push(`FORMATO/DADOS — XML, JSON, encoding, campo obrigatório, validação`);
  parts.push(`INFRAESTRUTURA — disco, memória, serviço parado, permissão, log`);
  parts.push(``);
  parts.push(`REGRAS:`);
  parts.push(`- Cada sub-query deve ter 3-6 palavras`);
  parts.push(`- Misture português e inglês quando fizer sentido`);
  parts.push(`- Foque em termos que apareceriam em artigos técnicos`);
  parts.push(`- NÃO numere`);
  parts.push(``);
  parts.push(`Responda APENAS com as queries, uma por linha:`);

  return parts.join('\n');
}

// ─── Helpers ─────────────────────────────────────────────────────

/** Parseia a resposta da IA em lista de queries limpas */
function parseQueryList(content: string, maxVariations: number): string[] {
  return content
    .split('\n')
    .map(line => line.replace(/^[\d\-.\)*•]+\s*/, '').trim())
    .filter(line => line.length >= 4 && line.length <= 150)
    .slice(0, maxVariations);
}

/** Converte resultado do searchKnowledgeBase para KBSearchResult */
function toKBSearchResult(
  raw: { chunkId: string; documentId: string; content: string; similarity: number; filename: string },
  matchSource: KBSearchResult['matchSource'],
  matchedQuery: string,
): KBSearchResult {
  return {
    chunkId: raw.chunkId,
    documentId: raw.documentId,
    content: raw.content,
    similarity: raw.similarity,
    filename: raw.filename,
    matchSource,
    matchedQuery,
  };
}

// ─── Main Service ────────────────────────────────────────────────

/**
 * Busca progressiva com expansão de query.
 *
 * Substitui chamadas diretas a `searchKnowledgeBase()`. Executa a busca
 * primária e, se o score for baixo, ativa camadas progressivas de
 * reformulação usando um modelo leve.
 */
export async function searchWithExpansion(
  params: ExpansionSearchParams,
  configOverrides?: Partial<QueryExpansionConfig>,
): Promise<QueryExpansionResult> {
  const config: QueryExpansionConfig = { ...DEFAULT_EXPANSION_CONFIG, ...configOverrides };

  const pipelineStart = Date.now();
  const layers: ExpansionLayerResult[] = [];
  let totalTokens = 0;
  const allResults = new Map<string, KBSearchResult>();
  const allGeneratedQueries: string[] = [];

  const topK = params.topK ?? 5;
  const minSimilarity = params.minSimilarity ?? 0.3; // Lower than default to catch partial matches

  // ── LAYER 0 — Busca Primária (sempre roda, custo zero) ──

  const l0 = await executeLayer0(params, topK, minSimilarity);
  layers.push(l0);
  mergeResults(allResults, l0.results);

  if (l0.bestScore >= config.primaryThreshold) {
    return finalize(params.query, allResults, layers, totalTokens, pipelineStart, 0, config, allGeneratedQueries);
  }

  // Expansão desabilitada — retorna o que tem
  if (!config.enabled) {
    return finalize(params.query, allResults, layers, totalTokens, pipelineStart, -1, config, allGeneratedQueries);
  }

  if (config.logExpansions) {
    console.log('[kb.expansion.activated]', {
      agentId: params.agentId,
      query: params.query,
      l0BestScore: l0.bestScore,
      threshold: config.primaryThreshold,
    });
  }

  // ── LAYER 1 — Expansão Semântica (PT) ──

  if (config.maxLayers >= 1 && withinBudget(totalTokens, pipelineStart, config)) {
    const l1 = await executeLayer1(params, config, topK, minSimilarity);
    layers.push(l1);
    totalTokens += l1.tokensUsed;
    allGeneratedQueries.push(...l1.queriesUsed.slice(0, -1)); // Exclude the original
    mergeResults(allResults, l1.results);

    if (l1.bestScore >= config.fallbackThreshold) {
      return finalize(params.query, allResults, layers, totalTokens, pipelineStart, 1, config, allGeneratedQueries);
    }
  }

  // ── LAYER 2 — Tradução Técnica (EN) ──

  if (config.maxLayers >= 2 && withinBudget(totalTokens, pipelineStart, config)) {
    const l2 = await executeLayer2(params, config, topK, minSimilarity);
    layers.push(l2);
    totalTokens += l2.tokensUsed;
    allGeneratedQueries.push(...l2.queriesUsed);
    mergeResults(allResults, l2.results);

    if (l2.bestScore >= config.fallbackThreshold) {
      return finalize(params.query, allResults, layers, totalTokens, pipelineStart, 2, config, allGeneratedQueries);
    }
  }

  // ── LAYER 3 — Decomposição de Conceito ──

  if (config.maxLayers >= 3 && withinBudget(totalTokens, pipelineStart, config)) {
    const l3 = await executeLayer3(params, config, topK, minSimilarity);
    layers.push(l3);
    totalTokens += l3.tokensUsed;
    allGeneratedQueries.push(...l3.queriesUsed);
    mergeResults(allResults, l3.results);

    if (l3.bestScore >= config.lastResortThreshold) {
      return finalize(params.query, allResults, layers, totalTokens, pipelineStart, 3, config, allGeneratedQueries);
    }
  }

  // ── NENHUMA LAYER RESOLVEU ──

  if (config.logExpansions) {
    console.warn('[kb.expansion.exhausted]', {
      agentId: params.agentId,
      query: params.query,
      layersTried: layers.length,
      bestScoreOverall: getBestScore(allResults),
      totalTokens,
    });
  }

  return finalize(params.query, allResults, layers, totalTokens, pipelineStart, -1, config, allGeneratedQueries);
}

// ─── Layer Implementations ───────────────────────────────────────

async function executeLayer0(
  params: ExpansionSearchParams,
  topK: number,
  minSimilarity: number,
): Promise<ExpansionLayerResult> {
  const start = Date.now();

  const rawResults = await searchKnowledgeBase(
    params.agentId,
    params.query,
    topK,
    minSimilarity,
  );

  const results = rawResults.map(r => toKBSearchResult(r, 'primary', params.query));

  return {
    layer: 0,
    layerName: 'Busca Primária (PT)',
    queriesUsed: [params.query],
    results,
    bestScore: results[0]?.similarity ?? 0,
    tokensUsed: 0,
    latencyMs: Date.now() - start,
    accepted: false,
  };
}

async function executeLayer1(
  params: ExpansionSearchParams,
  config: QueryExpansionConfig,
  topK: number,
  minSimilarity: number,
): Promise<ExpansionLayerResult> {
  const start = Date.now();

  const prompt = buildLayer1Prompt(params, config.maxVariationsPerLayer);
  const aiResponse = await callExpansionAI(config, prompt);

  const variations = parseQueryList(aiResponse.content, config.maxVariationsPerLayer);
  const tokensUsed = (aiResponse.usage?.inputTokens ?? 0) + (aiResponse.usage?.outputTokens ?? 0);

  const results = await searchMultipleQueries(
    params.agentId,
    variations,
    'expansion_pt',
    topK,
    minSimilarity,
  );

  if (config.logExpansions) {
    console.log('[kb.expansion.layer1]', {
      agentId: params.agentId,
      variations,
      resultsCount: results.length,
      bestScore: results[0]?.similarity ?? 0,
      tokensUsed,
    });
  }

  return {
    layer: 1,
    layerName: 'Expansão Semântica (PT)',
    queriesUsed: variations,
    results,
    bestScore: results[0]?.similarity ?? 0,
    tokensUsed,
    latencyMs: Date.now() - start,
    accepted: false,
  };
}

async function executeLayer2(
  params: ExpansionSearchParams,
  config: QueryExpansionConfig,
  topK: number,
  minSimilarity: number,
): Promise<ExpansionLayerResult> {
  const start = Date.now();

  // Determine enabled languages from config
  const enabledLanguages = config.fallbackLanguageConfigs
    .filter(l => l.enabled)
    .map(l => l.code);

  // Fallback to legacy fallbackLanguages array if no configs
  const languages = enabledLanguages.length > 0
    ? enabledLanguages
    : config.fallbackLanguages;

  let totalTokensUsed = 0;
  const allTranslations: string[] = [];

  // Execute translation for each enabled language
  for (const langCode of languages) {
    const variationsPerLang = Math.max(2, Math.floor(config.maxVariationsPerLayer / languages.length));
    const prompt = buildLayer2Prompt(params, variationsPerLang, langCode);
    const aiResponse = await callExpansionAI(config, prompt);

    const translations = parseQueryList(aiResponse.content, variationsPerLang);
    totalTokensUsed += (aiResponse.usage?.inputTokens ?? 0) + (aiResponse.usage?.outputTokens ?? 0);
    allTranslations.push(...translations);
  }

  const results = await searchMultipleQueries(
    params.agentId,
    allTranslations,
    'translation_en',
    topK,
    minSimilarity,
  );

  const langNames = languages.map(c => getLanguageInfo(c)?.nativeName ?? c).join(', ');

  if (config.logExpansions) {
    console.log('[kb.expansion.layer2]', {
      agentId: params.agentId,
      languages,
      translations: allTranslations,
      resultsCount: results.length,
      bestScore: results[0]?.similarity ?? 0,
      tokensUsed: totalTokensUsed,
    });
  }

  return {
    layer: 2,
    layerName: `Tradução Técnica (${langNames})`,
    queriesUsed: allTranslations,
    results,
    bestScore: results[0]?.similarity ?? 0,
    tokensUsed: totalTokensUsed,
    latencyMs: Date.now() - start,
    accepted: false,
  };
}

async function executeLayer3(
  params: ExpansionSearchParams,
  config: QueryExpansionConfig,
  topK: number,
  minSimilarity: number,
): Promise<ExpansionLayerResult> {
  const start = Date.now();

  const prompt = buildLayer3Prompt(params, config.maxVariationsPerLayer);
  const aiResponse = await callExpansionAI(config, prompt);

  const subQueries = parseQueryList(aiResponse.content, config.maxVariationsPerLayer);
  const tokensUsed = (aiResponse.usage?.inputTokens ?? 0) + (aiResponse.usage?.outputTokens ?? 0);

  // Layer 3 uses lower similarity threshold — partial matches are acceptable
  const results = await searchMultipleQueries(
    params.agentId,
    subQueries,
    'decomposition',
    topK,
    Math.min(minSimilarity, 0.25),
  );

  if (config.logExpansions) {
    console.log('[kb.expansion.layer3]', {
      agentId: params.agentId,
      subQueries,
      resultsCount: results.length,
      bestScore: results[0]?.similarity ?? 0,
      tokensUsed,
    });
  }

  return {
    layer: 3,
    layerName: 'Decomposição de Conceito',
    queriesUsed: subQueries,
    results,
    bestScore: results[0]?.similarity ?? 0,
    tokensUsed,
    latencyMs: Date.now() - start,
    accepted: false,
  };
}

// ─── AI Call ─────────────────────────────────────────────────────

async function callExpansionAI(config: QueryExpansionConfig, userPrompt: string): Promise<ProviderResponse> {
  const { provider, apiModelId } = getProvider(config.expansionModelId);
  return provider.chat({
    model: apiModelId,
    systemPrompt: 'Você é um assistente que reformula queries de busca. Responda apenas com as queries, uma por linha.',
    messages: [{ role: 'user', content: userPrompt }],
    temperature: 0.7,
    maxTokens: 250,
    stream: false,
  });
}

// ─── Multi-Query Search ──────────────────────────────────────────

async function searchMultipleQueries(
  agentId: string,
  queries: string[],
  matchSource: KBSearchResult['matchSource'],
  topK: number,
  minSimilarity: number,
): Promise<KBSearchResult[]> {
  const promises = queries.map(q =>
    searchKnowledgeBase(agentId, q, topK, minSimilarity)
      .then(results => results.map(r => toKBSearchResult(r, matchSource, q)))
      .catch(() => [] as KBSearchResult[])
  );

  const allResultArrays = await Promise.all(promises);

  // Deduplica: se mesmo chunk aparece em múltiplas queries, pega o maior score
  const deduped = new Map<string, KBSearchResult>();
  for (const results of allResultArrays) {
    for (const r of results) {
      const existing = deduped.get(r.chunkId);
      if (!existing || r.similarity > existing.similarity) {
        deduped.set(r.chunkId, r);
      }
    }
  }

  return Array.from(deduped.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// ─── Pipeline Helpers ────────────────────────────────────────────

function mergeResults(global: Map<string, KBSearchResult>, layerResults: KBSearchResult[]): void {
  for (const r of layerResults) {
    const existing = global.get(r.chunkId);
    if (!existing || r.similarity > existing.similarity) {
      global.set(r.chunkId, r);
    }
  }
}

function withinBudget(currentTokens: number, pipelineStart: number, config: QueryExpansionConfig): boolean {
  return currentTokens < config.maxTotalTokens && (Date.now() - pipelineStart) < config.maxTotalLatencyMs;
}

function getBestScore(results: Map<string, KBSearchResult>): number {
  let best = 0;
  for (const r of results.values()) {
    if (r.similarity > best) best = r.similarity;
  }
  return best;
}

function finalize(
  originalQuery: string,
  allResults: Map<string, KBSearchResult>,
  layers: ExpansionLayerResult[],
  totalTokens: number,
  pipelineStart: number,
  resolvedAtLayer: number,
  config: QueryExpansionConfig,
  allGeneratedQueries: string[],
): QueryExpansionResult {
  // Marcar a layer que resolveu
  if (resolvedAtLayer >= 0 && resolvedAtLayer < layers.length) {
    layers[resolvedAtLayer].accepted = true;
  }

  const finalResults = Array.from(allResults.values())
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  return {
    originalQuery,
    finalResults,
    finalBestScore: finalResults[0]?.similarity ?? 0,
    layers,
    resolvedAtLayer,
    fallbackActivated: resolvedAtLayer > 0 || resolvedAtLayer === -1,
    totalTokensUsed: totalTokens,
    totalLatencyMs: Date.now() - pipelineStart,
    budgetRemaining: config.maxTotalTokens - totalTokens,
  };
}

// ─── Context Formatting ─────────────────────────────────────────

/**
 * Formata resultados da expansão para injetar no system prompt da IA.
 * Drop-in replacement para `formatKBContext()` original.
 */
export function formatExpansionContext(result: QueryExpansionResult): string {
  if (result.finalResults.length === 0) return '';

  const header = '--- BASE DE CONHECIMENTO ---';
  const chunks = result.finalResults
    .map(
      (r, i) =>
        `[Fonte ${i + 1}: ${r.filename} (relevância: ${(r.similarity * 100).toFixed(0)}%)]\n${r.content}`
    )
    .join('\n\n');
  const footer = '--- FIM DA BASE DE CONHECIMENTO ---';

  let note = '';
  if (result.resolvedAtLayer === -1) {
    note = '\n[AVISO: Nenhum artigo KB com alta relevância foi encontrado. Os resultados abaixo são parcialmente relacionados.]\n';
  } else if (result.resolvedAtLayer > 0) {
    note = `\n[NOTA: Artigos encontrados via expansão de busca (layer ${result.resolvedAtLayer}). Relevância pode ser menor que o usual.]\n`;
  }

  return `${header}${note}\n${chunks}\n\n${footer}`;
}

/**
 * Extrai metadados de expansão para salvar no message_ai_metadata.
 */
export function buildExpansionMetadata(result: QueryExpansionResult): ExpansionMetadata {
  const l0Score = result.layers[0]?.bestScore ?? 0;
  const allQueries = result.layers
    .filter(l => l.layer > 0)
    .flatMap(l => l.queriesUsed);

  return {
    activated: result.fallbackActivated,
    resolvedAtLayer: result.resolvedAtLayer,
    layersExecuted: result.layers.length,
    expansionTokens: result.totalTokensUsed,
    expansionLatencyMs: result.totalLatencyMs,
    queriesGenerated: allQueries,
    improvement: {
      l0BestScore: l0Score,
      finalBestScore: result.finalBestScore,
      scoreDelta: result.finalBestScore - l0Score,
    },
  };
}
