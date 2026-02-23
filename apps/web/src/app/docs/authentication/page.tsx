import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Autenticação — Teki Docs',
};

export default function AuthenticationPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Autenticação</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        API keys para autenticar todas as requisições.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Tipos de chave</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          {
            prefix: 'tk_live_',
            name: 'Produção',
            description: 'Consome mensagens do seu plano. Use em produção.',
            color: '#2A8F9D',
          },
          {
            prefix: 'tk_test_',
            name: 'Teste',
            description: 'Não consome mensagens. Use em desenvolvimento.',
            color: '#71717a',
          },
        ].map((key) => (
          <div
            key={key.prefix}
            className="rounded-lg border border-[#3f3f46] bg-[#18181b] p-4"
          >
            <code
              className="text-xs font-mono px-2 py-0.5 rounded"
              style={{ color: key.color, backgroundColor: `${key.color}15` }}
            >
              {key.prefix}*
            </code>
            <p className="text-sm font-semibold text-[#fafafa] mt-2 mb-1">{key.name}</p>
            <p className="text-xs text-[#71717a]">{key.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Uso</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Inclua o header em todas as requisições:
      </p>
      <CodeBlock language="bash" code="Authorization: Bearer tk_live_abc123..." />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Exemplo em JavaScript</h2>
      <CodeBlock
        language="typescript"
        code={`const response = await fetch('https://api.teki.com.br/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.TEKI_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Como resolver erro de DNS?',
    agentId: 'default',
  }),
});`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Boas práticas</h2>
      <ul className="space-y-2 text-sm text-[#a1a1aa]">
        {[
          'Nunca exponha a API key no frontend (use variáveis de ambiente)',
          'Use chaves de teste durante o desenvolvimento',
          'Rotacione as chaves periodicamente em Settings → API',
          'Uma chave por ambiente (dev, staging, produção)',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-[#2A8F9D] mt-0.5 flex-shrink-0">→</span>
            {item}
          </li>
        ))}
      </ul>

      <NavPrevNext
        prev={{ label: 'Quickstart', href: '/docs/quickstart' }}
        next={{ label: 'Chat', href: '/docs/chat' }}
      />
    </article>
  );
}
