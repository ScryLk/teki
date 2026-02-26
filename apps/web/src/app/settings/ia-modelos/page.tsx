'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FALLBACK_LANGUAGES } from '@/lib/kb/term-maps';
import { WEIGHT_PRESETS } from '@/lib/kb/confidence-scorer';
import type { FallbackLanguageConfig } from '@/lib/kb/query-expansion';
import type { ConfidenceWeights } from '@/lib/kb/confidence-scorer';

// ─── Types ───────────────────────────────────────────────────────

interface QueryExpansionSettings {
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
  fallbackLanguageConfigs: FallbackLanguageConfig[];
  logExpansions: boolean;
}

interface ConfidenceSettings {
  weights: ConfidenceWeights;
  thresholds: {
    baseLocal: number;
    inferido: number;
  };
  preset: string;
}

interface AiSettings {
  query_expansion: QueryExpansionSettings;
  confidence: ConfidenceSettings;
}

const DEPTH_OPTIONS: { value: 1 | 2 | 3; label: string; desc: string }[] = [
  { value: 1, label: 'Rápida', desc: 'Só reformulação PT' },
  { value: 2, label: 'Balanceada', desc: 'PT + tradução multilíngue' },
  { value: 3, label: 'Profunda', desc: 'PT + tradução + decomposição' },
];

const MODEL_OPTIONS = [
  { value: 'gemini-flash', label: 'Gemini Flash (rápido)' },
  { value: 'gemini-pro', label: 'Gemini Pro' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'claude-haiku', label: 'Claude Haiku' },
];

const WEIGHT_KEYS: (keyof ConfidenceWeights)[] = [
  'kbRelevance',
  'sourceCoverage',
  'historicalSuccess',
  'specificity',
  'contextMatch',
  'solutionNovelty',
  'recency',
  'providerReliability',
];

const WEIGHT_LABELS: Record<keyof ConfidenceWeights, string> = {
  kbRelevance: 'KB Relevance',
  sourceCoverage: 'Source Coverage',
  historicalSuccess: 'Historical Success',
  specificity: 'Specificity',
  contextMatch: 'Context Match',
  solutionNovelty: 'Solution Novelty',
  recency: 'Recency',
  providerReliability: 'Provider Reliability',
};

// ─── Page Component ─────────────────────────────────────────────

export default function IAModelosSettingsPage() {
  const [settings, setSettings] = useState<AiSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // Load settings
  useEffect(() => {
    fetch('/api/v1/settings/ai')
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  // Save settings
  const save = useCallback(async (updated: AiSettings) => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/v1/settings/ai', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, []);

  // Update expansion settings
  const updateExpansion = useCallback(
    (patch: Partial<QueryExpansionSettings>) => {
      if (!settings) return;
      const updated = {
        ...settings,
        query_expansion: { ...settings.query_expansion, ...patch },
      };
      setSettings(updated);
      save(updated);
    },
    [settings, save]
  );

  // Update confidence settings
  const updateConfidence = useCallback(
    (patch: Partial<ConfidenceSettings>) => {
      if (!settings) return;
      const updated = {
        ...settings,
        confidence: {
          ...settings.confidence,
          ...patch,
          weights: {
            ...settings.confidence.weights,
            ...(patch.weights ?? {}),
          },
          thresholds: {
            ...settings.confidence.thresholds,
            ...(patch.thresholds ?? {}),
          },
        },
      };
      setSettings(updated);
      save(updated);
    },
    [settings, save]
  );

  if (!settings) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">IA & Modelos</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  const weightsSum = WEIGHT_KEYS.reduce(
    (sum, k) => sum + settings.confidence.weights[k],
    0
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">IA & Modelos</h1>
          <p className="text-sm text-muted-foreground">
            Configure a busca inteligente e o cálculo de confiança
          </p>
        </div>
        {saveStatus === 'saved' && (
          <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">
            Salvo
          </Badge>
        )}
        {saveStatus === 'error' && (
          <Badge variant="outline" className="text-red-400 border-red-400/30">
            Erro ao salvar
          </Badge>
        )}
      </div>

      {/* ── Section 1: Busca Inteligente ── */}
      <Card>
        <CardHeader>
          <CardTitle>Busca Inteligente</CardTitle>
          <CardDescription>
            Pipeline de expansão progressiva de query para a base de conhecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Enable/Disable */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.query_expansion.enabled}
              onChange={(e) => updateExpansion({ enabled: e.target.checked })}
              className="accent-emerald-500 w-4 h-4"
            />
            <div>
              <span className="text-sm font-medium">Habilitar Busca Inteligente</span>
              <p className="text-xs text-muted-foreground">
                Quando desabilitada, apenas a busca primária (Layer 0) será usada
              </p>
            </div>
          </label>

          {/* Depth */}
          <div>
            <label className="text-sm font-medium mb-2 block">Profundidade</label>
            <div className="flex gap-2">
              {DEPTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateExpansion({ maxLayers: opt.value })}
                  className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                    settings.query_expansion.maxLayers === opt.value
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Activation Threshold */}
          <div>
            <label className="flex items-center justify-between text-sm font-medium mb-1">
              <span>Limiar de Ativação</span>
              <span className="text-xs text-muted-foreground font-normal">
                {(settings.query_expansion.primaryThreshold * 100).toFixed(0)}%
              </span>
            </label>
            <input
              type="range"
              min={0.3}
              max={0.7}
              step={0.05}
              value={settings.query_expansion.primaryThreshold}
              onChange={(e) =>
                updateExpansion({ primaryThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>30% (mais expansões)</span>
              <span>70% (menos expansões)</span>
            </div>
          </div>

          {/* Fallback Languages */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Idiomas de Fallback (Layer 2)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FALLBACK_LANGUAGES.map((lang) => {
                const config = settings.query_expansion.fallbackLanguageConfigs.find(
                  (c) => c.code === lang.code
                );
                const isEnabled = config?.enabled ?? (lang.code === 'en');

                return (
                  <label
                    key={lang.code}
                    className={`flex items-center gap-2 rounded-md border p-2 cursor-pointer transition-colors ${
                      isEnabled
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        const current = settings.query_expansion.fallbackLanguageConfigs;
                        const existing = current.find((c) => c.code === lang.code);
                        let updated: FallbackLanguageConfig[];
                        if (existing) {
                          updated = current.map((c) =>
                            c.code === lang.code
                              ? { ...c, enabled: e.target.checked }
                              : c
                          );
                        } else {
                          updated = [
                            ...current,
                            { code: lang.code, enabled: e.target.checked },
                          ];
                        }
                        updateExpansion({ fallbackLanguageConfigs: updated });
                      }}
                      className="accent-emerald-500"
                    />
                    <span className="text-base">{lang.flag}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{lang.name}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({lang.nativeName})
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Expansion Model */}
          <div>
            <label className="text-sm font-medium mb-1 block">Modelo de Expansão</label>
            <select
              value={settings.query_expansion.expansionModelId}
              onChange={(e) => updateExpansion({ expansionModelId: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Token Budget */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Budget de Tokens (máx. por pipeline)
            </label>
            <input
              type="number"
              value={settings.query_expansion.maxTotalTokens}
              onChange={(e) =>
                updateExpansion({
                  maxTotalTokens: Math.max(100, Math.min(2000, parseInt(e.target.value) || 800)),
                })
              }
              min={100}
              max={2000}
              step={50}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              100-2000 tokens. Padrão: 800
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Cálculo de Confiança ── */}
      <Card>
        <CardHeader>
          <CardTitle>Cálculo de Confiança</CardTitle>
          <CardDescription>
            Score pós-resposta que classifica cada resposta como BASE LOCAL, INFERIDO ou GENÉRICO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Preset Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Preset de Pesos</label>
            <div className="flex gap-2">
              {Object.keys(WEIGHT_PRESETS).map((presetKey) => (
                <button
                  key={presetKey}
                  onClick={() => {
                    updateConfidence({
                      preset: presetKey,
                      weights: WEIGHT_PRESETS[presetKey],
                    });
                  }}
                  className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                    settings.confidence.preset === presetKey
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  {presetKey === 'default'
                    ? 'Padrão'
                    : presetKey === 'kb_heavy'
                      ? 'KB-Heavy'
                      : 'IA-Heavy'}
                </button>
              ))}
              <button
                onClick={() => updateConfidence({ preset: 'custom' })}
                className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                  settings.confidence.preset === 'custom'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Weight Sliders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Pesos dos Sinais</label>
              <span
                className={`text-xs ${
                  Math.abs(weightsSum - 1.0) < 0.01
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                Total: {(weightsSum * 100).toFixed(0)}%
                {Math.abs(weightsSum - 1.0) >= 0.01 && ' (deve ser 100%)'}
              </span>
            </div>

            {WEIGHT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">
                  {WEIGHT_LABELS[key]}
                </span>
                <input
                  type="range"
                  min={0}
                  max={0.5}
                  step={0.01}
                  value={settings.confidence.weights[key]}
                  onChange={(e) => {
                    updateConfidence({
                      preset: 'custom',
                      weights: {
                        ...settings.confidence.weights,
                        [key]: parseFloat(e.target.value),
                      },
                    });
                  }}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {(settings.confidence.weights[key] * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>

          {/* Classification Thresholds */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Limiar BASE LOCAL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Math.round(settings.confidence.thresholds.baseLocal * 100)}
                  onChange={(e) =>
                    updateConfidence({
                      thresholds: {
                        ...settings.confidence.thresholds,
                        baseLocal: Math.max(0, Math.min(100, parseInt(e.target.value) || 80)) / 100,
                      },
                    })
                  }
                  min={0}
                  max={100}
                  className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Limiar INFERIDO
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Math.round(settings.confidence.thresholds.inferido * 100)}
                  onChange={(e) =>
                    updateConfidence({
                      thresholds: {
                        ...settings.confidence.thresholds,
                        inferido: Math.max(0, Math.min(100, parseInt(e.target.value) || 50)) / 100,
                      },
                    })
                  }
                  min={0}
                  max={100}
                  className="w-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Classification Preview */}
          <div className="rounded-lg border border-border p-3 bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Preview de Classificação:</p>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-400">
                BASE LOCAL: {'>='}{Math.round(settings.confidence.thresholds.baseLocal * 100)}%
              </span>
              <span className="text-yellow-400">
                INFERIDO: {'>='}{Math.round(settings.confidence.thresholds.inferido * 100)}%
              </span>
              <span className="text-red-400">
                GENÉRICO: {'<'}{Math.round(settings.confidence.thresholds.inferido * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save indicator */}
      {saving && (
        <div className="text-center text-xs text-muted-foreground animate-pulse">
          Salvando...
        </div>
      )}
    </div>
  );
}
