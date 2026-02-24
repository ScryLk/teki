'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IconCircleCheck } from '@tabler/icons-react';

interface AuthSuccessMessageProps {
  message?: string | null;
}

export function AuthSuccessMessage({ message }: AuthSuccessMessageProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            <IconCircleCheck className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
