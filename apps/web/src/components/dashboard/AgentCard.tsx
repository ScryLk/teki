'use client';

import Link from 'next/link';
import { Bot, FileText, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Agent } from '@/types/agent';
import { useState } from 'react';

interface AgentCardProps {
  agent: Agent;
  onDelete: (id: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Bot size={20} className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
            {agent.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {agent.description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FileText size={12} />
            {agent._count?.documents ?? 0} documentos
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={12} />
            {agent._count?.conversations ?? 0} conversas
          </span>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Link href={`/dashboard/agents/${agent.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
            <Settings size={12} />
            Configurar
          </Button>
        </Link>
        <Link href={`/dashboard/agents/${agent.id}/chat`} className="flex-1">
          <Button size="sm" className="w-full gap-1.5 text-xs">
            <MessageSquare size={12} />
            Chat
          </Button>
        </Link>
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
              <Trash2 size={14} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir agente</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir &quot;{agent.name}&quot;? Esta ação não pode ser desfeita.
                Todos os documentos e conversas serão perdidos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(agent.id);
                  setConfirmOpen(false);
                }}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
