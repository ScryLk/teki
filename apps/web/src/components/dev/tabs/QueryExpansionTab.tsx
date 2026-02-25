'use client';

import { useDevTools } from '@/stores/dev-tools.store';

interface ExpansionLayer {
  layer: number;
  layerName: string;
  queriesUsed: string[];
  bestScore: number;
  tokensUsed: number;
  latencyMs: number;
  accepted: boolean;
  results: { chunkId: string; similarity: number; filename: string; matchSource: string }[];
}

interface ExpansionResult {
  originalQuery: string;
  finalBestScore: number;
  resolvedAtLayer: number;
  fallbackActivated: boolean;
  totalTokensUsed: number;
  totalLatencyMs: number;
  budgetRemaining: number;
  layers: ExpansionLayer[];
  finalResults: { chunkId: string; similarity: number; filename: string; content: string }[];
}

export function QueryExpansionTab() {
  const result = useDevTools((s) => s.lastExpansionResult) as ExpansionResult | null;
  const stats = useDevTools((s) => s.expansionStats);
  const resetStats = useDevTools((s) => s.resetExpansionStats);

  const total = stats.l0 + stats.l1 + stats.l2 + stats.l3 + stats.miss;

  return (
    <div className="space-y-4">
      {/* Session Stats */}
      <section className="rounded border border-zinc-700 p-2.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-zinc-300">Session Stats</h3>
          <button
            onClick={resetStats}
            className="text-[10px] text-zinc-500 hover:text-zinc-300"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {(['l0', 'l1', 'l2', 'l3', 'miss'] as const).map((key) => (
            <div key={key} className="rounded bg-zinc-800 p-1.5">
              <div className="text-[10px] text-zinc-500 uppercase">
                {key === 'miss' ? 'Miss' : `Layer ${key[1]}`}
              </div>
              <div className="text-sm font-semibold text-zinc-200">
                {stats[key]}
              </div>
              {total > 0 && (
                <div className="text-[9px] text-zinc-500">
                  {((stats[key] / total) * 100).toFixed(0)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Last Search Breakdown */}
      <section className="rounded border border-zinc-700 p-2.5">
        <h3 className="font-semibold text-zinc-300 mb-2">Last Search</h3>

        {!result ? (
          <p className="text-zinc-500 text-[11px]">
            Nenhuma busca realizada nesta sessão.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Query & Summary */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase">Query</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    result.resolvedAtLayer >= 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {result.resolvedAtLayer >= 0
                    ? `Resolved @ L${result.resolvedAtLayer}`
                    : 'No match'}
                </span>
              </div>
              <p className="text-zinc-300 text-[11px] break-words">
                &quot;{result.originalQuery}&quot;
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded bg-zinc-800 p-1.5">
                <div className="text-[9px] text-zinc-500">Best Score</div>
                <div className="text-sm font-mono text-zinc-200">
                  {(result.finalBestScore * 100).toFixed(0)}%
                </div>
              </div>
              <div className="rounded bg-zinc-800 p-1.5">
                <div className="text-[9px] text-zinc-500">Tokens</div>
                <div className="text-sm font-mono text-zinc-200">
                  {result.totalTokensUsed}
                </div>
              </div>
              <div className="rounded bg-zinc-800 p-1.5">
                <div className="text-[9px] text-zinc-500">Latency</div>
                <div className="text-sm font-mono text-zinc-200">
                  {result.totalLatencyMs}ms
                </div>
              </div>
            </div>

            {/* Layer Breakdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase">Layers</span>
              {result.layers.map((layer) => (
                <div
                  key={layer.layer}
                  className={`rounded p-2 text-[11px] ${
                    layer.accepted
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-300">
                      L{layer.layer}: {layer.layerName}
                    </span>
                    <span className="font-mono text-zinc-400">
                      {(layer.bestScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  {layer.queriesUsed.length > 0 && layer.layer > 0 && (
                    <div className="mt-1 text-zinc-500 text-[10px]">
                      Queries: {layer.queriesUsed.slice(0, 3).join(' | ')}
                      {layer.queriesUsed.length > 3 && ` +${layer.queriesUsed.length - 3}`}
                    </div>
                  )}
                  <div className="mt-0.5 text-zinc-600 text-[10px]">
                    {layer.results.length} results | {layer.tokensUsed} tokens | {layer.latencyMs}ms
                  </div>
                </div>
              ))}
            </div>

            {/* Top Results */}
            {result.finalResults.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-500 uppercase">
                  Top Results ({result.finalResults.length})
                </span>
                {result.finalResults.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className="font-mono text-zinc-400 w-8">
                      {(r.similarity * 100).toFixed(0)}%
                    </span>
                    <span className="text-zinc-300 truncate flex-1">
                      {r.filename}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
