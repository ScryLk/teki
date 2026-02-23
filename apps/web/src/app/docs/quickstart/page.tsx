import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Quickstart — Teki Docs',
};

export default function QuickstartPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Quickstart</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Primeira mensagem em 5 minutos.
      </p>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-[#fafafa] mb-3">
            <span className="text-[#2A8F9D] font-mono mr-2">1.</span>
            Obtenha sua API Key
          </h2>
          <p className="text-sm text-[#a1a1aa]">
            Acesse{' '}
            <a href="/settings/api" className="text-[#2A8F9D] hover:underline">
              teki.com.br/settings/api
            </a>{' '}
            e clique em <strong className="text-[#fafafa]">Gerar nova chave</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#fafafa] mb-3">
            <span className="text-[#2A8F9D] font-mono mr-2">2.</span>
            Envie uma mensagem
          </h2>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://api.teki.com.br/v1/chat \\
  -H "Authorization: Bearer tk_live_SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Como resetar a senha do AD?",
    "agentId": "default"
  }'`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#fafafa] mb-3">
            <span className="text-[#2A8F9D] font-mono mr-2">3.</span>
            Resposta
          </h2>
          <CodeBlock
            language="json"
            code={`{
  "id": "msg_abc123",
  "conversationId": "conv_xyz789",
  "content": "Para resetar a senha no Active Directory...",
  "sources": ["runbook-ad.pdf"],
  "model": "gemini-2.0-flash",
  "usage": {
    "messagesUsed": 1,
    "messagesLimit": 500,
    "messagesRemaining": 499
  }
}`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#fafafa] mb-3">
            <span className="text-[#2A8F9D] font-mono mr-2">4.</span>
            Com streaming (SSE)
          </h2>
          <p className="text-sm text-[#a1a1aa] mb-3">
            Adicione <code className="font-mono text-[#2A8F9D] bg-[#0f0f12] px-1.5 py-0.5 rounded text-xs">
              "stream": true
            </code>{' '}
            no body e use <code className="font-mono text-[#2A8F9D] bg-[#0f0f12] px-1.5 py-0.5 rounded text-xs">
              Accept: text/event-stream
            </code>.
          </p>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://api.teki.com.br/v1/chat \\
  -H "Authorization: Bearer tk_live_SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -H "Accept: text/event-stream" \\
  -d '{
    "message": "Explique o erro BSOD DRIVER_IRQL",
    "agentId": "default",
    "stream": true
  }'`}
          />
          <p className="text-sm text-[#a1a1aa] mt-3 mb-3">Resposta via SSE:</p>
          <CodeBlock
            language="text"
            code={`data: {"text": "O erro BSOD DRIVER_IRQL "}
data: {"text": "indica um driver com acesso "}
data: {"text": "de memória inválido..."}
data: [DONE]`}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#fafafa] mb-3">
            <span className="text-[#2A8F9D] font-mono mr-2">5.</span>
            Com imagem (visão de tela)
          </h2>
          <CodeBlock
            language="bash"
            code={`curl -X POST https://api.teki.com.br/v1/chat \\
  -H "Authorization: Bearer tk_live_SUA_CHAVE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "O que está errado nessa tela?",
    "agentId": "default",
    "screenshot": "<base64_da_imagem>",
    "screenshotMimeType": "image/png"
  }'`}
          />
        </section>
      </div>

      <NavPrevNext
        prev={{ label: 'Introdução', href: '/docs' }}
        next={{ label: 'Autenticação', href: '/docs/authentication' }}
      />
    </article>
  );
}
