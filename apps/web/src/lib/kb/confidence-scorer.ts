// ═══════════════════════════════════════════════════════════════════
// AI Confidence Score System
// ═══════════════════════════════════════════════════════════════════
//
// Calcula um score de confiança (0-100%) após cada resposta da IA,
// baseado em 8 sinais ponderados. Determina a classificação:
//   - BASE LOCAL (≥80%)  — resposta fundamentada em KB local
//   - INFERIDO  (≥50%)   — resposta com inferência parcial
//   - GENÉRICO  (<50%)   — resposta genérica sem base local
//
// O score é calculado APÓS a resposta da IA (post-response),
// diferente do Relevance Score que é calculado antes (pre-response).
// ═══════════════════════════════════════════════════════════════════

import type { QueryExpansionResult } from './query-expansion';

// ─── Types ───────────────────────────────────────────────────────

export type ConfidenceClassification = 'BASE_LOCAL' | 'INFERIDO' | 'GENERICO';

export interface ConfidenceSignal {
  name: string;
  key: string;
  rawScore: number;       // 0.0 - 1.0
  weight: number;         // 0.0 - 1.0
  weightedScore: number;  // rawScore * weight
  description: string;
}

export interface ConfidenceResult {
  percentage: number;                        // 0-100
  normalized: number;                        // 0.0-1.0
  classification: ConfidenceClassification;
  label: string;                             // '[BASE LOCAL]', '[INFERIDO]', '[GENÉRICO]'
  signals: ConfidenceSignal[];
  adjustments: ConfidenceAdjustment[];
  preAdjustmentScore: number;
  weightPreset: string;
}

export interface ConfidenceAdjustment {
  name: string;
  delta: number;
  reason: string;
}

export interface ConfidenceWeights {
  kbRelevance: number;
  sourceCoverage: number;
  historicalSuccess: number;
  specificity: number;
  contextMatch: number;
  solutionNovelty: number;
  recency: number;
  providerReliability: number;
}

export interface ConfidenceConfig {
  weights: ConfidenceWeights;
  thresholds: {
    baseLocal: number;   // >= this = BASE_LOCAL
    inferido: number;    // >= this = INFERIDO, < = GENERICO
  };
  preset: string;
}

export interface ConfidenceInput {
  expansionResult: QueryExpansionResult;
  responseText: string;
  modelId?: string;
}

// ─── Weight Presets ─────────────────────────────────────────────

export const WEIGHT_PRESETS: Record<string, ConfidenceWeights> = {
  default: {
    kbRelevance: 0.25,
    sourceCoverage: 0.15,
    historicalSuccess: 0.15,
    specificity: 0.12,
    contextMatch: 0.10,
    solutionNovelty: 0.08,
    recency: 0.08,
    providerReliability: 0.07,
  },
  kb_heavy: {
    kbRelevance: 0.35,
    sourceCoverage: 0.20,
    historicalSuccess: 0.10,
    specificity: 0.10,
    contextMatch: 0.10,
    solutionNovelty: 0.05,
    recency: 0.05,
    providerReliability: 0.05,
  },
  ai_heavy: {
    kbRelevance: 0.15,
    sourceCoverage: 0.10,
    historicalSuccess: 0.10,
    specificity: 0.25,
    contextMatch: 0.15,
    solutionNovelty: 0.10,
    recency: 0.08,
    providerReliability: 0.07,
  },
};

export const DEFAULT_CONFIDENCE_CONFIG: ConfidenceConfig = {
  weights: WEIGHT_PRESETS.default,
  thresholds: {
    baseLocal: 0.80,
    inferido: 0.50,
  },
  preset: 'default',
};

// ─── Signal Calculators ─────────────────────────────────────────

/**
 * Signal 1: KB Relevance (peso padrão: 0.25)
 * Usa o melhor score de similaridade do pipeline de expansão.
 */
function calcKbRelevance(input: ConfidenceInput): number {
  return input.expansionResult.finalBestScore;
}

/**
 * Signal 2: Source Coverage (peso padrão: 0.15)
 * Conta quantos resultados KB têm similaridade >= 0.3.
 * 0 results → 0, 1 → 0.4, 2 → 0.7, 3+ → 1.0
 */
function calcSourceCoverage(input: ConfidenceInput): number {
  const qualifying = input.expansionResult.finalResults.filter(
    r => r.similarity >= 0.3
  ).length;

  if (qualifying === 0) return 0;
  if (qualifying === 1) return 0.4;
  if (qualifying === 2) return 0.7;
  return 1.0;
}

/**
 * Signal 3: Historical Success (peso padrão: 0.15)
 * Placeholder: retorna 0.5 neutro.
 * Futuro: consultar helpfulCount/notHelpfulCount dos KbArticles.
 */
function calcHistoricalSuccess(_input: ConfidenceInput): number {
  return 0.5;
}

/**
 * Signal 4: Specificity (peso padrão: 0.12)
 * Análise heurística do texto da resposta para estimar
 * quão específica e acionável a resposta é.
 */
function calcSpecificity(input: ConfidenceInput): number {
  const text = input.responseText;
  let score = 0;

  // Code blocks (```...```) indicate concrete solution
  if (/```[\s\S]*?```/.test(text)) score += 0.25;

  // Error codes / status codes (like cStat 100, HTTP 500, erro 302)
  if (/\b(cStat|HTTP|erro|error|status|código|code)\s*:?\s*\d+/i.test(text)) score += 0.15;

  // Numbered steps (1. 2. 3.) indicate structured solution
  if (/^\s*\d+\.\s/m.test(text)) score += 0.20;

  // Length > 200 chars suggests detailed response
  if (text.length > 200) score += 0.15;

  // Tool/software names (common in tech support)
  if (/\b(SEFAZ|certificado|XML|SOAP|REST|API|SQL|DNS|firewall|proxy|SAP)\b/i.test(text)) {
    score += 0.15;
  }

  // Direct actionable phrases
  if (/\b(execute|rode|acesse|navegue|clique|abra|configure|altere|verifique|instale)\b/i.test(text)) {
    score += 0.10;
  }

  return Math.min(score, 1.0);
}

/**
 * Signal 5: Context Match (peso padrão: 0.10)
 * Se existem resultados KB: 0.6 base + 0.4 se best score > 0.7.
 * Se não: 0.3 (sem contexto local).
 */
function calcContextMatch(input: ConfidenceInput): number {
  if (input.expansionResult.finalResults.length === 0) return 0.3;

  let score = 0.6;
  if (input.expansionResult.finalBestScore > 0.7) {
    score += 0.4;
  }
  return score;
}

/**
 * Signal 6: Solution Novelty (peso padrão: 0.08)
 * Placeholder: retorna 1.0 (assume solução nova).
 * Futuro: comparar com soluções previamente tentadas pelo usuário.
 */
function calcSolutionNovelty(_input: ConfidenceInput): number {
  return 1.0;
}

/**
 * Signal 7: Recency (peso padrão: 0.08)
 * Placeholder: retorna 0.5 neutro.
 * Futuro: verificar updatedAt dos artigos KB usados.
 */
function calcRecency(_input: ConfidenceInput): number {
  return 0.5;
}

/**
 * Signal 8: Provider Reliability (peso padrão: 0.07)
 * Baseline de 0.7 para todos os providers.
 * Futuro: consultar AiUsageDaily para taxa de sucesso.
 */
function calcProviderReliability(_input: ConfidenceInput): number {
  return 0.7;
}

// ─── Signal Definitions ─────────────────────────────────────────

const SIGNAL_DEFINITIONS: {
  key: keyof ConfidenceWeights;
  name: string;
  description: string;
  calc: (input: ConfidenceInput) => number;
}[] = [
  {
    key: 'kbRelevance',
    name: 'KB Relevance',
    description: 'Melhor score de similaridade da busca KB',
    calc: calcKbRelevance,
  },
  {
    key: 'sourceCoverage',
    name: 'Source Coverage',
    description: 'Quantidade de fontes KB com relevância aceitável',
    calc: calcSourceCoverage,
  },
  {
    key: 'historicalSuccess',
    name: 'Historical Success',
    description: 'Taxa de sucesso histórico dos artigos usados',
    calc: calcHistoricalSuccess,
  },
  {
    key: 'specificity',
    name: 'Specificity',
    description: 'Quão específica e acionável é a resposta',
    calc: calcSpecificity,
  },
  {
    key: 'contextMatch',
    name: 'Context Match',
    description: 'Correspondência entre query e contexto KB',
    calc: calcContextMatch,
  },
  {
    key: 'solutionNovelty',
    name: 'Solution Novelty',
    description: 'Solução não duplica tentativas anteriores',
    calc: calcSolutionNovelty,
  },
  {
    key: 'recency',
    name: 'Recency',
    description: 'Quão recentes são os artigos KB usados',
    calc: calcRecency,
  },
  {
    key: 'providerReliability',
    name: 'Provider Reliability',
    description: 'Confiabilidade histórica do provider de IA',
    calc: calcProviderReliability,
  },
];

// ─── Main Calculator ────────────────────────────────────────────

/**
 * Calcula o score de confiança da resposta da IA.
 *
 * @param input - Dados de entrada (resultado da expansão + texto da resposta)
 * @param configOverrides - Overrides parciais da configuração
 * @returns Resultado completo com score, classificação e breakdown dos sinais
 */
export function calculateConfidence(
  input: ConfidenceInput,
  configOverrides?: Partial<ConfidenceConfig>,
): ConfidenceResult {
  const config: ConfidenceConfig = {
    ...DEFAULT_CONFIDENCE_CONFIG,
    ...configOverrides,
    weights: {
      ...DEFAULT_CONFIDENCE_CONFIG.weights,
      ...configOverrides?.weights,
    },
    thresholds: {
      ...DEFAULT_CONFIDENCE_CONFIG.thresholds,
      ...configOverrides?.thresholds,
    },
  };

  // Calculate all 8 signals
  const signals: ConfidenceSignal[] = SIGNAL_DEFINITIONS.map(def => {
    const rawScore = Math.max(0, Math.min(1, def.calc(input)));
    const weight = config.weights[def.key];
    return {
      name: def.name,
      key: def.key,
      rawScore,
      weight,
      weightedScore: rawScore * weight,
      description: def.description,
    };
  });

  // Sum weighted scores
  const preAdjustmentScore = signals.reduce((sum, s) => sum + s.weightedScore, 0);

  // Apply adjustments
  const adjustments: ConfidenceAdjustment[] = [];
  let adjustedScore = preAdjustmentScore;

  // Adjustment 1: Expansion bonus — if expansion found better results (+5%)
  if (input.expansionResult.fallbackActivated && input.expansionResult.resolvedAtLayer > 0) {
    const bonus = 0.05;
    adjustments.push({
      name: 'Expansion Bonus',
      delta: bonus,
      reason: `Expansão (Layer ${input.expansionResult.resolvedAtLayer}) encontrou resultados melhores`,
    });
    adjustedScore += bonus;
  }

  // Adjustment 2: Short response cap — very short responses capped at 0.4
  if (input.responseText.length < 50) {
    const cap = 0.4;
    if (adjustedScore > cap) {
      adjustments.push({
        name: 'Short Response Cap',
        delta: cap - adjustedScore,
        reason: 'Resposta muito curta (<50 chars), confiança limitada',
      });
      adjustedScore = cap;
    }
  }

  // Adjustment 3: No KB results cap — no KB context caps at 0.5
  if (input.expansionResult.finalResults.length === 0) {
    const cap = 0.5;
    if (adjustedScore > cap) {
      adjustments.push({
        name: 'No KB Cap',
        delta: cap - adjustedScore,
        reason: 'Sem resultados KB, resposta puramente generativa',
      });
      adjustedScore = cap;
    }
  }

  // Clamp to [0, 1]
  const normalized = Math.max(0, Math.min(1, adjustedScore));
  const percentage = Math.round(normalized * 100);

  // Classify
  const classification = classify(normalized, config.thresholds);
  const label = classificationLabel(classification);

  return {
    percentage,
    normalized,
    classification,
    label,
    signals,
    adjustments,
    preAdjustmentScore,
    weightPreset: config.preset,
  };
}

// ─── Classification ─────────────────────────────────────────────

function classify(
  score: number,
  thresholds: ConfidenceConfig['thresholds'],
): ConfidenceClassification {
  if (score >= thresholds.baseLocal) return 'BASE_LOCAL';
  if (score >= thresholds.inferido) return 'INFERIDO';
  return 'GENERICO';
}

function classificationLabel(classification: ConfidenceClassification): string {
  switch (classification) {
    case 'BASE_LOCAL': return '[BASE LOCAL]';
    case 'INFERIDO': return '[INFERIDO]';
    case 'GENERICO': return '[GENÉRICO]';
  }
}

// ─── Metadata Builder ───────────────────────────────────────────

/** Metadados de confiança para salvar no message metadata */
export interface ConfidenceMetadata {
  percentage: number;
  classification: ConfidenceClassification;
  label: string;
  preAdjustmentScore: number;
  weightPreset: string;
  signals: Record<string, { raw: number; weighted: number }>;
  adjustments: { name: string; delta: number }[];
}

/**
 * Extrai metadados compactos do resultado de confiança para persistência.
 */
export function buildConfidenceMetadata(result: ConfidenceResult): ConfidenceMetadata {
  const signals: Record<string, { raw: number; weighted: number }> = {};
  for (const s of result.signals) {
    signals[s.key] = {
      raw: Math.round(s.rawScore * 1000) / 1000,
      weighted: Math.round(s.weightedScore * 1000) / 1000,
    };
  }

  return {
    percentage: result.percentage,
    classification: result.classification,
    label: result.label,
    preAdjustmentScore: Math.round(result.preAdjustmentScore * 1000) / 1000,
    weightPreset: result.weightPreset,
    signals,
    adjustments: result.adjustments.map(a => ({
      name: a.name,
      delta: Math.round(a.delta * 1000) / 1000,
    })),
  };
}
