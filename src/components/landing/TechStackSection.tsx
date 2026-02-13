'use client';

import { motion } from 'framer-motion';

const techs = [
  { name: 'Electron', color: '#47848F' },
  { name: 'React', color: '#61DAFB' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Tailwind CSS', color: '#06B6D4' },
  { name: 'Algolia', color: '#5468FF' },
  { name: 'Vercel', color: '#fafafa' },
];

export function TechStackSection() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-[#09090b]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-10"
        >
          Construído com
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {techs.map((tech) => (
            <div
              key={tech.name}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#18181b] border border-[#3f3f46] text-sm text-[#a1a1aa] transition-all duration-300 hover:border-[#3f3f46] hover:shadow-md"
              style={{
                ['--tech-color' as string]: tech.color,
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-shadow duration-300 group-hover:shadow-[0_0_8px_var(--tech-color)]"
                style={{ backgroundColor: tech.color }}
              />
              {tech.name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
