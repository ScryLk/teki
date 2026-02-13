import React from 'react';
import ReactMarkdown from 'react-markdown';
import SourceBadge from './SourceBadge';
import type { ChatMessage } from '@/hooks/useAlgoliaChat';

interface Source {
  index: string;
  title: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  sources?: Source[];
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Cat icon for assistant avatar
const TekiAvatar: React.FC = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-light flex items-center justify-center">
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-accent"
    >
      {/* Cat face */}
      <path d="M12 22c4.97 0 9-2.69 9-6v-2c0-3.31-4.03-6-9-6s-9 2.69-9 6v2c0 3.31 4.03 6 9 6z" />
      {/* Left ear */}
      <path d="M3 14V6l4 4" />
      {/* Right ear */}
      <path d="M21 14V6l-4 4" />
      {/* Left eye */}
      <circle cx="9" cy="14" r="1" fill="currentColor" />
      {/* Right eye */}
      <circle cx="15" cy="14" r="1" fill="currentColor" />
      {/* Nose */}
      <path d="M12 17v-1" />
    </svg>
  </div>
);

// User icon for user avatar
const UserAvatar: React.FC = () => (
  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-secondary"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </div>
);

// Loading dots indicator
const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5 py-1">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-text-muted animate-pulse"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <span className="text-sm text-text-muted">Analisando...</span>
  </div>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sources }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Assistant avatar (left) */}
      {!isUser && <TekiAvatar />}

      <div className="flex flex-col max-w-[85%] min-w-0">
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-accent text-text-primary rounded-br-md'
              : 'bg-surface border border-border text-text-primary rounded-bl-md'
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          ) : message.content ? (
            <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <ThinkingIndicator />
          )}
        </div>

        {/* Sources (assistant only) */}
        {!isUser && sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 px-1">
            {sources.map((source, i) => (
              <SourceBadge key={i} index={source.index} title={source.title} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span
          className={`text-[10px] text-text-muted mt-1 ${
            isUser ? 'text-right pr-1' : 'pl-1'
          }`}
        >
          {formatTimestamp(message.timestamp)}
        </span>
      </div>

      {/* User avatar (right) */}
      {isUser && <UserAvatar />}
    </div>
  );
};

export default MessageBubble;
