'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuthCardProps {
  children: React.ReactNode;
  /** Key used for AnimatePresence transitions between auth steps */
  step?: string;
  className?: string;
}

const cardVariants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
};

export function AuthCard({ children, step, className }: AuthCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className={cn(
          'relative w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-lg',
          className
        )}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
