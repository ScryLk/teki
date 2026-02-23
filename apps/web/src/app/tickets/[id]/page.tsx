'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Loader2,
  Send,
  Bot,
  User,
  Monitor,
  MessageSquare,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from 'lucide-react';
import { AiResponseDisplay } from '@/components/tickets/AiResponseDisplay';

interface TicketDetail {
  id: string;
  ticketNumber: string;
  category: string;
  subcategory: string | null;
  status: string;
  priority: string;
  summary: string;
  description: string | null;
  contextJson: Record<string, unknown>;
  categoryFieldsJson: Record<string, unknown> | null;
  errorJson: { code?: string; message?: string } | null;
  aiResponseJson: Record<string, unknown> | null;
  aiConfidence: string | null;
  aiSource: string | null;
  stepsToReproduce: string[];
  frequency: string | null;
  impact: string | null;
  resolutionNotes: string | null;
  resolutionCategory: string | null;
  createdAt: string;
  resolvedAt: string | null;
  client: { id: string; name: string; email: string | null; document: string | null; contractPlan: string | null; softwareVersion: string | null; environmentJson: Record<string, unknown> | null };
  attendant: { id: string; name: string; email: string };
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  senderType: string;
  senderId: string | null;
  content: string;
  aiResponseRaw: Record<string, unknown> | null;
  internal: boolean;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  waiting_client: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  waiting_internal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const statusLabels: Record<string, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting_client: 'Aguardando cliente',
  waiting_internal: 'Aguardando interno',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [askingAi, setAskingAi] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [showResolve, setShowResolve] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionCategory, setResolutionCategory] = useState('');

  const fetchTicket = useCallback(async () => {
    const res = await fetch(`/api/tickets/${id}`);
    if (res.ok) {
      setTicket(await res.json());
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);

    const res = await fetch(`/api/tickets/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMessage, senderType: 'attendant' }),
    });

    if (res.ok) {
      setNewMessage('');
      fetchTicket();
    }
    setSendingMessage(false);
  };

  const askAi = async () => {
    if (!aiQuery.trim()) return;
    setAskingAi(true);

    const res = await fetch('/api/ai/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticketId: id, query: aiQuery }),
    });

    if (res.ok) {
      setAiQuery('');
      fetchTicket();
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao consultar IA');
    }
    setAskingAi(false);
  };

  const resolveTicket = async () => {
    const res = await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'resolved',
        resolutionNotes: resolutionNotes || null,
        resolutionCategory: resolutionCategory || null,
      }),
    });

    if (res.ok) {
      setShowResolve(false);
      fetchTicket();
    }
  };

  const updateStatus = async (status: string) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchTicket();
  };

  const sendFeedback = async (helpful: boolean) => {
    if (!ticket?.aiResponseJson) return;
    await fetch('/api/kb/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: '',
        ticketId: ticket.id,
        helpful,
      }),
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando ticket...</div>;
  }

  if (!ticket) {
    return <div className="text-center py-12 text-muted-foreground">Ticket não encontrado.</div>;
  }

  const env = ticket.client.environmentJson ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground">{ticket.ticketNumber}</span>
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {statusLabels[ticket.status] ?? ticket.status}
            </Badge>
          </div>
          <h1 className="text-xl font-bold">{ticket.summary}</h1>
        </div>
        <div className="flex gap-2">
          {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
            <>
              <Select value={ticket.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em andamento</SelectItem>
                  <SelectItem value="waiting_client">Aguardando cliente</SelectItem>
                  <SelectItem value="waiting_internal">Aguardando interno</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => setShowResolve(true)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Resolver
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Messages */}
        <div className="lg:col-span-2 space-y-4">
          {/* Resolve Form */}
          {showResolve && (
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-lg text-green-400">Resolver Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Notas de resolução</Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Descreva como o problema foi resolvido..."
                    rows={3}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Categoria da resolução</Label>
                  <Select value={resolutionCategory} onValueChange={setResolutionCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="config">Configuração</SelectItem>
                      <SelectItem value="user_error">Erro do usuário</SelectItem>
                      <SelectItem value="environment">Ambiente</SelectItem>
                      <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                      <SelectItem value="feature_request">Solicitação de recurso</SelectItem>
                      <SelectItem value="duplicate">Duplicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={resolveTicket}>Confirmar Resolução</Button>
                  <Button variant="outline" onClick={() => setShowResolve(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Response (if exists on ticket) */}
          {ticket.aiResponseJson && (
            <AiResponseDisplay
              response={ticket.aiResponseJson}
              confidence={ticket.aiConfidence}
              source={ticket.aiSource}
              onFeedback={sendFeedback}
            />
          )}

          {/* AI Ask */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Consultar IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Faça uma pergunta sobre este ticket para a IA analisar..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                rows={2}
              />
              <Button onClick={askAi} disabled={askingAi || !aiQuery.trim()}>
                {askingAi ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Consultar IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Messages Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.internal ? 'opacity-60' : ''}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {msg.senderType === 'attendant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {msg.senderType === 'client' && (
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-green-400" />
                      </div>
                    )}
                    {msg.senderType === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-400" />
                      </div>
                    )}
                    {msg.senderType === 'system' && (
                      <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{msg.senderType}</span>
                      {msg.internal && (
                        <Badge variant="outline" className="text-xs">Nota interna</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              <Separator />

              {/* New Message */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escrever mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={2}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      sendMessage();
                    }
                  }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={sendingMessage || !newMessage.trim()}
                  size="icon"
                  className="self-end"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Context */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{ticket.client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Atendente</span>
                <span className="font-medium">{ticket.attendant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoria</span>
                <span className="font-medium">{ticket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prioridade</span>
                <Badge variant="outline" className="text-xs capitalize">{ticket.priority}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Criado</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolvido</span>
                  <span>{new Date(ticket.resolvedAt).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment */}
          {Object.keys(env).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ambiente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {'os' in env && env.os ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SO</span>
                    <span>{String(env.os)}</span>
                  </div>
                ) : null}
                {'runtime' in env && env.runtime ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Runtime</span>
                    <span>{String(env.runtime)}</span>
                  </div>
                ) : null}
                {'database' in env && env.database ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Banco</span>
                    <span>
                      {String((env.database as Record<string, unknown>)?.engine ?? '')} {String((env.database as Record<string, unknown>)?.version ?? '')}
                    </span>
                  </div>
                ) : null}
                {ticket.client.softwareVersion && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versão Software</span>
                    <span>{ticket.client.softwareVersion}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Error Info */}
          {ticket.errorJson && (ticket.errorJson.code || ticket.errorJson.message) && (
            <Card className="border-red-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Erro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {ticket.errorJson.code && (
                  <div>
                    <span className="text-muted-foreground">Código: </span>
                    <code className="bg-red-500/10 px-1 rounded">{ticket.errorJson.code}</code>
                  </div>
                )}
                {ticket.errorJson.message && (
                  <div className="whitespace-pre-wrap text-red-300">{ticket.errorJson.message}</div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category Fields */}
          {ticket.categoryFieldsJson && Object.keys(ticket.categoryFieldsJson).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Campos da Categoria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {Object.entries(ticket.categoryFieldsJson).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}</span>
                    <span className="text-right max-w-[60%] truncate">{String(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Resolution */}
          {ticket.resolutionNotes && (
            <Card className="border-green-500/20">
              <CardHeader>
                <CardTitle className="text-sm text-green-400">Resolução</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs">
                {ticket.resolutionCategory && (
                  <Badge variant="outline" className="mb-2">{ticket.resolutionCategory}</Badge>
                )}
                <p className="whitespace-pre-wrap">{ticket.resolutionNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
