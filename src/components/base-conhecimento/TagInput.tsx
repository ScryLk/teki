'use client';

import { useState, type KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Adicionar tag...',
}: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      onChange([...tags, tag]);
    }
    setInput('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        placeholder={placeholder}
        className="h-9 text-sm"
      />
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 text-xs cursor-pointer hover:bg-destructive/20"
              onClick={() => removeTag(tag)}
            >
              {tag}
              <X size={10} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
