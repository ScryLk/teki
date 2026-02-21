'use client';

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Download,
  Trash2,
  Mail,
  AlertTriangle,
} from 'lucide-react';
import type { UserSettings } from '@/lib/settings-types';

interface PrivacidadeSectionProps {
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
}

export function PrivacidadeSection({
  settings,
  onUpdate,
}: PrivacidadeSectionProps) {
  const [clearConversationsOpen, setClearConversationsOpen] = useState(false);
  const [clearDocsOpen, setClearDocsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Privacidade & Dados</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie seus dados pessoais e privacidade.
        </p>
      </div>

      {/* Conversations */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Conversas</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              Salvar historico de conversas
            </Label>
            <Switch
              checked={settings.saveHistory}
              onCheckedChange={(checked) =>
                onUpdate({ saveHistory: checked })
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Download size={14} />
              Exportar conversas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-destructive"
              onClick={() => setClearConversationsOpen(true)}
            >
              <Trash2 size={14} />
              Limpar todas as conversas
            </Button>
          </div>
        </div>
      </div>

      {/* Screenshots (Desktop) */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Capturas de tela (Desktop)</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">
                Salvar screenshots localmente
              </Label>
              <p className="text-xs text-muted-foreground">
                {settings.saveScreenshots
                  ? 'Capturas serao salvas na pasta configurada'
                  : 'Capturas sao descartadas apos uso'}
              </p>
            </div>
            <Switch
              checked={settings.saveScreenshots}
              onCheckedChange={(checked) =>
                onUpdate({ saveScreenshots: checked })
              }
            />
          </div>

          {settings.saveScreenshots && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs">Retencao</Label>
                <Select
                  value={settings.screenshotRetention}
                  onValueChange={(
                    value: '1d' | '7d' | '30d' | 'forever'
                  ) => onUpdate({ screenshotRetention: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">1 dia</SelectItem>
                    <SelectItem value="7d">7 dias</SelectItem>
                    <SelectItem value="30d">30 dias</SelectItem>
                    <SelectItem value="forever">Sempre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Pasta</Label>
                <div className="flex gap-2">
                  <Input
                    value={settings.screenshotPath}
                    onChange={(e) =>
                      onUpdate({ screenshotPath: e.target.value })
                    }
                    className="h-9 text-xs font-mono"
                  />
                  <Button variant="outline" size="sm" className="text-xs flex-shrink-0">
                    Alterar
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Knowledge Base</h3>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download size={14} />
            Exportar documentos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-destructive"
            onClick={() => setClearDocsOpen(true)}
          >
            <Trash2 size={14} />
            Apagar todos os documentos
          </Button>
        </div>
      </div>

      {/* Your data */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Seus dados</h3>

        <div className="space-y-3">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download size={14} />
            Baixar todos os meus dados
          </Button>
          <p className="text-xs text-muted-foreground">
            Exporta perfil, conversas, documentos e configuracoes em formato
            JSON.
          </p>

          <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
            <p>
              Conforme LGPD, voce tem direito ao acesso, correcao e exclusao
              dos seus dados pessoais.
            </p>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs gap-1.5"
            >
              <Mail size={12} />
              Solicitar exclusao de dados
            </Button>
          </div>
        </div>
      </div>

      {/* Clear conversations dialog */}
      <Dialog
        open={clearConversationsOpen}
        onOpenChange={setClearConversationsOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              Limpar conversas
            </DialogTitle>
            <DialogDescription>
              Todas as suas conversas serao apagadas permanentemente. Esta
              acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearConversationsOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" size="sm">
              Limpar tudo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear docs dialog */}
      <Dialog open={clearDocsOpen} onOpenChange={setClearDocsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-destructive" />
              Apagar documentos
            </DialogTitle>
            <DialogDescription>
              Todos os documentos da Knowledge Base serao apagados
              permanentemente. Esta acao nao pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearDocsOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" size="sm">
              Apagar tudo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
