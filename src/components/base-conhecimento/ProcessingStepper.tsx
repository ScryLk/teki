'use client';

import {
  CheckCircle2,
  Loader2,
  XCircle,
  Upload,
  FileText,
  Database,
  CheckCheck,
} from 'lucide-react';
import type { SolutionStatus } from '@/lib/types';

interface ProcessingStepperProps {
  status: SolutionStatus;
  errorMessage?: string;
}

const STEPS = [
  { key: 'uploading', label: 'Upload', icon: Upload },
  { key: 'extracting', label: 'Extracao de texto', icon: FileText },
  { key: 'indexing', label: 'Indexacao', icon: Database },
  { key: 'indexed', label: 'Concluido', icon: CheckCheck },
] as const;

function getStepState(
  stepKey: string,
  currentStatus: SolutionStatus
): 'completed' | 'active' | 'pending' | 'error' {
  const order = ['uploading', 'extracting', 'indexing', 'indexed'];
  const currentIndex = order.indexOf(currentStatus);
  const stepIndex = order.indexOf(stepKey);

  if (currentStatus === 'error') {
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'error';
    return 'pending';
  }

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'active';
  return 'pending';
}

export function ProcessingStepper({
  status,
  errorMessage,
}: ProcessingStepperProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const state = getStepState(step.key, status);
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    state === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : state === 'active'
                        ? 'bg-primary/20 text-primary'
                        : state === 'error'
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {state === 'completed' ? (
                    <CheckCircle2 size={20} />
                  ) : state === 'active' ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : state === 'error' ? (
                    <XCircle size={20} />
                  ) : (
                    <step.icon size={18} />
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium text-center ${
                    state === 'completed'
                      ? 'text-emerald-400'
                      : state === 'active'
                        ? 'text-primary'
                        : state === 'error'
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mt-[-18px] ${
                    getStepState(STEPS[i + 1].key, status) !== 'pending'
                      ? 'bg-emerald-500/40'
                      : 'bg-muted'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {status === 'error' && errorMessage && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-xs text-destructive">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
