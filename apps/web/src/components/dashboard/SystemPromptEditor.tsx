'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SYSTEM_PROMPT_TEMPLATES } from '@/types/agent';

interface SystemPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SystemPromptEditor({ value, onChange }: SystemPromptEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>System Prompt</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Defina as instruções, personalidade e comportamento da sua IA..."
          className="min-h-[300px] font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Templates rápidos</Label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SYSTEM_PROMPT_TEMPLATES).map(([key, template]) => (
            <Badge
              key={key}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => onChange(template.prompt)}
            >
              {template.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
