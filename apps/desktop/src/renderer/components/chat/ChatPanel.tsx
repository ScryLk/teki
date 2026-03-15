import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';
import { useAppStore } from '@/stores/app-store';
import { AVAILABLE_MODELS } from '@/services/ai-service';
import WindowPicker from '@/components/transcription/WindowPicker';
import TranscriptionPanel from '@/components/transcription/TranscriptionPanel';
import { useTranscription } from '@/hooks/useTranscription';
import { useTranscriptionStore } from '@/stores/transcription-store';

type ChatTab = 'chat' | 'transcription';

const TranscriptionError: React.FC = () => {
  const error = useTranscriptionStore((s) => s.error);
  const reset = useTranscriptionStore((s) => s.reset);
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        Erro na transcrição
      </h3>
      <p className="text-xs text-text-muted mb-4 max-w-xs">
        {error || 'Não foi possível iniciar a transcrição. Verifique se a chave da API Gemini está configurada em Configurações.'}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
};

const QUICK_SUGGESTIONS = [
  'Excel nao abre apos atualizacao do Windows',
  'VPN desconecta frequentemente',
  'Usuario esqueceu a senha do dominio',
  'Impressora de rede nao aparece no computador',
];

const ChatPanel: React.FC = () => {
  const selectedModel = useAppStore((s) => s.selectedModel);
  const setSelectedModel = useAppStore((s) => s.setSelectedModel);
  const userPlan = useAppStore((s) => s.userPlan);
  const { messages, isLoading, error, sendMessage, clearChat } =
    useChat(selectedModel);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedMime, setAttachedMime] = useState<string>('image/png');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const transcriptionStatus = useTranscriptionStore((s) => s.status);
  const { start: startTranscription, setSelectedSource } = useTranscription();

  const isPro = userPlan && ['PRO', 'ENTERPRISE'].includes(userPlan.toUpperCase());

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel) ?? AVAILABLE_MODELS[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text && !attachedImage) return;
    setInput('');
    sendMessage(text || 'Analise esta imagem.', attachedImage ?? undefined, attachedMime);
    setAttachedImage(null);
  }, [input, sendMessage, attachedImage, attachedMime]);

  const handleQuickSuggestion = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Tab selector */}
          <div className="flex items-center bg-bg rounded-lg border border-border p-0.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${activeTab === 'chat'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
                }`}
              title="Chat com IA"
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('transcription')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1
                ${activeTab === 'transcription'
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
                }`}
              title="Transcrição de chamadas em tempo real"
            >
              Transcrição
              {transcriptionStatus === 'recording' && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
              {!isPro && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-accent/20 text-accent font-bold ml-0.5">PRO</span>
              )}
            </button>
          </div>

          {/* Model selector (only in chat tab) */}
          {activeTab === 'chat' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-bg border border-border text-text-secondary
                         hover:text-text-primary hover:border-accent/40
                         transition-all"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: currentModel.provider === 'gemini' ? '#4285F4' : currentModel.provider === 'anthropic' ? '#D97757' : currentModel.provider === 'ollama' ? '#22c55e' : '#00d4ff' }}
              />
              {currentModel.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="opacity-50">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {modelDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-52 rounded-xl overflow-hidden z-50 shadow-xl"
                style={{ background: '#151921', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors
                      ${model.id === selectedModel
                        ? 'bg-accent/10 text-text-primary'
                        : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                      }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: model.provider === 'gemini' ? '#4285F4' : model.provider === 'anthropic' ? '#D97757' : model.provider === 'ollama' ? '#22c55e' : '#00d4ff' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium">{model.label}</div>
                      <div className="text-[10px] text-text-muted">{model.description}</div>
                    </div>
                    {model.id === selectedModel && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent flex-shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
        </div>

        {/* Clear chat button (only when there are messages in chat tab) */}
        {activeTab === 'chat' && messages.length > 0 && (
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

      {/* ── Chat tab content ── */}
      {activeTab === 'chat' && (
        <>
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
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
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>

          {error && (
            <div className="px-4 py-2 bg-error/10 border-t border-error/20 flex-shrink-0">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}

          <ChatInput
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onImageAttach={(base64, mime) => {
              setAttachedImage(base64);
              setAttachedMime(mime);
            }}
            onImageClear={() => setAttachedImage(null)}
            attachedImage={attachedImage}
            disabled={isLoading}
          />
        </>
      )}

      {/* ── Transcription tab content ── */}
      {activeTab === 'transcription' && (
        <div className="flex-1 overflow-hidden">
          {!isPro ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-1">
                Transcrição em Tempo Real
              </h3>
              <p className="text-sm text-text-muted mb-4 max-w-xs">
                Transcreva chamadas do Google Meet, Zoom, Teams e Discord com IA.
              </p>
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/20 text-accent">
                Disponível no plano PRO
              </span>
            </div>
          ) : transcriptionStatus === 'idle' || transcriptionStatus === 'selecting' ? (
            <WindowPicker
              onSelect={(source) => {
                setSelectedSource(source);
                startTranscription(source.id);
              }}
            />
          ) : transcriptionStatus === 'error' ? (
            <TranscriptionError />
          ) : (
            <TranscriptionPanel />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
