'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '3x', label: 'Mais rápido' },
  { value: '89%', label: 'Satisfação' },
  { value: '12k+', label: 'Tickets/mês' },
  { value: '-47%', label: 'Custo operacional' },
];

export function StatsSection() {
  return (
    <section className="relative z-[1] py-20 sm:py-28 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="rounded-[28px] bg-white/[0.03] border border-white/[0.05] p-6 sm:p-8 text-center transition-colors duration-400 hover:border-[#2A8F9D]/20"
          >
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-[#34D8C0] leading-none mb-2">
              {stat.value}
            </h3>
            <p className="text-xs text-[#4a5060] uppercase tracking-wider font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
