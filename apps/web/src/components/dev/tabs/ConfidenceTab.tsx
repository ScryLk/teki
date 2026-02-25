'use client';

import { useDevTools } from '@/stores/dev-tools.store';

interface ConfidenceSignal {
  name: string;
  key: string;
  rawScore: number;
  weight: number;
  weightedScore: number;
  description: string;
}

interface ConfidenceAdjustment {
  name: string;
  delta: number;
  reason: string;
}

interface ConfidenceResultData {
  percentage: number;
  normalized: number;
  classification: 'BASE_LOCAL' | 'INFERIDO' | 'GENERICO';
  label: string;
  signals: ConfidenceSignal[];
  adjustments: ConfidenceAdjustment[];
  preAdjustmentScore: number;
  weightPreset: string;
}

const CLASSIFICATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BASE_LOCAL: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  INFERIDO: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  GENERICO: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

export function ConfidenceTab() {
  const result = useDevTools((s) => s.lastConfidenceResult) as ConfidenceResultData | null;

  return (
    <div className="space-y-4">
      {/* Score Badge */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="font-semibold text-zinc-300 mb-2">Confidence Score</h3>

        {!result ? (
          <p className="text-zinc-500 text-[11px]">
            Nenhuma resposta analisada nesta sessão.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Main Score */}
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold font-mono text-zinc-100">
                {result.percentage}%
              </div>
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                    CLASSIFICATION_COLORS[result.classification]?.bg ?? 'bg-zinc-700'
                  } ${CLASSIFICATION_COLORS[result.classification]?.text ?? 'text-zinc-300'} ${
                    CLASSIFICATION_COLORS[result.classification]?.border ?? ''
                  } border`}
                >
                  {result.label}
                </span>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Preset: {result.weightPreset}
                </div>
              </div>
            </div>

            {/* Signal Bars */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">
                Signal Breakdown (8 signals)
              </span>
              {result.signals.map((signal) => (
                <div key={signal.key} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-zinc-400">{signal.name}</span>
                    <span className="font-mono text-zinc-300">
                      {(signal.rawScore * 100).toFixed(0)}% x {(signal.weight * 100).toFixed(0)}%
                      = {(signal.weightedScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        signal.rawScore >= 0.7
                          ? 'bg-emerald-500'
                          : signal.rawScore >= 0.4
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${signal.rawScore * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Adjustments */}
            {result.adjustments.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase">Adjustments</span>
                {result.adjustments.map((adj, i) => (
                  <div
                    key={i}
                    className={`text-[11px] px-2 py-1 rounded ${
                      adj.delta > 0
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    <span className="font-mono">
                      {adj.delta > 0 ? '+' : ''}
                      {(adj.delta * 100).toFixed(1)}%
                    </span>
                    {' '}
                    {adj.name}: {adj.reason}
                  </div>
                ))}
              </div>
            )}

            {/* Positive / Negative Factors */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded bg-zinc-800 p-2">
                <div className="text-[10px] text-emerald-400 mb-1">Positive Factors</div>
                {result.signals
                  .filter((s) => s.rawScore >= 0.6)
                  .map((s) => (
                    <div key={s.key} className="text-[10px] text-zinc-400">
                      + {s.name} ({(s.rawScore * 100).toFixed(0)}%)
                    </div>
                  ))}
                {result.signals.filter((s) => s.rawScore >= 0.6).length === 0 && (
                  <div className="text-[10px] text-zinc-600">None</div>
                )}
              </div>
              <div className="rounded bg-zinc-800 p-2">
                <div className="text-[10px] text-red-400 mb-1">Negative Factors</div>
                {result.signals
                  .filter((s) => s.rawScore < 0.4)
                  .map((s) => (
                    <div key={s.key} className="text-[10px] text-zinc-400">
                      - {s.name} ({(s.rawScore * 100).toFixed(0)}%)
                    </div>
                  ))}
                {result.signals.filter((s) => s.rawScore < 0.4).length === 0 && (
                  <div className="text-[10px] text-zinc-600">None</div>
                )}
              </div>
            </div>

            {/* Raw Score */}
            <div className="text-[10px] text-zinc-600 text-center">
              Pre-adjustment: {(result.preAdjustmentScore * 100).toFixed(1)}%
              {' -> '}
              Final: {result.percentage}%
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
