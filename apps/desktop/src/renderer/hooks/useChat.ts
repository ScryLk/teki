import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { sendMessage, parseSSEStream } from '@/services/ai-service';
import type { ChatContext } from '@/services/ai-service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;       // base64
  imageMime?: string;   // e.g. image/png
}

export function useChat(model?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCatState = useAppStore((s) => s.setCatState);
  const activeWindow = useAppStore((s) => s.activeWindow);

  const buildContext = useCallback(async (): Promise<ChatContext> => {
    const context: ChatContext = {};
    const { watchedWindowName, currentFrame } = useAppStore.getState();

    if (watchedWindowName) {
      context.activeWindow = watchedWindowName;
    } else if (activeWindow) {
      context.activeWindow = activeWindow.title;
    }

    if (currentFrame) {
      context.screenshot = currentFrame;
    }

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
    async (text: string, image?: string, imageMime?: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        timestamp: Date.now(),
        image,
        imageMime,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setCatState('thinking');

      const assistantId = crypto.randomUUID();

      try {
        const context = await buildContext();

        // If user attached an image, include it in context
        if (image) {
          context.screenshot = image;
          context.screenshotMimeType = imageMime ?? 'image/png';
        }

        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await sendMessage(allMessages, context, model);

        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', content: '', timestamp: Date.now() },
        ]);

        let fullContent = '';
        for await (const chunk of parseSSEStream(response)) {
          fullContent += chunk;
          const current = fullContent;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m))
          );
        }

        setCatState('happy');
        setTimeout(() => setCatState('idle'), 3000);
      } catch (err) {
        console.error('Chat error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setCatState('alert');

        const errorContent = 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.';
        setMessages((prev) => {
          const hasAssistant = prev.some((m) => m.id === assistantId);
          if (hasAssistant) {
            return prev.map((m) => (m.id === assistantId ? { ...m, content: errorContent } : m));
          }
          return [...prev, { id: assistantId, role: 'assistant', content: errorContent, timestamp: Date.now() }];
        });

        setTimeout(() => setCatState('idle'), 5000);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, setCatState, buildContext, model]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setCatState('idle');
  }, [setCatState]);

  return { messages, isLoading, error, sendMessage: sendChatMessage, clearChat };
}
