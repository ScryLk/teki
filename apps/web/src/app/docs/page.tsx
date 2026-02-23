import { CodeBlock } from './components/CodeBlock';
import { NavPrevNext } from './components/NavPrevNext';

export const metadata = {
  title: 'Introdução — Teki Docs',
};

export default function DocsIntroduction() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Teki API</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Integre suporte técnico com IA no seu sistema.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">O que você pode fazer</h2>
      <ul className="space-y-2 text-[#a1a1aa] text-sm mb-8">
        {[
          'Enviar mensagens e receber respostas com streaming',
          'Criar e configurar agentes de IA personalizados',
          'Fazer upload de documentos para a base de conhecimento',
          'Gerenciar conversas e histórico',
          'Receber notificações via webhooks',
          'Integrar via OpenClaw (WhatsApp, Telegram, etc.)',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="text-[#2A8F9D] mt-0.5">✓</span>
            {item}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Base URL</h2>
      <CodeBlock language="bash" code="https://api.teki.com.br/v1" />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Autenticação</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Todas as requisições devem incluir o header de autenticação:
      </p>
      <CodeBlock language="bash" code="Authorization: Bearer tk_live_abc123..." />
      <p className="text-sm text-[#a1a1aa] mt-3">
        Gere sua API key em{' '}
        <a href="/settings/api" className="text-[#2A8F9D] hover:underline">
          teki.com.br/settings/api
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Formato de resposta</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Todas as respostas são JSON. Erros seguem o formato:
      </p>
      <CodeBlock
        language="json"
        code={`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key inválida ou expirada.",
    "details": null
  }
}`}
      />

      <NavPrevNext next={{ label: 'Quickstart', href: '/docs/quickstart' }} />
    </article>
  );
}
