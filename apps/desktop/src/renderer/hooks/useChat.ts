import { useState, useCallback } from 'react';
import { useAppStore } from '@/stores/app-store';
import { sendMessage } from '@/services/ai-service';
import type { ChatContext, ProviderId } from '@/services/ai-service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: string;       // base64
  imageMime?: string;   // e.g. image/png
  provider?: ProviderId;
  fallback?: boolean;
  failedProviders?: Array<{ provider: ProviderId; error: string }>;
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

        // KB RAG: search knowledge base and inject context
        try {
          const kbEnabled = await window.tekiAPI.getSetting<boolean>('kbEnabled');
          if (kbEnabled) {
            const kbResults = await window.tekiAPI.kbSearch(trimmed, 5);
            if (kbResults.length > 0) {
              const kbSnippets = kbResults
                .map((r, i) => `[${i + 1}] (${r.docName}) ${r.content}`)
                .join('\n\n');
              context.kbContext = `=== Contexto da Base de Conhecimento ===\nUse os trechos abaixo para enriquecer sua resposta, se relevantes:\n\n${kbSnippets}`;
            }
          }
        } catch {
          // KB search is optional, don't block chat
        }

        if (image) {
          context.screenshot = image;
          context.screenshotMimeType = imageMime ?? 'image/png';
        }

        const allMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const aiResponse = await sendMessage(allMessages, context, model);

        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            provider: aiResponse.provider,
            fallback: aiResponse.fallback,
            failedProviders: aiResponse.failedProviders,
          },
        ]);

        let fullContent = '';
        for await (const chunk of aiResponse.stream) {
          fullContent += chunk;
          const current = fullContent;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m))
          );
        }

        // Log AI interaction
        window.tekiAPI?.logAction('Interacao com IA', {
          provider: aiResponse.provider,
          model,
          fallback: aiResponse.fallback ?? false,
          hasScreenshot: !!context.screenshot,
          activeWindow: context.activeWindow,
          messageLength: trimmed.length,
          responseLength: fullContent.length,
        });

        setCatState('happy');
        setTimeout(() => setCatState('idle'), 3000);
      } catch (err) {
        console.error('Chat error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        setCatState('alert');

        // Log AI failure
        window.tekiAPI?.logAction('Falha na interacao com IA', {
          error: errorMessage,
          model,
        });

        const errorContent = 'Desculpe, todos os provedores de IA falharam. Verifique sua conexão ou configure uma chave de API nas configurações.';
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
