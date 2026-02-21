'use client';

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
import { Moon, Sun, Laptop } from 'lucide-react';
import type { UserSettings } from '@/lib/settings-types';

interface AparenciaSectionProps {
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
}

const ACCENT_COLORS = [
  { id: 'teal' as const, label: 'Teal', color: 'bg-teal-500' },
  { id: 'blue' as const, label: 'Azul', color: 'bg-blue-500' },
  { id: 'purple' as const, label: 'Roxo', color: 'bg-purple-500' },
  { id: 'green' as const, label: 'Verde', color: 'bg-green-500' },
];

const THEME_OPTIONS = [
  {
    id: 'dark' as const,
    label: 'Escuro',
    icon: Moon,
  },
  {
    id: 'light' as const,
    label: 'Claro',
    icon: Sun,
  },
  {
    id: 'system' as const,
    label: 'Sistema',
    description: 'Acompanha o tema do SO',
    icon: Laptop,
  },
];

export function AparenciaSection({ settings, onUpdate }: AparenciaSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Aparencia</h2>
        <p className="text-sm text-muted-foreground">
          Personalize a interface do Teki.
        </p>
      </div>

      {/* Theme */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Tema</h3>

        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => {
            const isActive = settings.theme === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onUpdate({ theme: option.id })}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:bg-accent/50'
                }`}
              >
                <option.icon size={20} />
                <span className="text-xs font-medium">{option.label}</span>
                {option.description && (
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">
                    {option.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cat mascot */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Gato Mascote</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Mostrar gato</Label>
            </div>
            <Switch
              checked={settings.showCat}
              onCheckedChange={(checked) => onUpdate({ showCat: checked })}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Tamanho</Label>
            <Select
              value={settings.catSize}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                onUpdate({ catSize: value })
              }
              disabled={!settings.showCat}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Animacoes</Label>
              <p className="text-xs text-muted-foreground">
                Respiracao, piscar, etc.
              </p>
            </div>
            <Switch
              checked={settings.catAnimations}
              onCheckedChange={(checked) =>
                onUpdate({ catAnimations: checked })
              }
              disabled={!settings.showCat}
            />
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Chat</h3>

        <div className="space-y-4">
          {/* Font size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Tamanho da fonte</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {settings.fontSize}px
              </span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => onUpdate({ fontSize: value })}
              min={12}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Mostrar timestamps</Label>
            <Switch
              checked={settings.showTimestamps}
              onCheckedChange={(checked) =>
                onUpdate({ showTimestamps: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Mostrar badges de fonte</Label>
              <p className="text-xs text-muted-foreground">Doc, Ticket</p>
            </div>
            <Switch
              checked={settings.showSourceBadges}
              onCheckedChange={(checked) =>
                onUpdate({ showSourceBadges: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Renderizar Markdown</Label>
            <Switch
              checked={settings.renderMarkdown}
              onCheckedChange={(checked) =>
                onUpdate({ renderMarkdown: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Accent color */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Cor de destaque</h3>

        <div className="flex flex-wrap gap-3">
          {ACCENT_COLORS.map((color) => {
            const isActive = settings.accentColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => onUpdate({ accentColor: color.id })}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent/50'
                }`}
              >
                <div className={`h-4 w-4 rounded-full ${color.color}`} />
                <span className="text-xs">
                  {color.label}
                  {color.id === 'teal' ? ' (padrao)' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
