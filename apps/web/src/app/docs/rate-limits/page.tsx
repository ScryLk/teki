import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Limites — Teki Docs',
};

const planLimits = [
  { plan: 'Free', messages: '50/mês', agents: '1', models: '1', kb: '2 docs / 5 MB', history: '7 dias', channels: '—' },
  { plan: 'Starter', messages: '500/mês', agents: '1', models: '3', kb: '5 docs / 25 MB', history: '30 dias', channels: '—' },
  { plan: 'Pro', messages: '2.000/mês', agents: '5', models: '7 + Ollama', kb: '50 docs / 100 MB', history: 'Ilimitado', channels: '3' },
];

const endpointLimits = [
  { endpoint: 'POST /v1/chat', limit: '10 req/min' },
  { endpoint: 'GET /v1/agents', limit: '60 req/min' },
  { endpoint: 'POST /v1/agents', limit: '10 req/min' },
  { endpoint: 'POST /v1/agents/:id/documents', limit: '5 req/min' },
  { endpoint: 'GET *', limit: '60 req/min' },
];

export default function RateLimitsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Limites</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Limites de uso por plano e por endpoint.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Por plano</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3f3f46] bg-[#18181b]">
              {['Plano', 'Mensagens', 'Agentes', 'Modelos', 'KB', 'Histórico', 'Canais'].map((h) => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {planLimits.map((r) => (
              <tr key={r.plan} className="bg-[#0f0f12]">
                <td className="px-4 py-2.5 font-medium text-[#fafafa]">{r.plan}</td>
                <td className="px-4 py-2.5 text-[#a1a1aa]">{r.messages}</td>
                <td className="px-4 py-2.5 text-[#a1a1aa]">{r.agents}</td>
                <td className="px-4 py-2.5 text-[#a1a1aa] whitespace-nowrap">{r.models}</td>
                <td className="px-4 py-2.5 text-[#a1a1aa] whitespace-nowrap">{r.kb}</td>
                <td className="px-4 py-2.5 text-[#a1a1aa]">{r.history}</td>
                <td className="px-4 py-2.5 text-[#a1a1aa]">{r.channels}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Por endpoint (rate limiting)</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden mb-8">
        {endpointLimits.map((e) => (
          <div
            key={e.endpoint}
            className="flex items-center justify-between px-4 py-3 border-b border-[#3f3f46] last:border-b-0 bg-[#0f0f12]"
          >
            <code className="text-xs font-mono text-[#a1a1aa]">{e.endpoint}</code>
            <span className="text-xs text-[#2A8F9D] font-medium">{e.limit}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Headers de resposta</h2>
      <CodeBlock
        language="bash"
        code={`X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1740230460`}
      />

      <p className="text-sm text-[#a1a1aa] mt-3">
        Quando o limite é atingido, a API retorna{' '}
        <code className="font-mono text-xs text-[#f31260]">429 Too Many Requests</code>{' '}
        com o header{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">Retry-After</code> em segundos.
      </p>

      <div className="rounded-lg border border-[#3f3f46]/60 bg-[#0f0f12] p-4 text-sm text-[#a1a1aa] mt-6">
        <strong className="text-[#fafafa]">BYOK (Plano Pro):</strong>{' '}
        Mensagens enviadas com sua própria chave de API (configurada em{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">/settings/api-keys</code>){' '}
        <strong className="text-[#fafafa]">não consomem</strong> o limite mensal de mensagens.
      </div>

      <NavPrevNext
        prev={{ label: 'Webhooks', href: '/docs/webhooks' }}
        next={{ label: 'Erros', href: '/docs/errors' }}
      />
    </article>
  );
}
