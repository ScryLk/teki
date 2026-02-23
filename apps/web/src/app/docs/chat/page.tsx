import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Chat — Teki Docs',
};

const requestFields = [
  { field: 'message', type: 'string', required: true, description: 'Texto da mensagem. Máximo 5000 caracteres.' },
  { field: 'agentId', type: 'string', required: true, description: 'ID do agente ou "default".' },
  { field: 'model', type: 'string', required: false, description: 'ID do modelo de IA. Default: gemini-flash. Ver /docs/models.' },
  { field: 'conversationId', type: 'string', required: false, description: 'Continuar uma conversa existente.' },
  { field: 'screenshot', type: 'string', required: false, description: 'Imagem base64 para análise visual.' },
  { field: 'screenshotMimeType', type: 'string', required: false, description: 'image/png ou image/jpeg.' },
  { field: 'stream', type: 'boolean', required: false, description: 'Ativa Server-Sent Events. Default: false.' },
];

export default function ChatPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Chat</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Envie mensagens e receba respostas da IA com suporte a histórico e visão de tela.
      </p>

      <div className="inline-flex items-center gap-2 mb-6">
        <span className="text-xs font-bold text-white bg-[#2A8F9D] px-2 py-0.5 rounded">POST</span>
        <code className="text-sm font-mono text-[#fafafa]">/v1/chat</code>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Parâmetros</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3f3f46] bg-[#18181b]">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Campo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Tipo</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Req.</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#71717a] uppercase">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3f3f46]">
            {requestFields.map((f) => (
              <tr key={f.field} className="bg-[#0f0f12]">
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-[#2A8F9D]">{f.field}</code>
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs font-mono text-[#71717a]">{f.type}</code>
                </td>
                <td className="px-4 py-2.5">
                  {f.required ? (
                    <span className="text-xs text-[#2A8F9D]">sim</span>
                  ) : (
                    <span className="text-xs text-[#71717a]">não</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-[#a1a1aa]">{f.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta (sem streaming)</h2>
      <CodeBlock
        language="json"
        code={`{
  "id": "msg_abc123",
  "conversationId": "conv_xyz789",
  "content": "Para resetar a senha no AD...",
  "sources": ["runbook-ad.pdf", "kb-windows.pdf"],
  "model": "gemini-2.0-flash",
  "usage": {
    "messagesUsed": 12,
    "messagesLimit": 500,
    "messagesRemaining": 488
  }
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta (com streaming)</h2>
      <CodeBlock
        language="text"
        code={`data: {"text": "Para resetar "}
data: {"text": "a senha no "}
data: {"text": "Active Directory..."}
data: [DONE]`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Exemplo com imagem</h2>
      <CodeBlock
        language="typescript"
        code={`import fs from 'fs';

const screenshot = fs.readFileSync('./erro.png').toString('base64');

const res = await fetch('https://api.teki.com.br/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.TEKI_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'O que está errado nessa tela?',
    agentId: 'default',
    screenshot,
    screenshotMimeType: 'image/png',
  }),
});

const data = await res.json();
console.log(data.content);`}
      />

      <NavPrevNext
        prev={{ label: 'Autenticação', href: '/docs/authentication' }}
        next={{ label: 'Modelos', href: '/docs/models' }}
      />
    </article>
  );
}
