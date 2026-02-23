'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { KnowledgeBaseForm } from '@/components/kb/KnowledgeBaseForm';

export default function NewKnowledgeBaseArticlePage() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 lg:p-6 pb-8">
        <KnowledgeBaseForm />
      </div>
    </ScrollArea>
  );
}
