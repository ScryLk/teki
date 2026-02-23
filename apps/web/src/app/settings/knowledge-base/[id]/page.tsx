'use client';

import { use } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KnowledgeBaseForm } from '@/components/kb/KnowledgeBaseForm';

export default function EditKnowledgeBaseArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 lg:p-6 pb-8">
        <KnowledgeBaseForm articleId={id} />
      </div>
    </ScrollArea>
  );
}
