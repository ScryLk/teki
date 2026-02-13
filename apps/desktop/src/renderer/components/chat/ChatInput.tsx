import React, { useRef, useCallback, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onScreenshot?: () => void;
  disabled?: boolean;
}

const MAX_ROWS = 4;
const LINE_HEIGHT = 20;
const PADDING = 24; // py-3 = 12px top + 12px bottom

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onScreenshot,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const maxHeight = LINE_HEIGHT * MAX_ROWS + PADDING;
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && value.trim()) {
          onSend();
        }
      }
    },
    [disabled, value, onSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleSendClick = useCallback(() => {
    if (!disabled && value.trim()) {
      onSend();
      textareaRef.current?.focus();
    }
  }, [disabled, value, onSend]);

  const handleScreenshotClick = useCallback(() => {
    if (onScreenshot && !disabled) {
      onScreenshot();
    }
  }, [onScreenshot, disabled]);

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border bg-bg">
      {/* Screenshot button */}
      {onScreenshot && (
        <button
          onClick={handleScreenshotClick}
          disabled={disabled}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg
                     border border-border bg-surface text-text-muted
                     hover:bg-surface-hover hover:text-text-secondary
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
          title="Capturar tela"
          type="button"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </button>
      )}

      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Descreva o problema tecnico..."
          rows={1}
          className="w-full resize-none rounded-lg border border-border bg-surface
                     text-sm text-text-primary placeholder-text-muted
                     px-4 py-3 pr-12
                     focus:outline-none focus:border-accent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
          style={{
            lineHeight: `${LINE_HEIGHT}px`,
            minHeight: LINE_HEIGHT + PADDING,
            maxHeight: LINE_HEIGHT * MAX_ROWS + PADDING,
          }}
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSendClick}
        disabled={disabled || !value.trim()}
        className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg
                   bg-accent text-text-primary
                   hover:bg-accent-hover
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
        title="Enviar mensagem"
        type="button"
      >
        {disabled ? (
          // Loading spinner
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        ) : (
          // Send arrow icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatInput;
