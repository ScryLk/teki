'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Plus, Zap, FileText, FileEdit, MessageSquare, Lock } from 'lucide-react';
import type { InsertionMode } from '@/lib/kb/types';

interface KbInsertionDropdownProps {
  allowedModes: InsertionMode[];
  modeBadges: Partial<Record<InsertionMode, string>>;
  canCreate: boolean;
  articleCount: number;
  articleLimit: number;
  onSelectMode: (mode: InsertionMode) => void;
  onUpgradeClick: (requiredPlan: string) => void;
}

const MODE_CONFIG: Record<
  InsertionMode,
  { label: string; description: string; icon: typeof Zap }
> = {
  quick_add: { label: 'Quick Add', description: 'Cole ou digite a solução', icon: Zap },
  file_upload: { label: 'Upload de Arquivo', description: 'PDF, DOC, TXT, MD', icon: FileText },
  full_form: { label: 'Formulário Completo', description: 'Artigo detalhado com editor', icon: FileEdit },
  from_chat: { label: 'Salvar do Chat', description: 'Transformar atendimento', icon: MessageSquare },
};

const MODE_ORDER: InsertionMode[] = ['quick_add', 'file_upload', 'full_form', 'from_chat'];

export function KbInsertionDropdown({
  allowedModes,
  modeBadges,
  canCreate,
  articleCount,
  articleLimit,
  onSelectMode,
  onUpgradeClick,
}: KbInsertionDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          className="gap-1.5 bg-white text-black hover:bg-white/90"
          disabled={!canCreate}
          title={
            !canCreate
              ? `Limite de ${articleLimit} artigos atingido`
              : undefined
          }
        >
          <Plus size={14} />
          Novo Artigo
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        {MODE_ORDER.map((mode) => {
          const config = MODE_CONFIG[mode];
          const isAllowed = allowedModes.includes(mode);
          const badge = modeBadges[mode];
          const Icon = config.icon;

          return (
            <DropdownMenuItem
              key={mode}
              className="flex items-start gap-3 p-3 cursor-pointer"
              onClick={() => {
                if (isAllowed) {
                  onSelectMode(mode);
                } else if (badge) {
                  onUpgradeClick(badge);
                }
                setOpen(false);
              }}
            >
              <Icon
                size={18}
                className={`mt-0.5 flex-shrink-0 ${isAllowed ? 'text-foreground' : 'text-muted-foreground'}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${!isAllowed ? 'text-muted-foreground' : ''}`}
                  >
                    {config.label}
                  </span>
                  {badge && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 gap-0.5 uppercase tracking-wider"
                    >
                      <Lock size={8} />
                      {badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {config.description}
                </p>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
