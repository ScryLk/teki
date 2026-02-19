'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SystemPromptEditor } from '@/components/dashboard/SystemPromptEditor';
import { KnowledgeBaseManager } from '@/components/dashboard/KnowledgeBaseManager';
import { useAgent } from '@/hooks/useAgent';

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { agent, loading, error, updateAgent } = useAgent(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description ?? '');
      setSystemPrompt(agent.systemPrompt);
      setModel(agent.model);
      setTemperature(agent.temperature);
      setMaxTokens(agent.maxTokens);
    }
  }, [agent]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateAgent({ name, description, systemPrompt, model, temperature, maxTokens });
      setSaveMsg('Salvo com sucesso');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error || 'Agente não encontrado'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 mb-2">
              <ArrowLeft size={14} />
              Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{agent.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure sua IA personalizada
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/agents/${id}/chat`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquare size={14} />
              Chat
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-1.5">
                <Trash2 size={14} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir agente</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir &quot;{agent.name}&quot;? Todos os documentos e conversas serão perdidos.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {saveMsg && (
        <div className={`mb-4 rounded-md p-2 text-xs ${saveMsg.includes('sucesso') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-destructive/10 border border-destructive/20 text-destructive'}`}>
          {saveMsg}
        </div>
      )}

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="kb">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da IA</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                  <SelectItem value="claude-haiku-4-20250414">Claude Haiku 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temperatura: {temperature.toFixed(1)}</Label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Preciso</span>
                <span>Criativo</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Tokens</Label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                min={256}
                max={8192}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompt">
          <SystemPromptEditor value={systemPrompt} onChange={setSystemPrompt} />
        </TabsContent>

        <TabsContent value="kb">
          <KnowledgeBaseManager agentId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
