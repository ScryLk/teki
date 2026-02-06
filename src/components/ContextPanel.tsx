'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle, RotateCcw } from 'lucide-react';

export interface SupportContext {
  sistema: string;
  versao: string;
  ambiente: string;
  sistemaOperacional: string;
  mensagemErro: string;
  nivelTecnico: string;
}

interface ContextPanelProps {
  context: SupportContext;
  onChange: (context: SupportContext) => void;
}

const SISTEMAS = [
  { value: 'ERP Interno', label: 'ERP Interno' },
  { value: 'Microsoft Excel', label: 'Microsoft Excel' },
  { value: 'Microsoft Word', label: 'Microsoft Word' },
  { value: 'Microsoft Outlook', label: 'Microsoft Outlook' },
  { value: 'Microsoft Teams', label: 'Microsoft Teams' },
  { value: 'GLPI', label: 'GLPI' },
  { value: 'VPN Corporativa', label: 'VPN Corporativa' },
  { value: 'Active Directory', label: 'Active Directory' },
];

export function ContextPanel({ context, onChange }: ContextPanelProps) {
  const handleClear = () => {
    onChange({
      sistema: '',
      versao: '',
      ambiente: 'producao',
      sistemaOperacional: 'Windows 11',
      mensagemErro: '',
      nivelTecnico: context.nivelTecnico,
    });
  };

  return (
    <TooltipProvider>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Melhora a precisao das respostas
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleClear}
                >
                  <RotateCcw size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Limpar contexto</TooltipContent>
            </Tooltip>
          </div>

          <FieldLabel label="Sistema" tooltip="Sistema reportado pelo usuario">
            <Select
              value={context.sistema}
              onValueChange={(v) => onChange({ ...context, sistema: v })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Selecione o sistema..." />
              </SelectTrigger>
              <SelectContent>
                {SISTEMAS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldLabel>

          <FieldLabel label="Versao">
            <Input
              value={context.versao}
              onChange={(e) =>
                onChange({ ...context, versao: e.target.value })
              }
              placeholder="Ex: 2.5.0, 16.0.17328"
              className="h-9 text-sm"
            />
          </FieldLabel>

          <Separator />

          <FieldLabel label="Ambiente">
            <ToggleGroup
              type="single"
              value={context.ambiente}
              onValueChange={(v) => {
                if (v) onChange({ ...context, ambiente: v });
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="producao" size="sm" className="text-xs px-3">
                Prod
              </ToggleGroupItem>
              <ToggleGroupItem value="homologacao" size="sm" className="text-xs px-3">
                Homol
              </ToggleGroupItem>
              <ToggleGroupItem value="desenvolvimento" size="sm" className="text-xs px-3">
                Dev
              </ToggleGroupItem>
            </ToggleGroup>
          </FieldLabel>

          <FieldLabel label="Sistema Operacional">
            <Select
              value={context.sistemaOperacional}
              onValueChange={(v) =>
                onChange({ ...context, sistemaOperacional: v })
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Windows 11">Windows 11</SelectItem>
                <SelectItem value="Windows 10">Windows 10</SelectItem>
                <SelectItem value="macOS Sonoma">macOS Sonoma</SelectItem>
                <SelectItem value="Ubuntu 22.04">Ubuntu 22.04</SelectItem>
              </SelectContent>
            </Select>
          </FieldLabel>

          <Separator />

          <FieldLabel label="Mensagem de Erro" badge="opcional">
            <Textarea
              value={context.mensagemErro}
              onChange={(e) =>
                onChange({ ...context, mensagemErro: e.target.value })
              }
              placeholder="Cole a mensagem de erro exata aqui..."
              rows={3}
              className="text-xs font-mono resize-none"
            />
          </FieldLabel>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}

function FieldLabel({
  label,
  tooltip,
  badge,
  children,
}: {
  label: string;
  tooltip?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle size={10} className="text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        )}
        {badge && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}
