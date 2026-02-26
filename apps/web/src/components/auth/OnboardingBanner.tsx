'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface OnboardingBannerProps {
  onboardingStep: number;
  messageCount: number;
  userName?: string | null;
}

export function OnboardingBanner({
  onboardingStep,
  messageCount,
  userName,
}: OnboardingBannerProps) {
  const { update } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (dismissed || onboardingStep < 0) return null;

  const handleSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/v1/user/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      await update();
      setDismissed(true);
    } catch {
      // Silently fail — not critical
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => handleSubmit({ skip: 'true' });

  // Step 0: Ask about AI tone preference
  if (onboardingStep === 0) {
    return (
      <div className="border-b border-[#27272a] bg-[#0f0f12] px-4 py-3">
        <div className="flex items-start justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex-1 space-y-2">
            <p className="text-sm text-[#e4e4e7]">
              Bem-vindo ao Teki! Pra te ajudar melhor:
            </p>
            <p className="text-xs text-[#a1a1aa]">
              Como prefere as respostas?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-[#18181b] border-[#3f3f46] hover:border-[#2A8F9D] hover:text-[#2A8F9D]"
                onClick={() => handleSubmit({ aiTone: 'tecnico_direto' })}
                disabled={isSubmitting}
              >
                Tecnico e direto
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-[#18181b] border-[#3f3f46] hover:border-[#2A8F9D] hover:text-[#2A8F9D]"
                onClick={() => handleSubmit({ aiTone: 'didatico' })}
                disabled={isSubmitting}
              >
                Didatico
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs bg-[#18181b] border-[#3f3f46] hover:border-[#2A8F9D] hover:text-[#2A8F9D]"
                onClick={() => handleSubmit({ aiTone: 'formal' })}
                disabled={isSubmitting}
              >
                Formal
              </Button>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-[#52525b] hover:text-[#a1a1aa] transition-colors mt-0.5"
            title="Pular"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Ask about area (after 5+ messages)
  if (onboardingStep === 1 && messageCount >= 5) {
    return (
      <div className="border-b border-[#27272a] bg-[#0f0f12] px-4 py-3">
        <div className="flex items-start justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex-1 space-y-2">
            <p className="text-xs text-[#a1a1aa]">
              Qual sua area principal?
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'infra', label: 'Infra' },
                { value: 'dev', label: 'Dev' },
                { value: 'suporte', label: 'Suporte' },
                { value: 'redes', label: 'Redes' },
                { value: 'banco_dados', label: 'DB' },
                { value: 'outro', label: 'Outro' },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  size="sm"
                  variant="outline"
                  className="text-xs bg-[#18181b] border-[#3f3f46] hover:border-[#2A8F9D] hover:text-[#2A8F9D]"
                  onClick={() => handleSubmit({ area: value })}
                  disabled={isSubmitting}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-[#52525b] hover:text-[#a1a1aa] transition-colors mt-0.5"
            title="Pular"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Ask for name (if name is null and 10+ messages)
  if (onboardingStep === 2 && !userName && messageCount >= 10) {
    return (
      <div className="border-b border-[#27272a] bg-[#0f0f12] px-4 py-3">
        <div className="flex items-start justify-between gap-4 max-w-3xl mx-auto">
          <form
            className="flex-1 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('name') as HTMLInputElement;
              if (input.value.trim()) {
                handleSubmit({ name: input.value.trim() });
              }
            }}
          >
            <span className="text-xs text-[#a1a1aa] whitespace-nowrap">
              Como podemos te chamar?
            </span>
            <input
              name="name"
              type="text"
              className="flex-1 h-8 px-3 text-xs bg-[#18181b] border border-[#3f3f46] rounded-md text-white focus:border-[#2A8F9D] focus:outline-none"
              placeholder="Seu nome"
            />
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-[#2A8F9D] hover:bg-[#237f8b]"
              disabled={isSubmitting}
            >
              Salvar
            </Button>
          </form>
          <button
            onClick={handleSkip}
            className="text-[#52525b] hover:text-[#a1a1aa] transition-colors mt-0.5"
            title="Pular"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
