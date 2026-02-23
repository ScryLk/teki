import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Modelos — Teki Docs',
};

const models = [
  {
    provider: 'Google Gemini',
    items: [
      {
        id: 'gemini-flash',
        name: 'Gemini Flash',
        tier: 'Free',
        context: '1M tokens',
        vision: true,
        description: 'Rápido e econômico. Ideal para suporte básico e alto volume de mensagens.',
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        tier: 'Pro',
        context: '1M tokens',
        vision: true,
        description: 'Mais inteligente. Para análises profundas e problemas complexos.',
      },
    ],
  },
  {
    provider: 'OpenAI',
    items: [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        tier: 'Starter',
        context: '128K tokens',
        vision: true,
        description: 'Bom equilíbrio entre qualidade e velocidade.',
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        tier: 'Pro',
        context: '128K tokens',
        vision: true,
        description: 'O melhor da OpenAI. Excelente para textos e explicações detalhadas.',
      },
    ],
  },
  {
    provider: 'Anthropic Claude',
    items: [
      {
        id: 'claude-haiku',
        name: 'Claude Haiku',
        tier: 'Starter',
        context: '200K tokens',
        vision: true,
        description: 'Rápido e preciso. Respostas diretas e confiáveis.',
      },
      {
        id: 'claude-sonnet',
        name: 'Claude Sonnet',
        tier: 'Pro',
        context: '200K tokens',
        vision: true,
        description: 'O melhor para código e análise técnica.',
      },
    ],
  },
  {
    provider: 'Ollama (Local)',
    items: [
      {
        id: 'ollama-custom',
        name: 'Modelo Local',
        tier: 'Pro',
        context: '32K tokens',
        vision: false,
        description: 'Roda na sua máquina. Privacidade total. Configure o modelo em /settings/api-keys.',
      },
    ],
  },
];

const tierColors: Record<string, string> = {
  Free: '#71717a',
  Starter: '#2A8F9D',
  Pro: '#F59E0B',
};

const availability = [
  { feature: 'Gemini Flash', free: true, starter: true, pro: true },
  { feature: 'GPT-4o Mini', free: false, starter: true, pro: true },
  { feature: 'Claude Haiku', free: false, starter: true, pro: true },
  { feature: 'Gemini Pro', free: false, starter: false, pro: true },
  { feature: 'GPT-4o', free: false, starter: false, pro: true },
  { feature: 'Claude Sonnet', free: false, starter: false, pro: true },
  { feature: 'Ollama (local)', free: false, starter: false, pro: true },
  { feature: 'Escolha por agente', free: false, starter: true, pro: true },
  { feature: 'BYOK (chave própria)', free: false, starter: false, pro: true },
];

function Check({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-[#2A8F9D] font-bold">✓</span>
  ) : (
    <span className="text-[#3f3f46]">—</span>
  );
}

export default function ModelsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Modelos de IA</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        O Teki suporta 7 modelos de 4 providers. Escolha o modelo por agente ou por mensagem.
      </p>

      {models.map((group) => (
        <div key={group.provider} className="mb-10">
          <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">{group.provider}</h2>
          <div className="space-y-3">
            {group.items.map((model) => (
              <div
                key={model.id}
                className="rounded-lg border border-[#3f3f46] bg-[#0f0f12] p-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-base font-semibold text-[#fafafa]">{model.name}</span>
                  <code className="text-xs font-mono text-[#71717a] bg-[#18181b] px-1.5 py-0.5 rounded">
                    {model.id}
                  </code>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ color: tierColors[model.tier], backgroundColor: `${tierColors[model.tier]}18` }}
                  >
                    Plano {model.tier}
                  </span>
                  {model.vision && (
                    <span className="text-xs font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 px-2 py-0.5 rounded-full">
                      Visão
                    </span>
                  )}
                  <span className="text-xs text-[#71717a]">Contexto: {model.context}</span>
                </div>
                <p className="text-sm text-[#a1a1aa]">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Disponibilidade por plano</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3f3f46] bg-[#18181b]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Modelo</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Free</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Starter</th>
              <th className="text-center px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Pro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {availability.map((row) => (
              <tr key={row.feature} className="bg-[#0f0f12]">
                <td className="px-4 py-2.5 text-[#a1a1aa]">{row.feature}</td>
                <td className="px-4 py-2.5 text-center"><Check ok={row.free} /></td>
                <td className="px-4 py-2.5 text-center"><Check ok={row.starter} /></td>
                <td className="px-4 py-2.5 text-center"><Check ok={row.pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-[#3f3f46]/60 bg-[#0f0f12] p-4 text-sm text-[#a1a1aa]">
        <strong className="text-[#fafafa]">BYOK (Bring Your Own Key):</strong>{' '}
        No plano Pro, você pode configurar suas próprias chaves de API em{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">/settings/api-keys</code>.
        Mensagens usando chave própria <strong className="text-[#fafafa]">não consomem</strong> o limite mensal do plano.
      </div>

      <NavPrevNext
        prev={{ label: 'Conversas', href: '/docs/conversations' }}
        next={{ label: 'Agentes', href: '/docs/agents' }}
      />
    </article>
  );
}
