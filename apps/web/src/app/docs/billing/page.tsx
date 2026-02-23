import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Planos e Cobrança — Teki Docs',
};

const endpoints = [
  { method: 'GET', path: '/v1/billing/plan', description: 'Consulta plano atual e uso' },
  { method: 'POST', path: '/v1/billing/subscribe', description: 'Assina ou faz upgrade de plano' },
  { method: 'POST', path: '/v1/billing/cancel', description: 'Cancela a assinatura' },
];

const methodColors: Record<string, string> = {
  GET: '#2A8F9D',
  POST: '#17c964',
};

const plans = [
  {
    name: 'Free',
    price: 'R$ 0',
    features: ['50 mensagens/mês', '1 agente', 'Gemini Flash', '2 documentos (5 MB)', 'Histórico 7 dias'],
    color: '#71717a',
  },
  {
    name: 'Starter',
    price: 'R$ 29/mês',
    features: ['500 mensagens/mês', '1 agente', '3 modelos (incluindo GPT-4o Mini, Claude Haiku)', '5 documentos (25 MB)', 'Histórico 30 dias'],
    color: '#2A8F9D',
  },
  {
    name: 'Pro',
    price: 'R$ 79/mês',
    features: ['2.000 mensagens/mês', '5 agentes', 'Todos os modelos + Ollama', '50 documentos (100 MB)', 'Histórico ilimitado', 'BYOK (chave própria)', '3 canais (WhatsApp, etc.)', 'OpenClaw'],
    color: '#F59E0B',
  },
];

export default function BillingPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Planos e Cobrança</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Gerencie sua assinatura e consulte o uso do plano via API.
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

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Planos disponíveis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-lg border border-[#3f3f46] bg-[#0f0f12] p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-lg font-bold"
                style={{ color: plan.color }}
              >
                {plan.name}
              </span>
            </div>
            <div className="text-2xl font-bold text-[#fafafa] mb-4">{plan.price}</div>
            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-[#a1a1aa]">
                  <span className="text-[#2A8F9D] mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Consultar plano atual</h2>
      <CodeBlock
        language="bash"
        code={`curl https://api.teki.com.br/v1/billing/plan \\
  -H "Authorization: Bearer tk_live_..."`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta</h2>
      <CodeBlock
        language="json"
        code={`{
  "plan": "STARTER",
  "expiresAt": "2026-03-22T00:00:00Z",
  "usage": {
    "period": "2026-02",
    "messages": 142,
    "messagesLimit": 500,
    "messagesRemaining": 358,
    "byokMessages": 23,
    "tokensIn": 45200,
    "tokensOut": 31800
  },
  "limits": {
    "agents": 1,
    "models": 3,
    "documents": 5,
    "kbSizeMb": 25,
    "historyDays": 30,
    "channels": 0
  }
}`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Assinar ou fazer upgrade</h2>
      <p className="text-sm text-[#a1a1aa] mb-3">
        Cria uma assinatura via MercadoPago. Retorna a URL de checkout para o pagamento:
      </p>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/billing/subscribe \\
  -H "Authorization: Bearer tk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "planId": "PRO"
  }'`}
      />
      <CodeBlock
        language="json"
        code={`{
  "checkoutUrl": "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_id=...",
  "planId": "PRO"
}`}
      />

      <div className="my-4 rounded-lg border border-[#f5a524]/30 bg-[#f5a524]/5 px-4 py-3">
        <p className="text-sm text-[#f5a524]">
          <strong>Nota:</strong> Após o pagamento, o plano é ativado automaticamente via webhook
          do MercadoPago. A atualização pode levar alguns segundos.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Cancelar assinatura</h2>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/billing/cancel \\
  -H "Authorization: Bearer tk_live_..."`}
      />
      <CodeBlock
        language="json"
        code={`{
  "message": "Assinatura cancelada. O plano continua ativo até 2026-03-22T00:00:00Z.",
  "planExpiresAt": "2026-03-22T00:00:00Z"
}`}
      />

      <p className="text-sm text-[#a1a1aa] mt-3 mb-6">
        O cancelamento mantém o plano ativo até o fim do período pago. Após a expiração,
        a conta é automaticamente rebaixada para o plano Free.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Monitorar uso via código</h2>
      <CodeBlock
        language="typescript"
        code={`const res = await fetch('https://api.teki.com.br/v1/billing/plan', {
  headers: { 'Authorization': \`Bearer \${process.env.TEKI_API_KEY}\` },
});

const { usage } = await res.json();

if (usage.messagesRemaining < 50) {
  console.warn(\`Atenção: restam apenas \${usage.messagesRemaining} mensagens.\`);
}

if (usage.messagesRemaining === 0) {
  console.error('Limite atingido. Faça upgrade ou aguarde o próximo período.');
}`}
      />

      <NavPrevNext
        prev={{ label: 'Webhooks', href: '/docs/webhooks' }}
        next={{ label: 'Limites', href: '/docs/rate-limits' }}
      />
    </article>
  );
}
