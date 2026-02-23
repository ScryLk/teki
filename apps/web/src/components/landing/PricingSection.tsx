'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { IconCheck, IconStar } from '@tabler/icons-react';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'para sempre',
    description: 'Para experimentar o Teki',
    features: [
      { text: '1 agente de IA', pro: false },
      { text: '50 mensagens/mês', pro: false },
      { text: '2 documentos na KB', pro: false },
      { text: '5 MB de KB', pro: false },
      { text: '1 modelo — Gemini Flash', pro: false },
      { text: '7 dias de histórico', pro: false },
      { text: 'Web + Desktop', pro: false },
      { text: 'Visão de tela', pro: false },
    ],
    cta: { label: 'Começar grátis', href: '/register' },
    highlighted: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    period: '/mês',
    description: 'Para profissionais de TI',
    features: [
      { text: '1 agente de IA', pro: false },
      { text: '500 mensagens/mês', pro: false },
      { text: '5 documentos na KB', pro: false },
      { text: '25 MB de KB', pro: false },
      { text: '3 modelos — Gemini, GPT-4o Mini, Claude Haiku', pro: false },
      { text: 'Escolha de modelo por agente', pro: false },
      { text: '30 dias de histórico', pro: false },
      { text: 'Web + Desktop', pro: false },
      { text: 'Visão de tela', pro: false },
      { text: 'Suporte por email', pro: false },
    ],
    cta: { label: 'Assinar Starter', href: '/register?plan=starter' },
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    period: '/mês',
    badge: 'POPULAR',
    description: 'Para equipes de suporte',
    features: [
      { text: '5 agentes de IA', pro: true },
      { text: '2.000 mensagens/mês', pro: true },
      { text: '50 documentos na KB', pro: true },
      { text: '100 MB de KB', pro: true },
      { text: '7 modelos — Gemini, GPT-4o, Claude Sonnet, Ollama', pro: true },
      { text: 'BYOK — use sua própria chave de API', pro: true },
      { text: 'Histórico ilimitado', pro: true },
      { text: 'Web + Desktop', pro: false },
      { text: 'Visão de tela', pro: false },
      { text: 'WhatsApp, Telegram, Discord, Slack', pro: true },
      { text: 'Até 3 canais simultâneos', pro: true },
      { text: 'Onboarding guiado', pro: true },
      { text: 'Suporte prioritário', pro: true },
    ],
    cta: { label: 'Assinar Pro', href: '/register?plan=pro' },
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section id="planos" className="py-20 sm:py-28 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[#fafafa] mb-4">
            Escolha seu plano.
          </h2>
          <p className="text-[#a1a1aa]">Comece grátis. Upgrade quando precisar.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? 'border-[#2A8F9D] bg-[#18181b] shadow-xl shadow-[#2A8F9D]/10'
                  : 'border-[#3f3f46] bg-[#18181b]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold text-white bg-[#2A8F9D] px-3 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#fafafa] mb-1">{plan.name}</h3>
                <p className="text-xs text-[#71717a] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#fafafa]">
                    {plan.price === 0 ? 'R$ 0' : `R$ ${plan.price}`}
                  </span>
                  <span className="text-sm text-[#71717a]">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2">
                    {f.pro ? (
                      <IconStar size={15} className="text-[#2A8F9D] flex-shrink-0 mt-0.5" />
                    ) : (
                      <IconCheck size={15} className="text-[#2A8F9D] flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${f.pro ? 'text-[#fafafa] font-medium' : 'text-[#a1a1aa]'}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={`w-full text-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-[#2A8F9D] hover:bg-[#238490] text-white shadow-lg shadow-[#2A8F9D]/20'
                    : plan.id === 'free'
                    ? 'bg-transparent hover:bg-[#27272a] text-[#a1a1aa] border border-[#3f3f46]'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] border border-[#3f3f46]'
                }`}
              >
                {plan.cta.label}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8 text-sm text-[#71717a]"
        >
          🏢 Enterprise?{' '}
          <a href="mailto:contato@teki.com.br" className="text-[#2A8F9D] hover:underline">
            contato@teki.com.br
          </a>
          {' '}· Pagamento via Mercado Pago. Cancele quando quiser.
        </motion.p>
      </div>
    </section>
  );
}
