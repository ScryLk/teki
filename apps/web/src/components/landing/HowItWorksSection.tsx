'use client';

import { motion } from 'framer-motion';
import { IconDownload, IconDatabase, IconHeadset } from '@tabler/icons-react';

const steps = [
  {
    number: 1,
    icon: IconDownload,
    title: 'Instale o Teki',
    description: 'Baixe e instale em 1 minuto. Windows, macOS ou Linux.',
  },
  {
    number: 2,
    icon: IconDatabase,
    title: 'Configure sua base',
    description: 'Conecte com Algolia Agent Studio e importe documentos, tickets e sistemas.',
  },
  {
    number: 3,
    icon: IconHeadset,
    title: 'Atenda',
    description: 'O gato observa sua tela, a IA diagnostica e você resolve.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 px-4 bg-[#0f0f12]">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-16"
        >
          Como funciona
        </motion.h2>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-7 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px border-t-2 border-dashed border-[#3f3f46]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col items-center text-center w-1/3 relative z-10"
            >
              <div className="w-14 h-14 rounded-full bg-[#2A8F9D]/15 border-2 border-[#2A8F9D] flex items-center justify-center mb-4">
                <step.icon size={24} className="text-[#2A8F9D]" />
              </div>
              <span className="text-xs font-jetbrains text-[#2A8F9D] mb-2">0{step.number}</span>
              <h3 className="text-lg font-bold text-[#fafafa] mb-2">{step.title}</h3>
              <p className="text-sm text-[#71717a] max-w-[220px]">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-8 relative">
          <div className="absolute left-7 top-0 bottom-0 w-px border-l-2 border-dashed border-[#3f3f46]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex gap-5 relative"
            >
              <div className="w-14 h-14 rounded-full bg-[#2A8F9D]/15 border-2 border-[#2A8F9D] flex items-center justify-center flex-shrink-0 z-10">
                <step.icon size={24} className="text-[#2A8F9D]" />
              </div>
              <div className="pt-1">
                <span className="text-xs font-jetbrains text-[#2A8F9D]">0{step.number}</span>
                <h3 className="text-lg font-bold text-[#fafafa] mb-1">{step.title}</h3>
                <p className="text-sm text-[#71717a]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
