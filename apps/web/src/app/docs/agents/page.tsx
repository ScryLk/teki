import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Agentes — Teki Docs',
};

const endpoints = [
  { method: 'GET', path: '/v1/agents', description: 'Lista todos os agentes' },
  { method: 'POST', path: '/v1/agents', description: 'Cria um novo agente' },
  { method: 'GET', path: '/v1/agents/:id', description: 'Busca um agente por ID' },
  { method: 'PATCH', path: '/v1/agents/:id', description: 'Atualiza um agente' },
  { method: 'DELETE', path: '/v1/agents/:id', description: 'Remove um agente' },
];

const methodColors: Record<string, string> = {
  GET: '#2A8F9D',
  POST: '#17c964',
  PATCH: '#f5a524',
  DELETE: '#f31260',
};

export default function AgentsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Agentes</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Crie e gerencie agentes de IA com instruções e base de dados própria.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Endpoints</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden mb-8">
        {endpoints.map((ep) => (
          <div
            key={`${ep.method}-${ep.path}`}
            className="flex items-center gap-4 px-4 py-3 border-b border-[#3f3f46] last:border-b-0 bg-[#0f0f12]"
          >
            <span
              className="text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 w-16 text-center"
              style={{
                color: methodColors[ep.method],
                backgroundColor: `${methodColors[ep.method]}15`,
              }}
            >
              {ep.method}
            </span>
            <code className="text-sm font-mono text-[#fafafa] flex-1">{ep.path}</code>
            <span className="text-xs text-[#71717a] hidden sm:block">{ep.description}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Criar agente</h2>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/agents \\
  -H "Authorization: Bearer tk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Agente de Rede",
    "description": "Especialista em infraestrutura e redes",
    "systemPrompt": "Você é um especialista em redes Linux. Responda sempre com comandos práticos.",
    "model": "gemini-2.5-flash",
    "temperature": 0.3
  }'`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta</h2>
      <CodeBlock
        language="json"
        code={`{
  "id": "agent_net01",
  "name": "Agente de Rede",
  "description": "Especialista em infraestrutura e redes",
  "model": "gemini-2.5-flash",
  "temperature": 0.3,
  "createdAt": "2026-02-22T14:00:00Z",
  "documentsCount": 0
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Limites por plano</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3f3f46] bg-[#18181b]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Plano</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Agentes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {[
              { plan: 'Free', agents: '1' },
              { plan: 'Starter', agents: '1' },
              { plan: 'Pro', agents: '5' },
            ].map((r) => (
              <tr key={r.plan} className="bg-[#0f0f12]">
                <td className="px-4 py-2.5 text-[#a1a1aa]">{r.plan}</td>
                <td className="px-4 py-2.5 text-[#fafafa] font-medium">{r.agents}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NavPrevNext
        prev={{ label: 'Chat', href: '/docs/chat' }}
        next={{ label: 'Base de Conhecimento', href: '/docs/knowledge-base' }}
      />
    </article>
  );
}
