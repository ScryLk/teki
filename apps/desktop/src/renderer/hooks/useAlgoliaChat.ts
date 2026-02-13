import { useState, useCallback, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { sendMessage, parseSSEStream } from '@/services/algolia';
import type { AlgoliaContext } from '@/services/algolia';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function useAlgoliaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const setCatState = useAppStore((s) => s.setCatState);
  const activeWindow = useAppStore((s) => s.activeWindow);

  const buildContext = useCallback(async (): Promise<AlgoliaContext> => {
    const context: AlgoliaContext = {};

    // Attach active window info
    if (activeWindow) {
      context.activeWindow = activeWindow.title;
    }

    // Check if auto-attach screenshot is enabled
    try {
      const autoAttach = await window.tekiAPI.getSetting<boolean>(
        'autoAttachScreenshot'
      );
      if (autoAttach) {
        const frame = await window.tekiAPI.captureNow();
        if (frame) {
          context.screenshot = frame.image;
        }
      }
    } catch {
      // Screenshot capture is optional, ignore errors
    }

    // Attach default system context from settings
    try {
      const [sistema, versao, ambiente] = await Promise.all([
        window.tekiAPI.getSetting<string>('defaultSistema'),
        window.tekiAPI.getSetting<string>('defaultVersao'),
        window.tekiAPI.getSetting<string>('defaultAmbiente'),
      ]);

      if (sistema) context.sistema = sistema;
      if (versao) context.versao = versao;
      if (ambiente) context.ambiente = ambiente;
    } catch {
      // Settings are optional
    }

    return context;
  }, [activeWindow]);

  const sendChatMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);

      // Add user message
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
        // Build context from environment
        const context = await buildContext();

        // Prepare all messages for the API
        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        // Make the API call
        const response = await sendMessage(allMessages, context);

        // Add empty assistant message that we'll stream into
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
          },
        ]);

        // Stream the response
        let fullContent = '';
        for await (const chunk of parseSSEStream(response)) {
          fullContent += chunk;
          const currentContent = fullContent;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: currentContent } : m
            )
          );
        }

        setCatState('happy');

        // Reset cat state after a brief moment
        setTimeout(() => {
          setCatState('idle');
        }, 3000);
      } catch (err) {
        console.error('Chat error:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setCatState('alert');

        // Add or update assistant message with error
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

        // Reset cat state after a brief moment
        setTimeout(() => {
          setCatState('idle');
        }, 5000);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, setCatState, buildContext]
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
