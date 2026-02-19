'use client';

import Link from 'next/link';
import { Plus, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentCard } from '@/components/dashboard/AgentCard';
import { useAgents } from '@/hooks/useAgent';

export default function DashboardPage() {
  const { agents, loading, error, deleteAgent } = useAgents();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold">Minha Própria IA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Crie e gerencie suas IAs personalizadas
          </p>
        </div>
        <Link href="/dashboard/agents/new">
          <Button size="sm" className="gap-1.5">
            <Plus size={14} />
            Nova IA
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <Bot size={28} className="text-muted-foreground" />
          </div>
          <h2 className="text-sm font-medium mb-1">Nenhuma IA criada</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Crie sua primeira IA personalizada para começar
          </p>
          <Link href="/dashboard/agents/new">
            <Button size="sm" className="gap-1.5">
              <Plus size={14} />
              Criar minha primeira IA
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onDelete={deleteAgent} />
          ))}
        </div>
      )}
    </div>
  );
}
