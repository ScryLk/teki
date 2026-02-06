'use client';

import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  useCallback,
} from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Send, Loader2, User, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { SupportContext } from './ContextPanel';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAreaProps {
  context: SupportContext;
  onResponse?: (content: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function ChatArea({
  context,
  onResponse,
  messages,
  setMessages,
}: ChatAreaProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      const assistantId = crypto.randomUUID();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '' },
        ]);

        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'text-delta' && parsed.delta) {
                  fullContent += parsed.delta;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: fullContent }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore
              }
            }
          }
        }

        onResponse?.(fullContent);
      } catch (error) {
        console.error('Chat error:', error);
        setMessages((prev) => {
          const hasAssistant = prev.some((m) => m.id === assistantId);
          const errorMsg =
            'Erro ao processar sua solicitacao. Tente novamente.';
          if (hasAssistant) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: errorMsg } : m
            );
          }
          return [
            ...prev,
            { id: assistantId, role: 'assistant', content: errorMsg },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, context, onResponse, setMessages]
  );

  const quickSubmit = (text: string) => {
    setInput(text);
    setTimeout(() => textareaRef.current?.form?.requestSubmit(), 0);
  };

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Image src="/teki.png" alt="Teki" width={96} height={96} className="h-24 w-24 mb-4" />
            <h2 className="text-xl font-semibold mb-1">Teki</h2>
            <p className="text-sm text-muted-foreground mb-2">
              Assistente inteligente para suporte tecnico
            </p>
            <Badge variant="outline" className="mb-8 gap-1">
              Suporte inteligente com IA
            </Badge>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full">
              {[
                'Excel nao abre apos update',
                'VPN desconecta toda hora',
                'Usuario esqueceu a senha',
                'Impressora imprime em branco',
              ].map((text) => (
                <Card
                  key={text}
                  className="p-3 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => quickSubmit(text)}
                >
                  <p className="text-sm text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <Image src="/teki.png" alt="Teki" width={36} height={36} className="h-9 w-9 flex-shrink-0" />
              )}

              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border text-card-foreground'
                }`}
              >
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : message.content ? (
                  <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Search size={14} className="animate-pulse" />
                    <span className="text-sm">Analisando...</span>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    <User size={14} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t p-3 lg:p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Descreva o problema do usuario..."
            rows={1}
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-[44px] w-[44px] flex-shrink-0 bg-white text-black hover:bg-white/90"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </Button>
        </form>
        <p className="text-[11px] text-muted-foreground/50 text-center mt-2">
          Teki busca em documentacoes, tickets e sistemas para resolver problemas
        </p>
      </div>
    </main>
  );
}
