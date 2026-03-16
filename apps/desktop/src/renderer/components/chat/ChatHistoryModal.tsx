import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import type { ChatMessage } from '@/hooks/useChat';

interface ChatHistoryModalProps {
  messages: ChatMessage[];
  onClear: () => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ messages, onClear }) => {
  const setChatHistoryOpen = useAppStore((s) => s.setChatHistoryOpen);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatHistoryOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setChatHistoryOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) setChatHistoryOpen(false);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="w-[420px] max-h-[70vh] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Historico do Chat</h2>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={() => {
                  onClear();
                  setChatHistoryOpen(false);
                }}
                className="px-2.5 py-1 rounded-md text-xs text-error hover:bg-error/10 transition-colors"
              >
                Limpar chat
              </button>
            )}
            <button
              onClick={() => setChatHistoryOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-muted">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mb-3 opacity-40">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-xs">Nenhuma mensagem ainda</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 px-3 py-2 rounded-lg text-xs ${
                  msg.role === 'user'
                    ? 'bg-accent/5 border border-accent/10'
                    : 'bg-white/[0.02] border border-border'
                }`}
              >
                {/* Role badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <span
                    className={`inline-block w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-accent/15 text-accent'
                        : 'bg-emerald-500/15 text-emerald-400'
                    }`}
                  >
                    {msg.role === 'user' ? 'U' : 'T'}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary leading-relaxed line-clamp-3 break-words">
                    {msg.content || '...'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-muted">{formatTime(msg.timestamp)}</span>
                    {msg.image && (
                      <span className="text-[10px] text-text-muted flex items-center gap-0.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                        imagem
                      </span>
                    )}
                    {msg.provider && (
                      <span className="text-[10px] text-text-muted">{msg.provider}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-t border-border">
            <p className="text-[10px] text-text-muted text-center">
              {messages.length} mensage{messages.length === 1 ? 'm' : 'ns'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistoryModal;
