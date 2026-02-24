'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthBarProps {
  password: string;
}

type Strength = 0 | 1 | 2 | 3 | 4;

function calculateStrength(password: string): Strength {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score) as Strength;
}

const LABELS: Record<Strength, string> = {
  0: '',
  1: 'Fraca',
  2: 'Razoavel',
  3: 'Boa',
  4: 'Forte',
};

const COLORS: Record<Strength, string> = {
  0: 'bg-muted',
  1: 'bg-destructive',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {([1, 2, 3, 4] as const).map((level) => (
          <div
            key={level}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              strength >= level ? COLORS[strength] : 'bg-muted'
            )}
          />
        ))}
      </div>
      {strength > 0 && (
        <p
          className={cn(
            'text-xs',
            strength <= 1
              ? 'text-destructive'
              : strength <= 2
                ? 'text-orange-400'
                : strength <= 3
                  ? 'text-yellow-400'
                  : 'text-green-400'
          )}
        >
          {LABELS[strength]}
        </p>
      )}
    </div>
  );
}
