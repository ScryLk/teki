'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';

const faqs = [
  {
    question: 'O Teki é gratuito?',
    answer:
      'Sim, o Teki é open source e totalmente gratuito. O código está disponível no GitHub sob licença MIT.',
  },
  {
    question: 'Preciso de conta no Algolia?',
    answer:
      'Sim, você precisa de uma conta no Algolia Agent Studio para utilizar a busca inteligente e o agente de IA. O Algolia oferece um plano gratuito que é suficiente para começar.',
  },
  {
    question: 'Quais sistemas operacionais são suportados?',
    answer:
      'Windows 10 ou superior, macOS 12 (Monterey) ou superior, e Linux (Ubuntu 20.04+, Debian 11+, Fedora 36+ e outras distribuições baseadas em .deb).',
  },
  {
    question: 'Meus dados são seguros?',
    answer:
      'O Teki roda localmente na sua máquina. Os dados só são enviados para o Algolia Agent Studio quando você faz uma consulta. Nenhum dado de tela é armazenado permanentemente.',
  },
  {
    question: 'Posso usar minha própria base de conhecimento?',
    answer:
      'Sim! Você pode importar documentos (PDF, DOCX), tickets resolvidos e informações de sistemas nos índices do Algolia Agent Studio. A base é totalmente customizável.',
  },
  {
    question: 'O gato é obrigatório?',
    answer:
      'Não, mas ele é o melhor colega de suporte que você vai ter. Sério, ele reage ao estado do sistema e deixa o atendimento mais leve.',
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
