import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useAlgoliaChat } from '@/hooks/useAlgoliaChat';

const QUICK_SUGGESTIONS = [
  'Excel nao abre apos atualizacao do Windows',
  'VPN desconecta frequentemente',
  'Usuario esqueceu a senha do dominio',
  'Impressora de rede nao aparece no computador',
];

const ChatPanel: React.FC = () => {
  const { messages, isLoading, error, sendMessage, clearChat } =
    useAlgoliaChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendMessage(text);
  }, [input, sendMessage]);

  const handleQuickSuggestion = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleScreenshot = useCallback(async () => {
    try {
      const frame = await window.tekiAPI.captureNow();
      if (frame) {
        // Append screenshot context note to the input
        setInput(
          (prev) =>
            prev + (prev ? '\n' : '') + '[Screenshot da tela anexado]'
        );
      }
    } catch (err) {
      console.error('Screenshot capture failed:', err);
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Small teki cat icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6z" />
            <path d="M3 14V6l4 4" />
            <path d="M21 14V6l-4 4" />
            <circle cx="9" cy="14" r="1" fill="currentColor" />
            <circle cx="15" cy="14" r="1" fill="currentColor" />
            <path d="M12 17v-1" />
          </svg>
          <h2 className="text-sm font-semibold text-text-primary">Chat Teki</h2>
        </div>

        {/* Clear chat button (only when there are messages) */}
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md
                       text-xs text-text-muted
                       hover:bg-surface-hover hover:text-text-secondary
                       transition-colors"
            title="Limpar conversa"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          /* Empty state with quick suggestions */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            {/* Teki icon large */}
            <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              >
                <path d="M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6z" />
                <path d="M3 14V6l4 4" />
                <path d="M21 14V6l-4 4" />
                <circle cx="9" cy="14" r="1" fill="currentColor" />
                <circle cx="15" cy="14" r="1" fill="currentColor" />
                <path d="M12 17v-1" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              Ola! Sou o Teki
            </h3>
            <p className="text-sm text-text-muted mb-6 max-w-xs">
              Seu assistente de suporte tecnico com IA. Como posso ajudar?
            </p>

            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              {QUICK_SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  onClick={() => handleQuickSuggestion(text)}
                  className="text-left px-4 py-3 rounded-xl border border-border
                             bg-surface text-sm text-text-secondary
                             hover:bg-surface-hover hover:text-text-primary hover:border-accent/30
                             transition-colors"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-error/10 border-t border-error/20 flex-shrink-0">
          <p className="text-xs text-error">{error}</p>
        </div>
      )}

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onScreenshot={handleScreenshot}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatPanel;
