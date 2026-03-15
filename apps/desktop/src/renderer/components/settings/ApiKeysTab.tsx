import React, { useCallback, useEffect, useState } from 'react';
import type { TekiApiKey, TekiApiKeyCreateResult } from '@teki/shared';
import { useAppStore } from '@/stores/app-store';

type View = 'list' | 'creating' | 'reveal';

export const ApiKeysTab: React.FC = () => {
  const userPlan = useAppStore((s) => s.userPlan);
  const [view, setView] = useState<View>('list');
  const [keys, setKeys] = useState<TekiApiKey[]>([]);
  const [planLimit, setPlanLimit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<TekiApiKeyCreateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedPrefix, setCopiedPrefix] = useState(false);

  // Form state
  const [keyName, setKeyName] = useState('');
  const [keyType, setKeyType] = useState<'LIVE' | 'TEST'>('LIVE');
  const [keyExpiry, setKeyExpiry] = useState('');

  const fetchKeys = useCallback(async () => {
    if (!window.tekiAPI?.tekiApiKeysList) return;
    setLoading(true);
    setError(null);
    try {
      const result = await window.tekiAPI.tekiApiKeysList();
      setKeys(result.keys);
      setPlanLimit(result.planLimit);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await window.tekiAPI!.tekiApiKeysCreate({
        name: keyName.trim(),
        type: keyType,
        expiresAt: keyExpiry || undefined,
      });
      setNewKey(result);
      setView('reveal');
      setKeyName('');
      setKeyExpiry('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.tekiAPI!.tekiApiKeysRevoke(id);
      setRevoking(null);
      await fetchKeys();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismissReveal = () => {
    setNewKey(null);
    setCopied(false);
    setView('list');
    fetchKeys();
  };

  const activeKeys = keys.filter((k) => !k.isRevoked);
  const revokedKeys = keys.filter((k) => k.isRevoked);
  const canCreate = planLimit > 0 && activeKeys.length < planLimit;

  // ─── Reveal view (after key creation) ───
  if (view === 'reveal' && newKey) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-[#fafafa]">Chave criada com sucesso</h3>

        <div className="bg-[#18181b] border border-[#3f3f46]/50 rounded-lg p-4">
          <label className="block text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
            Sua API Key
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#111113] text-[#fafafa] text-xs font-mono px-3 py-2 rounded border border-[#3f3f46]/30 select-all break-all">
              {newKey.key}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-xs text-red-400 font-medium">
            Esta chave não será exibida novamente. Copie agora e guarde em local seguro.
          </p>
        </div>

        <button
          onClick={handleDismissReveal}
          className="w-full px-4 py-2 text-xs font-medium rounded-lg border border-[#3f3f46]/50 text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors"
        >
          Entendi, fechar
        </button>
      </div>
    );
  }

  // ─── Create form view ───
  if (view === 'creating') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-[#fafafa]">Nova API Key</h3>
          <button
            onClick={() => { setView('list'); setError(null); }}
            className="text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors"
          >
            Voltar
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Nome
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="Ex: Meu App, Integração N8N..."
              className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] placeholder:text-[#52525b] focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Tipo
            </label>
            <div className="flex gap-2">
              {(['LIVE', 'TEST'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setKeyType(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    keyType === t
                      ? 'bg-accent/15 text-accent border border-accent/40'
                      : 'bg-[#18181b] border border-[#3f3f46]/50 text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  {t === 'LIVE' ? 'Produção' : 'Teste'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
              Expiração (opcional)
            </label>
            <input
              type="date"
              value={keyExpiry}
              onChange={(e) => setKeyExpiry(e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
              className="w-full px-3 py-2 rounded-lg bg-[#18181b] border border-[#3f3f46]/50 text-sm text-[#fafafa] focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={!keyName.trim() || loading}
          className="w-full px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Criando...' : 'Criar API Key'}
        </button>
      </div>
    );
  }

  // ─── List view (default) ───
  return (
    <div className="space-y-4">
      {/* Header + quota */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#fafafa]">API Keys</h3>
          <p className="text-[11px] text-[#71717a] mt-0.5">
            Chaves para integrar a IA do Teki em apps externos
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => { setView('creating'); setError(null); }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
          >
            + Nova Key
          </button>
        )}
      </div>

      {/* Quota bar */}
      {planLimit > 0 ? (
        <div className="bg-[#18181b] border border-[#3f3f46]/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[#a1a1aa] uppercase tracking-wider">
              Chaves ativas
            </span>
            <span className="text-xs text-[#fafafa] font-medium">
              {activeKeys.length} / {planLimit}
            </span>
          </div>
          <div className="h-1.5 bg-[#3f3f46]/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (activeKeys.length / planLimit) * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-xs text-amber-400">
            Seu plano ({userPlan ?? 'FREE'}) não permite criar API Keys. Faça upgrade para Starter ou superior.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {loading && keys.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-block w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Active keys */}
      {activeKeys.length > 0 && (
        <div className="space-y-2">
          {activeKeys.map((k) => {
            const isExpanded = expanded === k.id;
            return (
              <div
                key={k.id}
                className="bg-[#18181b] border border-[#3f3f46]/30 rounded-lg overflow-hidden"
              >
                {/* Header row — clickable to expand */}
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : k.id)}
                  className="w-full text-left p-3 hover:bg-[#1f1f23] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[#fafafa] truncate">{k.name}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase rounded leading-none ${
                          k.type === 'LIVE'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        }`}>
                          {k.type === 'LIVE' ? 'Produção' : 'Teste'}
                        </span>
                        <svg
                          className={`w-3 h-3 text-[#52525b] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <code className="text-[11px] text-[#71717a] font-mono mt-1 block">
                        {k.keyPrefix}...
                      </code>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#52525b]">
                        <span>
                          Último uso: {k.lastUsedAt ? timeAgo(k.lastUsedAt) : 'Nunca'}
                        </span>
                        <span>
                          {k.monthlyUsage.requests} req · {formatTokens(k.monthlyUsage.tokensIn + k.monthlyUsage.tokensOut)} tokens este mês
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="border-t border-[#3f3f46]/30 px-3 pb-3 pt-2 space-y-3">
                    {/* Key prefix + copy */}
                    <div>
                      <label className="block text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1">
                        Prefixo da chave
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-[#111113] text-[#fafafa] text-xs font-mono px-3 py-1.5 rounded border border-[#3f3f46]/30 select-all">
                          {k.keyPrefix}...
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(k.keyPrefix);
                            setCopiedPrefix(true);
                            setTimeout(() => setCopiedPrefix(false), 2000);
                          }}
                          className="shrink-0 px-2 py-1.5 text-[10px] font-medium rounded bg-[#27272a] border border-[#3f3f46]/50 text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
                        >
                          {copiedPrefix ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-[9px] text-[#52525b] mt-1">
                        A chave completa é exibida apenas no momento da criação por segurança.
                      </p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#111113] rounded-lg p-2">
                        <span className="text-[9px] text-[#71717a] uppercase tracking-wider">Criada em</span>
                        <p className="text-[11px] text-[#fafafa] mt-0.5">{formatDate(k.createdAt)}</p>
                      </div>
                      <div className="bg-[#111113] rounded-lg p-2">
                        <span className="text-[9px] text-[#71717a] uppercase tracking-wider">Expira em</span>
                        <p className="text-[11px] text-[#fafafa] mt-0.5">{k.expiresAt ? formatDate(k.expiresAt) : 'Nunca'}</p>
                      </div>
                      <div className="bg-[#111113] rounded-lg p-2">
                        <span className="text-[9px] text-[#71717a] uppercase tracking-wider">Último uso</span>
                        <p className="text-[11px] text-[#fafafa] mt-0.5">{k.lastUsedAt ? formatDate(k.lastUsedAt) : 'Nunca'}</p>
                      </div>
                      <div className="bg-[#111113] rounded-lg p-2">
                        <span className="text-[9px] text-[#71717a] uppercase tracking-wider">ID</span>
                        <p className="text-[11px] text-[#fafafa] mt-0.5 font-mono truncate" title={k.id}>{k.id}</p>
                      </div>
                    </div>

                    {/* Usage stats */}
                    <div>
                      <label className="block text-[10px] font-medium text-[#a1a1aa] uppercase tracking-wider mb-1.5">
                        Uso este mês
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="bg-[#111113] rounded-lg p-2 text-center">
                          <p className="text-sm font-semibold text-[#fafafa]">{k.monthlyUsage.requests}</p>
                          <span className="text-[9px] text-[#71717a]">Requisições</span>
                        </div>
                        <div className="bg-[#111113] rounded-lg p-2 text-center">
                          <p className="text-sm font-semibold text-accent">{formatTokens(k.monthlyUsage.tokensIn)}</p>
                          <span className="text-[9px] text-[#71717a]">Tokens In</span>
                        </div>
                        <div className="bg-[#111113] rounded-lg p-2 text-center">
                          <p className="text-sm font-semibold text-purple-400">{formatTokens(k.monthlyUsage.tokensOut)}</p>
                          <span className="text-[9px] text-[#71717a]">Tokens Out</span>
                        </div>
                        <div className="bg-[#111113] rounded-lg p-2 text-center">
                          <p className="text-sm font-semibold text-amber-400">${k.monthlyUsage.costUsd.toFixed(4)}</p>
                          <span className="text-[9px] text-[#71717a]">Custo</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      {revoking === k.id ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRevoke(k.id); }}
                            className="flex-1 px-3 py-1.5 text-[10px] font-medium rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Confirmar revogação
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setRevoking(null); }}
                            className="px-3 py-1.5 text-[10px] font-medium rounded-lg border border-[#3f3f46]/50 text-[#71717a] hover:text-[#a1a1aa] transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); setRevoking(k.id); }}
                          className="px-3 py-1.5 text-[10px] font-medium rounded-lg border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-colors"
                        >
                          Revogar chave
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && activeKeys.length === 0 && planLimit > 0 && (
        <div className="text-center py-6">
          <div className="text-[#52525b] mb-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
            </svg>
          </div>
          <p className="text-xs text-[#71717a]">Nenhuma API key criada</p>
          <p className="text-[10px] text-[#52525b] mt-1">
            Crie uma chave para integrar a IA do Teki em automações e apps externos
          </p>
        </div>
      )}

      {/* Revoked keys (collapsed) */}
      {revokedKeys.length > 0 && (
        <details className="group">
          <summary className="text-[10px] text-[#52525b] cursor-pointer hover:text-[#71717a] transition-colors">
            {revokedKeys.length} chave(s) revogada(s)
          </summary>
          <div className="mt-2 space-y-1.5">
            {revokedKeys.map((k) => (
              <div
                key={k.id}
                className="bg-[#18181b]/50 border border-[#3f3f46]/20 rounded-lg p-2.5 opacity-60"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71717a] line-through">{k.name}</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-medium uppercase rounded leading-none bg-red-500/10 border border-red-500/20 text-red-400/60">
                    Revogada
                  </span>
                </div>
                <code className="text-[10px] text-[#52525b] font-mono">{k.keyPrefix}...</code>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

// ─── Helpers ───

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return `há ${Math.floor(days / 30)} meses`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
