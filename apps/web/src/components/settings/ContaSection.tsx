'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Lock,
  Smartphone,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export function ContaSection() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false);

  // Mock user data — will be replaced by NextAuth session
  const user = {
    name: 'Usuario',
    email: 'usuario@email.com',
    image: '',
    provider: 'google' as const,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Conta</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie seu perfil e autenticacao.
        </p>
      </div>

      {/* Profile */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Perfil</h3>

        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">
                Nome
              </Label>
              <Input
                id="name"
                defaultValue={user.name}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={user.email}
                  readOnly
                  className="h-9 bg-muted/50"
                />
                <Lock size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground">
                Vinculado ao provider de autenticacao
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5">
          <Upload size={14} />
          Alterar foto
        </Button>
      </div>

      {/* Login method */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Metodo de login</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Google</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              Conectado
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">
                  Nao configurado
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Configurar
            </Button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <h3 className="text-sm font-medium">Seguranca</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Alterar senha</p>
              <p className="text-xs text-muted-foreground">
                Disponivel apenas com login por email
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-xs" disabled>
              Alterar
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone size={14} className="text-muted-foreground" />
              <div>
                <p className="text-sm">Sessoes ativas</p>
                <p className="text-xs text-muted-foreground">
                  1 dispositivo
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setSessionsDialogOpen(true)}
            >
              Ver
            </Button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-lg border border-destructive/30 bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-destructive" />
          <h3 className="text-sm font-medium text-destructive">
            Zona de perigo
          </h3>
        </div>

        <p className="text-xs text-muted-foreground">
          Isso apagara permanentemente todos os seus dados, agentes, conversas
          e documentos.
        </p>

        <Button
          variant="destructive"
          size="sm"
          className="gap-1.5"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 size={14} />
          Excluir minha conta
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Excluir conta
            </DialogTitle>
            <DialogDescription>
              Esta acao e irreversivel. Todos os seus dados serao apagados
              permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label className="text-sm">
              Digite <span className="font-mono font-bold">EXCLUIR</span> para
              confirmar:
            </Label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="EXCLUIR"
              className="h-9"
            />
            <Button
              variant="destructive"
              className="w-full"
              disabled={deleteConfirmation !== 'EXCLUIR'}
            >
              Confirmar exclusao
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sessions dialog */}
      <Dialog open={sessionsDialogOpen} onOpenChange={setSessionsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sessoes ativas</DialogTitle>
            <DialogDescription>
              Dispositivos com sessao ativa na sua conta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Monitor size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Este dispositivo</p>
                  <p className="text-xs text-muted-foreground">
                    Web — Ativo agora
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                Atual
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Monitor({ size, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}
