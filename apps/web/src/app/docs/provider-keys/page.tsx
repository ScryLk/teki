import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Provider Keys — Teki Docs',
};

const endpoints = [
  { method: 'GET', path: '/v1/provider-keys', description: 'Lista chaves configuradas' },
  { method: 'POST', path: '/v1/provider-keys', description: 'Adiciona uma chave de provider' },
  { method: 'POST', path: '/v1/provider-keys/:provider/validate', description: 'Valida uma chave' },
  { method: 'DELETE', path: '/v1/provider-keys/:provider', description: 'Remove uma chave' },
];

const methodColors: Record<string, string> = {
  GET: '#2A8F9D',
  POST: '#17c964',
  DELETE: '#f31260',
};

const providers = [
  { id: 'gemini', name: 'Google Gemini', models: 'gemini-flash, gemini-pro', link: 'https://aistudio.google.com/apikey' },
  { id: 'openai', name: 'OpenAI', models: 'gpt-4o-mini, gpt-4o', link: 'https://platform.openai.com/api-keys' },
  { id: 'anthropic', name: 'Anthropic', models: 'claude-haiku, claude-sonnet', link: 'https://console.anthropic.com/settings/keys' },
  { id: 'ollama', name: 'Ollama (Local)', models: 'Modelos locais', link: 'https://ollama.com' },
];

export default function ProviderKeysPage() {
  return (
    <article>
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-3xl font-bold text-[#fafafa]">Provider Keys</h1>
        <span className="text-xs font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 border border-[#2A8F9D]/30 px-2 py-0.5 rounded-full">
          PLANO PRO
        </span>
      </div>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Configure suas próprias chaves de API (BYOK) para usar modelos sem consumir o limite do plano.
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

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Providers suportados</h2>
      <div className="space-y-3 mb-8">
        {providers.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-[#3f3f46] bg-[#0f0f12] p-4"
          >
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-base font-semibold text-[#fafafa]">{p.name}</span>
              <code className="text-xs font-mono text-[#71717a] bg-[#18181b] px-1.5 py-0.5 rounded">
                {p.id}
              </code>
            </div>
            <p className="text-sm text-[#a1a1aa]">
              Modelos: {p.models}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Adicionar chave</h2>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/provider-keys \\
  -H "Authorization: Bearer tk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "apiKey": "sk-proj-abc123..."
  }'`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta</h2>
      <CodeBlock
        language="json"
        code={`{
  "provider": "openai",
  "status": "valid",
  "lastValidatedAt": "2026-02-22T14:10:00Z",
  "createdAt": "2026-02-22T14:10:00Z"
}`}
      />

      <div className="my-4 rounded-lg border border-[#2A8F9D]/30 bg-[#2A8F9D]/5 px-4 py-3">
        <p className="text-sm text-[#2A8F9D]">
          <strong>Segurança:</strong> Suas chaves são criptografadas com AES-256-GCM antes de serem armazenadas.
          A chave original nunca é retornada nas respostas da API.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Validar chave</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Verifique se uma chave configurada ainda é válida:
      </p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/provider-keys/openai/validate \\
  -H "Authorization: Bearer tk_live_..."`}
      />
      <CodeBlock
        language="json"
        code={`{
  "provider": "openai",
  "status": "valid",
  "lastValidatedAt": "2026-02-22T15:00:00Z"
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Listar chaves</h2>
      <CodeBlock
        language="bash"
        code={`curl https://api.teki.com.br/v1/provider-keys \\
  -H "Authorization: Bearer tk_live_..."`}
      />
      <CodeBlock
        language="json"
        code={`{
  "keys": [
    {
      "provider": "openai",
      "status": "valid",
      "lastValidatedAt": "2026-02-22T15:00:00Z",
      "createdAt": "2026-02-22T14:10:00Z"
    },
    {
      "provider": "gemini",
      "status": "valid",
      "lastValidatedAt": "2026-02-22T14:30:00Z",
      "createdAt": "2026-02-22T14:20:00Z"
    }
  ]
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Remover chave</h2>
      <CodeBlock
        language="bash"
        code={`curl -X DELETE https://api.teki.com.br/v1/provider-keys/openai \\
  -H "Authorization: Bearer tk_live_..."`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Como funciona o BYOK</h2>
      <div className="rounded-lg border border-[#3f3f46] bg-[#0f0f12] p-4 text-sm font-mono text-[#a1a1aa] mb-6">
        Requisição → Teki verifica chave BYOK → Usa chave do provider → Não consome limite mensal
      </div>
      <ul className="space-y-2 text-sm text-[#a1a1aa]">
        {[
          'Mensagens enviadas com chave própria não consomem o limite mensal do plano',
          'O Teki usa sua chave diretamente com o provider (sem proxy adicional)',
          'Se a chave BYOK falhar, a mensagem não faz fallback para a chave do Teki',
          'Configure em Settings → API Keys ou via esta API',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-[#2A8F9D] mt-0.5 flex-shrink-0">→</span>
            {item}
          </li>
        ))}
      </ul>

      <NavPrevNext
        prev={{ label: 'OpenClaw', href: '/docs/openclaw' }}
        next={{ label: 'Webhooks', href: '/docs/webhooks' }}
      />
    </article>
  );
}
