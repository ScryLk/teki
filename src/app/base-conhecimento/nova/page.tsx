'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { SolutionForm } from '@/components/base-conhecimento/SolutionForm';

export default function NovaSolucaoPage() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 lg:p-6 pb-8">
        <SolutionForm />
      </div>
    </ScrollArea>
  );
}
