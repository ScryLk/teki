'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SolutionForm } from '@/components/base-conhecimento/SolutionForm';
import { KbFullForm } from '@/components/base-conhecimento/KbFullForm';

function NovaPageContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode === 'full_form') {
    return (
      <ScrollArea className="h-full">
        <div className="p-4 lg:p-6 pb-8">
          <KbFullForm />
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 lg:p-6 pb-8">
        <SolutionForm />
      </div>
    </ScrollArea>
  );
}

export default function NovaSolucaoPage() {
  return (
    <Suspense fallback={<div className="p-4">Carregando...</div>}>
      <NovaPageContent />
    </Suspense>
  );
}
