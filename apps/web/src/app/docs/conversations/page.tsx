import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Conversas — Teki Docs',
};

const endpoints = [
  { method: 'GET', path: '/v1/conversations', description: 'Lista todas as conversas' },
  { method: 'POST', path: '/v1/conversations', description: 'Cria uma nova conversa' },
  { method: 'GET', path: '/v1/conversations/:id', description: 'Busca uma conversa por ID' },
  { method: 'DELETE', path: '/v1/conversations/:id', description: 'Remove uma conversa' },
  { method: 'GET', path: '/v1/conversations/:id/messages', description: 'Lista mensagens de uma conversa' },
];

const methodColors: Record<string, string> = {
  GET: '#2A8F9D',
  POST: '#17c964',
  DELETE: '#f31260',
};

const messageFields = [
  { field: 'id', type: 'string', description: 'ID único da mensagem' },
  { field: 'conversationId', type: 'string', description: 'ID da conversa' },
  { field: 'role', type: 'string', description: '"user", "assistant" ou "system"' },
  { field: 'content', type: 'string', description: 'Texto da mensagem' },
  { field: 'modelUsed', type: 'string', description: 'Modelo de IA utilizado (apenas assistant)' },
  { field: 'tokensIn', type: 'number', description: 'Tokens de entrada consumidos' },
  { field: 'tokensOut', type: 'number', description: 'Tokens de saída gerados' },
  { field: 'latencyMs', type: 'number', description: 'Latência da resposta em milissegundos' },
  { field: 'createdAt', type: 'string', description: 'Data de criação (ISO 8601)' },
];

export default function ConversationsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Conversas</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Gerencie conversas e acesse o histórico de mensagens.
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

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Listar conversas</h2>
      <CodeBlock
        language="bash"
        code={`curl https://api.teki.com.br/v1/conversations \\
  -H "Authorization: Bearer tk_live_..."`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta</h2>
      <CodeBlock
        language="json"
        code={`{
  "conversations": [
    {
      "id": "conv_xyz789",
      "agentId": "agent_net01",
      "title": "Problema com DNS",
      "source": "api",
      "messageCount": 8,
      "createdAt": "2026-02-22T14:00:00Z",
      "updatedAt": "2026-02-22T14:15:00Z"
    },
    {
      "id": "conv_abc456",
      "agentId": "default",
      "title": "Erro BSOD",
      "source": "web",
      "messageCount": 3,
      "createdAt": "2026-02-21T10:00:00Z",
      "updatedAt": "2026-02-21T10:05:00Z"
    }
  ]
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Criar conversa</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Conversas são criadas automaticamente ao enviar a primeira mensagem via{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">POST /v1/chat</code>{' '}
        sem <code className="font-mono text-xs text-[#2A8F9D]">conversationId</code>.
        Você também pode criar uma conversa explicitamente:
      </p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/conversations \\
  -H "Authorization: Bearer tk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent_net01",
    "title": "Suporte rede corporativa"
  }'`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Buscar mensagens</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Use paginação com os parâmetros{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">page</code> e{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">limit</code>:
      </p>
      <CodeBlock
        language="bash"
        code={`curl "https://api.teki.com.br/v1/conversations/conv_xyz789/messages?page=1&limit=20" \\
  -H "Authorization: Bearer tk_live_..."`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta de mensagens</h2>
      <CodeBlock
        language="json"
        code={`{
  "messages": [
    {
      "id": "msg_001",
      "conversationId": "conv_xyz789",
      "role": "user",
      "content": "O servidor DNS não responde",
      "modelUsed": null,
      "tokensIn": 0,
      "tokensOut": 0,
      "latencyMs": null,
      "createdAt": "2026-02-22T14:00:00Z"
    },
    {
      "id": "msg_002",
      "conversationId": "conv_xyz789",
      "role": "assistant",
      "content": "Vamos diagnosticar o problema. Execute: nslookup google.com...",
      "modelUsed": "gemini-2.0-flash",
      "tokensIn": 245,
      "tokensOut": 180,
      "latencyMs": 1200,
      "createdAt": "2026-02-22T14:00:02Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Campos da mensagem</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3f3f46] bg-[#18181b]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Campo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Tipo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {messageFields.map((f) => (
              <tr key={f.field} className="bg-[#0f0f12]">
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-[#2A8F9D]">{f.field}</code>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-[#71717a]">{f.type}</code>
                </td>
                <td className="px-4 py-2.5 text-xs text-[#a1a1aa]">{f.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Excluir conversa</h2>
      <CodeBlock
        language="bash"
        code={`curl -X DELETE https://api.teki.com.br/v1/conversations/conv_xyz789 \\
  -H "Authorization: Bearer tk_live_..."`}
      />
      <p className="text-sm text-[#a1a1aa] mt-3">
        A exclusão remove a conversa e todas as mensagens associadas permanentemente.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Retenção de histórico</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3f3f46] bg-[#18181b]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Plano</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Retenção</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {[
              { plan: 'Free', retention: '7 dias' },
              { plan: 'Starter', retention: '30 dias' },
              { plan: 'Pro', retention: 'Ilimitado' },
            ].map((r) => (
              <tr key={r.plan} className="bg-[#0f0f12]">
                <td className="px-4 py-2.5 text-[#a1a1aa]">{r.plan}</td>
                <td className="px-4 py-2.5 text-[#fafafa] font-medium">{r.retention}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NavPrevNext
        prev={{ label: 'Chat', href: '/docs/chat' }}
        next={{ label: 'Modelos', href: '/docs/models' }}
      />
    </article>
  );
}
