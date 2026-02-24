import React, { useState } from 'react';

interface AiProvider {
  id: string;
  name: string;
  model: string;
  apiKeyMasked: string;
  requestsThisMonth: number;
  costThisMonth: string;
  status: 'healthy' | 'degraded' | 'down';
  isPrimary: boolean;
}

const DEMO_PROVIDERS: AiProvider[] = [
  {
    id: '1',
    name: 'Anthropic',
    model: 'Claude Sonnet 4.5',
    apiKeyMasked: 'sk-ant-••••••xxR9',
    requestsThisMonth: 2450,
    costThisMonth: '$14.20',
    status: 'healthy',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Google',
    model: 'Gemini 2.5 Flash',
    apiKeyMasked: 'AIza-••••••3kZ',
    requestsThisMonth: 380,
    costThisMonth: '$1.85',
    status: 'healthy',
    isPrimary: false,
  },
];

type RoutingStrategy = 'priority' | 'cost' | 'latency';

const AiModelsSection: React.FC = () => {
  const [providers] = useState<AiProvider[]>(DEMO_PROVIDERS);
  const [strategy, setStrategy] = useState<RoutingStrategy>('priority');
  const [fallback, setFallback] = useState(true);
  const [monthlyLimit] = useState(250);
  const [monthlyUsed] = useState(80.25);

  const usedPct = Math.round((monthlyUsed / monthlyLimit) * 100);

  return (
    <div>
      <h1 className="text-lg font-semibold text-[#fafafa] mb-1">IA & Modelos</h1>
      <p className="text-sm text-[#71717a] mb-6">Configure os provedores de IA e como o Teki escolhe qual usar.</p>

      {/* Providers */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#27272a]">
          <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Provedores configurados</h3>
        </div>
        <div className="p-4 space-y-3">
          {providers.map((provider, i) => (
            <div key={provider.id} className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#27272a] text-[#a1a1aa]">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-[#fafafa]">
                    {provider.name}
                    {provider.isPrimary && <span className="text-[#71717a] font-normal"> (principal)</span>}
                    {!provider.isPrimary && <span className="text-[#71717a] font-normal"> (fallback)</span>}
                  </span>
                </div>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    provider.status === 'healthy' ? 'bg-[#17c964]'
                      : provider.status === 'degraded' ? 'bg-[#f5a524]'
                        : 'bg-[#f31260]'
                  }`} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">Modelo:</span>
                  <span className="text-[#fafafa]">{provider.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#71717a]">API Key:</span>
                  <span className="text-[#52525b] font-mono">{provider.apiKeyMasked}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <span className="text-[#71717a]">Este mês:</span>
                  <span className="text-[#fafafa]">{provider.requestsThisMonth.toLocaleString()} requests · {provider.costThisMonth}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#27272a] text-xs text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#3f3f46] transition-colors">
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                  </svg>
                  Testar
                </button>
              </div>
            </div>
          ))}

          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#27272a] text-xs text-[#71717a] hover:border-accent/40 hover:text-accent transition-colors">
            + Adicionar provedor
          </button>
        </div>
      </div>

      {/* Routing */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#27272a]">
          <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Roteamento</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs text-[#71717a] mb-2">Estratégia:</p>
            <div className="flex items-center gap-4">
              {([
                { value: 'priority' as const, label: 'Prioridade' },
                { value: 'cost' as const, label: 'Custo otimizado' },
                { value: 'latency' as const, label: 'Latência' },
              ]).map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={strategy === opt.value}
                    onChange={() => setStrategy(opt.value)}
                    className="accent-accent"
                  />
                  <span className="text-xs text-[#fafafa]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#fafafa]">Fallback automático</span>
              <p className="text-[11px] text-[#52525b]">máx. 2 tentativas</p>
            </div>
            <Toggle checked={fallback} onChange={setFallback} />
          </div>

          <button className="text-xs text-accent hover:underline">
            Regras por tipo de uso (avançado)
          </button>
        </div>
      </div>

      {/* Budget */}
      <div className="rounded-xl border border-[#27272a] bg-[#18181b] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27272a]">
          <h3 className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">Orçamento</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71717a]">Limite mensal:</span>
            <span className="text-[#fafafa] font-medium">R$ {monthlyLimit},00 (~$50 USD)</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#71717a]">Usado este mês:</span>
            <span className="text-[#fafafa]">R$ {monthlyUsed.toFixed(2)} ({usedPct}%)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#27272a] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${usedPct}%`,
                backgroundColor: usedPct >= 80 ? '#f5a524' : '#2A8F9D',
              }}
            />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-accent" />
              <span className="text-xs text-[#fafafa]">Alertar em 80%</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="accent-accent" />
              <span className="text-xs text-[#fafafa]">Parar em 100%</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-accent' : 'bg-[#3f3f46]'}`}
  >
    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
  </button>
);

export default AiModelsSection;
