'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import type { UserSettings } from '@/lib/settings-types';

interface DesktopSectionProps {
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
}

export function DesktopSection({ settings, onUpdate }: DesktopSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Desktop</h2>
        <p className="text-sm text-muted-foreground">
          Configuracoes exclusivas da versao desktop.
        </p>
      </div>

      {/* General */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Geral</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Iniciar com o sistema</Label>
            <Switch
              checked={settings.launchOnStartup}
              onCheckedChange={(checked) =>
                onUpdate({ launchOnStartup: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Minimizar para tray ao fechar</Label>
            <Switch
              checked={settings.minimizeToTray}
              onCheckedChange={(checked) =>
                onUpdate({ minimizeToTray: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Mostrar icone no tray</Label>
            <Switch
              checked={settings.showTrayIcon}
              onCheckedChange={(checked) =>
                onUpdate({ showTrayIcon: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Window inspection */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Inspecao de Janela</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Qualidade da captura</Label>
            <Select
              value={settings.captureQuality}
              onValueChange={(value: 'low' | 'medium' | 'high') =>
                onUpdate({ captureQuality: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  Baixa (720p) — rapido
                </SelectItem>
                <SelectItem value="medium">
                  Media (1080p) — balanceado
                </SelectItem>
                <SelectItem value="high">
                  Alta (nativa) — pesado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Auto-contexto no chat</Label>
              <p className="text-xs text-muted-foreground">
                Enviar screenshot automaticamente ao perguntar
              </p>
            </div>
            <Switch
              checked={settings.autoContextScreenshot}
              onCheckedChange={(checked) =>
                onUpdate({ autoContextScreenshot: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Lembrar ultima janela</Label>
              <p className="text-xs text-muted-foreground">
                Reconectar automaticamente ao reabrir o Teki
              </p>
            </div>
            <Switch
              checked={settings.rememberLastWindow}
              onCheckedChange={(checked) =>
                onUpdate({ rememberLastWindow: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Atalhos de teclado</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Command Palette</Label>
            <Badge variant="outline" className="font-mono text-xs">
              Ctrl+K
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Nova conversa</Label>
            <Badge variant="outline" className="font-mono text-xs">
              Ctrl+N
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Atalho global</Label>
              <p className="text-xs text-muted-foreground">
                Abre o Teki de qualquer lugar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={settings.globalShortcut
                  .replace('CommandOrControl', 'Ctrl')
                  .replace('+', ' + ')}
                readOnly
                className="h-8 w-32 text-xs text-center font-mono bg-muted/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Updates */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Atualizacoes</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Versao atual</p>
              <p className="text-xs text-muted-foreground">v0.1.0</p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <RefreshCw size={14} />
              Verificar agora
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
