'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const testimonials = [
  {
    quote: 'O Teki cortou nosso tempo de resolução de tickets pela metade.',
    author: 'João Silva',
    role: 'Head de TI',
    company: 'TechCorp',
  },
  {
    quote: 'Adicionei no grupo de WhatsApp da equipe. Todo técnico pergunta direto ali.',
    author: 'Ana Santos',
    role: 'Coordenadora de TI',
    company: 'LogiSys',
  },
  {
    quote: 'A KB com os runbooks mudou tudo. O Teki responde com o procedimento certo na hora.',
    author: 'Pedro Oliveira',
    role: 'SysAdmin',
    company: 'DataCenter Sul',
  },
];

const stats = [
  { value: '500+', label: 'usuários' },
  { value: '10K+', label: 'mensagens/mês' },
  { value: '<15s', label: 'tempo de resposta' },
  { value: '4.8★', label: 'avaliação' },
];

function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (inView) setVisible(true);
  }, [inView]);

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={visible ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="text-3xl sm:text-4xl font-extrabold text-[#fafafa] mb-1"
      >
        {value}
      </motion.div>
      <div className="text-sm text-[#71717a]">{label}</div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 px-4 bg-[#0f0f12]">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl font-bold text-[#fafafa] text-center mb-14"
        >
          Quem usa, recomenda.
        </motion.h2>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-[#18181b] border border-[#3f3f46] rounded-xl p-6 hover:border-[#2A8F9D]/40 transition-colors"
            >
              <p className="text-2xl text-[#2A8F9D] mb-3 leading-none">"</p>
              <p className="text-sm text-[#a1a1aa] leading-relaxed mb-5">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2A8F9D]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#2A8F9D]">
                    {t.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#fafafa]">{t.author}</div>
                  <div className="text-xs text-[#71717a]">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 pt-10 border-t border-[#3f3f46]">
          {stats.map((s) => (
            <StatCounter key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
