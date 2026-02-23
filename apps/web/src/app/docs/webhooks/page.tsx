import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Webhooks — Teki Docs',
};

const events = [
  { event: 'message.created', description: 'Nova mensagem enviada por um usuário' },
  { event: 'conversation.created', description: 'Nova conversa iniciada' },
  { event: 'document.processed', description: 'Documento da KB foi processado' },
  { event: 'agent.updated', description: 'Configurações de um agente foram alteradas' },
  { event: 'plan.limit.reached', description: 'Limite de mensagens do plano atingido' },
  { event: 'channel.linked', description: 'Canal (WhatsApp, etc.) vinculado com sucesso' },
];

export default function WebhooksPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Webhooks</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Receba notificações em tempo real sobre eventos da plataforma.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Eventos disponíveis</h2>
      <div className="rounded-lg border border-[#3f3f46] overflow-hidden mb-8">
        {events.map((ev) => (
          <div
            key={ev.event}
            className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 px-4 py-3 border-b border-[#3f3f46] last:border-b-0 bg-[#0f0f12]"
          >
            <code className="text-xs font-mono text-[#2A8F9D] flex-shrink-0">{ev.event}</code>
            <span className="text-sm text-[#a1a1aa]">{ev.description}</span>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Payload de exemplo</h2>
      <CodeBlock
        language="json"
        code={`{
  "event": "message.created",
  "timestamp": "2026-02-22T14:32:00Z",
  "data": {
    "id": "msg_abc123",
    "conversationId": "conv_xyz789",
    "agentId": "agent_net01",
    "channel": "whatsapp",
    "sender": "+5555999887766",
    "content": "O servidor caiu de novo"
  }
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Verificação de assinatura</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Cada webhook inclui o header{' '}
        <code className="font-mono text-xs text-[#2A8F9D]">X-Teki-Signature</code> com HMAC-SHA256
        do body usando seu <code className="font-mono text-xs text-[#2A8F9D]">webhookSecret</code>.
      </p>
      <CodeBlock
        language="typescript"
        code={`import crypto from 'crypto';

function verifyWebhook(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(\`sha256=\${expected}\`)
  );
}

// No seu handler:
app.post('/webhook', (req, res) => {
  const sig = req.headers['x-teki-signature'] as string;
  if (!verifyWebhook(req.rawBody, sig, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).send('Unauthorized');
  }
  // processar evento...
  res.sendStatus(200);
});`}
      />

      <NavPrevNext
        prev={{ label: 'Provider Keys', href: '/docs/provider-keys' }}
        next={{ label: 'Planos e Cobrança', href: '/docs/billing' }}
      />
    </article>
  );
}
