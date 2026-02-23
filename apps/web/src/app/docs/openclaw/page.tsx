import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'OpenClaw — Teki Docs',
};

export default function OpenClawPage() {
  return (
    <article>
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-3xl font-bold text-[#fafafa]">OpenClaw</h1>
        <span className="text-xs font-bold text-[#2A8F9D] bg-[#2A8F9D]/10 border border-[#2A8F9D]/30 px-2 py-0.5 rounded-full">
          PLANO PRO
        </span>
      </div>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Gateway open-source que conecta o Teki ao WhatsApp, Telegram, Discord e Slack.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Como funciona</h2>
      <div className="rounded-lg border border-[#3f3f46] bg-[#0f0f12] p-4 text-sm font-mono text-[#a1a1aa] mb-6">
        WhatsApp/Telegram → OpenClaw Gateway → Webhook → Teki API → Resposta
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Instalação</h2>
      <CodeBlock language="bash" code="npm install -g openclaw@latest" />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Configurar a skill Teki</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Crie o arquivo <code className="font-mono text-xs text-[#2A8F9D]">~/.openclaw/skills/teki-support/SKILL.md</code>:
      </p>
      <CodeBlock
        language="markdown"
        code={`# Teki Support

## Quando usar
Quando o usuário fizer perguntas de suporte técnico, reportar erros,
ou pedir ajuda com sistemas de TI.

## Webhook
POST https://teki.com.br/api/openclaw/webhook
Authorization: Bearer SEU_WEBHOOK_SECRET

## Payload
{
  "message": "{mensagem_do_usuario}",
  "sender": "{numero_ou_id}",
  "senderName": "{nome}",
  "channel": "{whatsapp|telegram|discord|slack}",
  "sessionKey": "{channel}:{sender}",
  "media": { "base64": "{imagem_base64}", "mimeType": "image/jpeg" }
}

## Resposta esperada
{ "response": "texto da resposta do Teki" }`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Vincular seu canal</h2>
      <ol className="space-y-4 text-sm text-[#a1a1aa] mb-6">
        <li className="flex gap-3">
          <span className="text-[#2A8F9D] font-bold flex-shrink-0">1.</span>
          Acesse{' '}
          <a href="/settings/channels" className="text-[#2A8F9D] hover:underline ml-1">
            teki.com.br/settings/channels
          </a>
        </li>
        <li className="flex gap-3">
          <span className="text-[#2A8F9D] font-bold flex-shrink-0">2.</span>
          Clique em &quot;Vincular canal&quot; e copie o código de 6 dígitos gerado
        </li>
        <li className="flex gap-3">
          <span className="text-[#2A8F9D] font-bold flex-shrink-0">3.</span>
          No WhatsApp, envie a mensagem: <code className="font-mono text-xs text-[#2A8F9D] bg-[#0f0f12] px-1.5 py-0.5 rounded ml-1">TEKI 123456</code>
        </li>
        <li className="flex gap-3">
          <span className="text-[#2A8F9D] font-bold flex-shrink-0">4.</span>
          Pronto! Seu canal está vinculado
        </li>
      </ol>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Payload com imagem</h2>
      <CodeBlock
        language="json"
        code={`{
  "message": "O que esse erro significa?",
  "sender": "+5555999887766",
  "senderName": "João",
  "channel": "whatsapp",
  "sessionKey": "whatsapp:+5555999887766",
  "media": {
    "base64": "/9j/4AAQSkZJRgABAQ...",
    "mimeType": "image/jpeg"
  }
}`}
      />

      <NavPrevNext
        prev={{ label: 'Base de Conhecimento', href: '/docs/knowledge-base' }}
        next={{ label: 'Webhooks', href: '/docs/webhooks' }}
      />
    </article>
  );
}
