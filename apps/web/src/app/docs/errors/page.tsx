import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Erros — Teki Docs',
};

const errors = [
  { code: 400, name: 'BAD_REQUEST', description: 'Parâmetros inválidos ou ausentes' },
  { code: 400, name: 'MODEL_NOT_AVAILABLE', description: 'Modelo não existe ou não está disponível no plano' },
  { code: 401, name: 'UNAUTHORIZED', description: 'API key inválida ou expirada' },
  { code: 403, name: 'PLAN_LIMIT_REACHED', description: 'Limite de mensagens do plano atingido' },
  { code: 403, name: 'FORBIDDEN', description: 'Sem permissão para este recurso' },
  { code: 404, name: 'NOT_FOUND', description: 'Recurso não encontrado' },
  { code: 413, name: 'FILE_TOO_LARGE', description: 'Arquivo acima do limite do plano' },
  { code: 422, name: 'UNPROCESSABLE', description: 'Formato de arquivo não suportado' },
  { code: 429, name: 'RATE_LIMIT_EXCEEDED', description: 'Muitas requisições. Aguarde e tente novamente.' },
  { code: 500, name: 'INTERNAL_ERROR', description: 'Erro interno do servidor' },
  { code: 503, name: 'MODEL_UNAVAILABLE', description: 'Modelo de IA temporariamente indisponível' },
];

const statusColors: Record<number, string> = {
  4: '#f5a524',
  5: '#f31260',
};

export default function ErrorsPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Códigos de Erro</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Todos os erros seguem um formato consistente.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Formato de erro</h2>
      <CodeBlock
        language="json"
        code={`{
  "error": {
    "code": "PLAN_LIMIT_REACHED",
    "message": "Você atingiu o limite de 50 mensagens do plano Free.",
    "details": {
      "limit": 50,
      "used": 50,
      "resetAt": "2026-03-01T00:00:00Z"
    }
  }
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Referência</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden">
        {errors.map((err) => {
          const color = statusColors[Math.floor(err.code / 100)] ?? '#71717a';
          return (
            <div
              key={err.name}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-4 py-3 border-b border-[#3f3f46] last:border-b-0 bg-[#0f0f12]"
            >
              <span
                className="text-xs font-bold w-10 flex-shrink-0"
                style={{ color }}
              >
                {err.code}
              </span>
              <code
                className="text-xs font-mono flex-shrink-0"
                style={{ color }}
              >
                {err.name}
              </code>
              <span className="text-sm text-[#a1a1aa]">{err.description}</span>
            </div>
          );
        })}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Tratamento de erros</h2>
      <CodeBlock
        language="typescript"
        code={`const res = await fetch('https://api.teki.com.br/v1/chat', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${apiKey}\` },
  body: JSON.stringify({ message, agentId }),
});

if (!res.ok) {
  const { error } = await res.json();

  if (error.code === 'PLAN_LIMIT_REACHED') {
    console.log('Limite atingido. Faça upgrade do plano.');
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    const retryAfter = res.headers.get('Retry-After');
    console.log(\`Aguarde \${retryAfter}s e tente novamente.\`);
  } else {
    console.error(\`Erro \${res.status}: \${error.message}\`);
  }
  return;
}

const data = await res.json();`}
      />

      <NavPrevNext
        prev={{ label: 'Limites', href: '/docs/rate-limits' }}
      />
    </article>
  );
}
