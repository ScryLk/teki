'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentForm } from '@/components/dashboard/AgentForm';
import { SystemPromptEditor } from '@/components/dashboard/SystemPromptEditor';
import { useState } from 'react';
import type { AgentFormData } from '@/types/agent';

export default function NewAgentPage() {
  const router = useRouter();
  const [systemPrompt, setSystemPrompt] = useState('');

  const handleCreate = async (data: AgentFormData) => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, systemPrompt: systemPrompt || data.systemPrompt }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao criar agente');
    }

    const agent = await res.json();
    router.push(`/dashboard/agents/${agent.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2">
            <ArrowLeft size={14} />
            Voltar
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Criar nova IA</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure o nome, comportamento e personalidade da sua IA
        </p>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <AgentForm
            initialData={{ systemPrompt }}
            onSubmit={handleCreate}
            submitLabel="Criar IA"
          />
        </TabsContent>

        <TabsContent value="prompt">
          <SystemPromptEditor value={systemPrompt} onChange={setSystemPrompt} />
          <p className="text-xs text-muted-foreground mt-3">
            O system prompt definido aqui será usado na aba &quot;Geral&quot; ao criar o agente.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
