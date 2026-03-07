import React, { useRef, useCallback, useState } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onImageAttach?: (base64: string, mimeType: string) => void;
  onImageClear?: () => void;
  attachedImage?: string | null;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onImageAttach,
  onImageClear,
  attachedImage,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageAttach) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // result is "data:<mime>;base64,<data>"
        const mimeMatch = result.match(/^data:([^;]+);base64,/);
        const mime = mimeMatch?.[1] ?? 'image/png';
        const base64 = result.replace(/^data:[^;]+;base64,/, '');
        onImageAttach(base64, mime);
      };
      reader.readAsDataURL(file);

      // Reset so same file can be re-selected
      e.target.value = '';
    },
    [onImageAttach]
  );

  return (
    <div className="flex flex-col border-t border-border bg-bg">
      {/* Image preview */}
      {attachedImage && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative inline-block">
            <img
              src={`data:image/png;base64,${attachedImage}`}
              alt="Anexo"
              className="h-20 rounded-lg border border-border object-cover"
            />
            <button
              onClick={onImageClear}
              type="button"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                         bg-error text-white text-xs flex items-center justify-center
                         hover:bg-red-500 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 p-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image attach button */}
      {onImageAttach && (
        <button
          onClick={handleImageClick}
          disabled={disabled}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg
                     border border-border bg-surface text-text-muted
                     hover:bg-surface-hover hover:text-text-secondary
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors"
          title="Anexar imagem"
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
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Descreva o problema tecnico..."
        rows={1}
        className="flex-1 resize-none rounded-lg border border-border bg-surface
                   text-sm text-text-primary placeholder-text-muted
                   px-4
                   focus:outline-none focus:border-accent
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors
                   [overflow-y:scroll] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: 40, lineHeight: '20px', paddingTop: 10, paddingBottom: 10 }}
      />

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
    </div>
  );
};

export default ChatInput;
