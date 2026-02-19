'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, MessageSquare, Loader2, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomChat } from '@/components/chat/CustomChat';
import { useAgent } from '@/hooks/useAgent';

interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: string;
  _count: { messages: number };
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function AgentChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { agent, loading: agentLoading } = useAgent(id);

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ConversationMessage[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch(`/api/agents/${id}/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConversations(false);
    }
  }, [id]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const loadConversation = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/agents/${id}/conversations/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConversationId(conversationId);
        setActiveMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setActiveMessages([]);
  };

  const handleConversationCreated = (newId: string) => {
    setActiveConversationId(newId);
    fetchConversations();
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/agents/${id}/conversations/${convId}`, { method: 'DELETE' });
    if (activeConversationId === convId) {
      startNewConversation();
    }
    fetchConversations();
  };

  if (agentLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Agente não encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r flex flex-col shrink-0">
          <div className="p-3 border-b flex items-center justify-between">
            <Link href={`/dashboard/agents/${id}`}>
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                <Settings size={12} />
                Config
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs h-7"
              onClick={startNewConversation}
            >
              <Plus size={12} />
              Nova
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-0.5">
              {loadingConversations ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhuma conversa
                </p>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`w-full text-left rounded-md px-2 py-1.5 text-xs transition-colors group flex items-center gap-1 ${
                      activeConversationId === conv.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <MessageSquare size={11} className="shrink-0" />
                    <span className="truncate flex-1">{conv.title || 'Sem título'}</span>
                    <button
                      onClick={(e) => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Trash2 size={11} className="text-destructive" />
                    </button>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 border-b flex items-center px-4 gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MessageSquare size={14} />
          </Button>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
              <ArrowLeft size={12} />
            </Button>
          </Link>
          <span className="text-sm font-medium truncate">{agent.name}</span>
        </div>

        <div className="flex-1 min-h-0">
          <CustomChat
            key={activeConversationId || 'new'}
            agentId={id}
            agentName={agent.name}
            conversationId={activeConversationId}
            initialMessages={activeMessages.map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }))}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  );
}
