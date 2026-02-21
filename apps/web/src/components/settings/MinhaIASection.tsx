'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Lock, FileText, BookOpen, BarChart3 } from 'lucide-react';
import type { UserSettings } from '@/lib/settings-types';

interface MinhaIASectionProps {
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
}

export function MinhaIASection({ settings, onUpdate }: MinhaIASectionProps) {
  // Mock plan — will come from user session
  const currentPlanModels = ['claude-haiku-4-5-20251001'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Minha IA</h2>
        <p className="text-sm text-muted-foreground">
          Configure o comportamento do seu agente de IA.
        </p>
      </div>

      {/* Default model */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Modelo padrao</h3>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Modelo</Label>
            <Select
              value={settings.defaultModel}
              onValueChange={(value) => onUpdate({ defaultModel: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-haiku-4-5-20251001">
                  Claude Haiku 4.5
                </SelectItem>
                <SelectItem
                  value="claude-sonnet-4-5-20250929"
                  disabled={
                    !currentPlanModels.includes('claude-sonnet-4-5-20250929')
                  }
                >
                  Claude Sonnet 4.5
                </SelectItem>
              </SelectContent>
            </Select>

            {settings.defaultModel === 'claude-haiku-4-5-20251001' && (
              <p className="text-xs text-muted-foreground">
                Rapido e economico
              </p>
            )}

            {!currentPlanModels.includes('claude-sonnet-4-5-20250929') && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock size={12} />
                Claude Sonnet disponivel no plano Pro
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Behavior */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Comportamento</h3>

        <div className="space-y-5">
          {/* Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Temperatura</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {settings.defaultTemperature.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.defaultTemperature]}
              onValueChange={([value]) =>
                onUpdate({ defaultTemperature: value })
              }
              min={0}
              max={1}
              step={0.1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Preciso</span>
              <span>Criativo</span>
            </div>
          </div>

          <Separator />

          {/* Max tokens */}
          <div className="space-y-1.5">
            <Label className="text-xs">Max tokens</Label>
            <Select
              value={String(settings.defaultMaxTokens)}
              onValueChange={(value) =>
                onUpdate({ defaultMaxTokens: Number(value) })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512">512</SelectItem>
                <SelectItem value="1024">1024</SelectItem>
                <SelectItem value="2048">2048</SelectItem>
                <SelectItem value="4096">4096</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tamanho maximo da resposta
            </p>
          </div>

          <Separator />

          {/* Language */}
          <div className="space-y-1.5">
            <Label className="text-xs">Idioma</Label>
            <Select
              value={settings.responseLanguage}
              onValueChange={(value) =>
                onUpdate({ responseLanguage: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Portugues do Brasil</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Espanol</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Include sources */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">
                Incluir fontes nas respostas
              </Label>
              <p className="text-xs text-muted-foreground">
                Citar documentos da KB usados na resposta
              </p>
            </div>
            <Switch
              checked={settings.includeSourcesInChat}
              onCheckedChange={(checked) =>
                onUpdate({ includeSourcesInChat: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium">Atalhos</h3>

        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
            <FileText size={14} />
            Editar System Prompt
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
            <BookOpen size={14} />
            Gerenciar Knowledge Base
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
            <BarChart3 size={14} />
            Ver uso de mensagens
          </Button>
        </div>
      </div>
    </div>
  );
}
