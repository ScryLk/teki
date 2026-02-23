import { useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { sendMessage, parseAnthropicStream } from '@/services/anthropic';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function useAnthropicChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setCatState = useAppStore((s) => s.setCatState);

  const sendChatMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setCatState('thinking');

      const assistantId = crypto.randomUUID();

      try {
        // Grab the latest screenshot and window name from the store
        const { currentFrame, watchedWindowName } = useAppStore.getState();

        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendMessage(
          allMessages,
          currentFrame,
          watchedWindowName
        );

        // Add empty assistant bubble to stream into
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
          },
        ]);

        let fullContent = '';
        for await (const chunk of parseAnthropicStream(response)) {
          fullContent += chunk;
          const current = fullContent;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: current } : m
            )
          );
        }

        setCatState('happy');
        setTimeout(() => setCatState('idle'), 3000);
      } catch (err) {
        console.error('Chat error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setCatState('alert');

        const errorContent =
          'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
        setMessages((prev) => {
          const hasAssistant = prev.some((m) => m.id === assistantId);
          if (hasAssistant) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: errorContent } : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: 'assistant',
              content: errorContent,
              timestamp: Date.now(),
            },
          ];
        });

        setTimeout(() => setCatState('idle'), 5000);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, setCatState]
  );

  const clearChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setCatState('idle');
  }, [setCatState]);

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendChatMessage,
    clearChat,
  };
}
