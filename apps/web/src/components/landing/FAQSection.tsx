'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';

const faqs = [
  {
    question: 'O Teki é gratuito?',
    answer:
      'O Teki tem um plano gratuito com 50 mensagens/mês, 1 agente e 2 documentos na KB. Para mais recursos, temos planos a partir de R$ 29/mês.',
  },
  {
    question: 'O Teki precisa de internet?',
    answer:
      'Sim. O Teki processa mensagens via Gemini API na nuvem. O app desktop funciona offline para inspeção de janelas, mas precisa de internet para respostas da IA.',
  },
  {
    question: 'Meus dados são seguros?',
    answer:
      'Seus documentos ficam na sua conta e não são compartilhados. Screenshots são processados e descartados — não armazenamos imagens das suas telas.',
  },
  {
    question: 'O que é OpenClaw?',
    answer:
      'OpenClaw é um gateway open-source que conecta o Teki aos seus apps de mensagens (WhatsApp, Telegram, Discord, Slack). Disponível no plano Pro.',
  },
  {
    question: 'Quais formatos de documento a KB aceita?',
    answer:
      'PDF, TXT, Markdown e DOCX. Tamanho máximo por arquivo: 10 MB.',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim. Sem multa, sem burocracia. O cancelamento é feito direto nas configurações da sua conta.',
  },
  {
    question: 'O Teki funciona em português?',
    answer:
      'Sim! O Teki foi feito para o mercado brasileiro. Respostas, interface e suporte — tudo em pt-BR.',
  },
];

function FAQItem({ faq }: { faq: (typeof faqs)[number] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#3f3f46] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-base font-medium text-[#fafafa] group-hover:text-[#2A8F9D] transition-colors pr-4">
          {faq.question}
        </span>
        <IconChevronDown
          size={18}
          className={`text-[#71717a] flex-shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-40 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-[#a1a1aa] leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-28 px-4 bg-[#0f0f12]">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-12"
        >
          Perguntas Frequentes
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-[#18181b] rounded-xl border border-[#3f3f46] px-6"
        >
          {faqs.map((faq) => (
            <FAQItem key={faq.question} faq={faq} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
