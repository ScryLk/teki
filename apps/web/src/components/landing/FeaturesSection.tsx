'use client';

import { motion } from 'framer-motion';
import {
  IconMessageChatbot,
  IconDeviceDesktop,
  IconCat,
  IconBolt,
  IconScan,
  IconClipboardList,
} from '@tabler/icons-react';

const features = [
  {
    icon: IconMessageChatbot,
    title: 'Chat IA Contextual',
    description:
      'Diagnósticos estruturados baseados em dados reais da empresa. Respostas com passos numerados e fontes citadas.',
  },
  {
    icon: IconDeviceDesktop,
    title: 'Screen Viewer',
    description:
      'Observa sua tela em tempo real e envia contexto visual para a IA. Captura configurável de 3s a 30s.',
  },
  {
    icon: IconCat,
    title: 'Gato Mascote',
    description:
      'Companheiro animado que reage: observando, pensando, feliz ou alertando sobre erros detectados.',
  },
  {
    icon: IconBolt,
    title: 'Busca Ultra-Rápida',
    description:
      'Resultados em menos de 50ms com Algolia. Base de conhecimento indexada e sempre atualizada.',
  },
  {
    icon: IconScan,
    title: 'Auto Contexto',
    description:
      'Detecta automaticamente o app ativo, versão do sistema e mensagens de erro na tela.',
  },
  {
    icon: IconClipboardList,
    title: 'Base de Conhecimento',
    description:
      'SOPs, tickets resolvidos, catálogo de sistemas e soluções validadas pela equipe.',
  },
];

export function FeaturesSection() {
  return (
    <section id="recursos" className="py-20 sm:py-28 px-4 bg-[#09090b]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-14"
        >
          Recursos
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-xl bg-[#18181b] border border-[#3f3f46] p-6 transition-all duration-300 hover:border-[#2A8F9D]/40 hover:shadow-lg hover:shadow-[#2A8F9D]/5 hover:scale-[1.02]"
            >
              <feature.icon size={40} className="text-[#2A8F9D] mb-4" stroke={1.5} />
              <h3 className="text-lg font-bold text-[#fafafa] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
