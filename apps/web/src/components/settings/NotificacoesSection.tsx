'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { UserSettings } from '@/lib/settings-types';

interface NotificacoesSectionProps {
  settings: UserSettings;
  onUpdate: (partial: Partial<UserSettings>) => void;
}

export function NotificacoesSection({
  settings,
  onUpdate,
}: NotificacoesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notificacoes</h2>
        <p className="text-sm text-muted-foreground">
          Configure alertas e notificacoes do Teki.
        </p>
      </div>

      {/* Chat */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Chat</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Som ao receber resposta</Label>
            <Switch
              checked={settings.soundOnResponse}
              onCheckedChange={(checked) =>
                onUpdate({ soundOnResponse: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Notificacao de nova mensagem</Label>
              <p className="text-xs text-muted-foreground">
                Quando o Teki esta em background
              </p>
            </div>
            <Switch
              checked={settings.notifyNewMessage}
              onCheckedChange={(checked) =>
                onUpdate({ notifyNewMessage: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Inspection */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Inspecao</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">
              Alerta quando janela e fechada
            </Label>
            <Switch
              checked={settings.notifyWindowClosed}
              onCheckedChange={(checked) =>
                onUpdate({ notifyWindowClosed: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Alerta de erro na captura</Label>
            <Switch
              checked={settings.notifyCaptureError}
              onCheckedChange={(checked) =>
                onUpdate({ notifyCaptureError: checked })
              }
            />
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Plano</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm">Aviso de limite proximo</Label>
              <p className="text-xs text-muted-foreground">
                Notifica ao atingir 80% do uso
              </p>
            </div>
            <Switch
              checked={settings.notifyLimitWarning}
              onCheckedChange={(checked) =>
                onUpdate({ notifyLimitWarning: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Aviso de renovacao</Label>
            <Switch
              checked={settings.notifyRenewal}
              onCheckedChange={(checked) =>
                onUpdate({ notifyRenewal: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">
              Aviso de falha no pagamento
            </Label>
            <Switch
              checked={settings.notifyPaymentFailed}
              onCheckedChange={(checked) =>
                onUpdate({ notifyPaymentFailed: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
