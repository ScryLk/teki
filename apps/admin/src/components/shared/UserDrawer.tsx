'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import StatusDot from '@/components/shared/StatusDot';
import { formatDate } from '@/lib/utils';
import { X, Shield, Lock, Unlock, MessageSquare, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDrawerProps {
  userId: string | null;
  onClose: () => void;
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  displayName: string | null;
  status: string;
  emailVerified: boolean;
  phone: string | null;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  credentials: {
    mfaEnabled: boolean;
    failedAttempts: number;
    lockedUntil: string | null;
    passwordChangedAt: string;
  } | null;
  sessions: {
    id: string;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string;
    lastActivityAt: string;
  }[];
  memberships: {
    id: string;
    role: string;
    status: string;
    tenantId: string;
    tenantName: string;
    tenantPlan: string;
  }[];
  stats: {
    messages: number;
    conversations: number;
    feedback: number;
  };
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  ACTIVE: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'destructive',
  DEACTIVATED: 'secondary',
  ANONYMIZED: 'secondary',
};

export default function UserDrawer({ userId, onClose }: UserDrawerProps) {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      return;
    }
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  }, [userId]);

  async function updateStatus(newStatus: string) {
    if (!userId) return;
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setUser((prev) => (prev ? { ...prev, status: newStatus } : prev));
  }

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-background border-l border-border overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-3 flex items-center justify-between z-10">
          <h2 className="text-sm font-semibold">Detalhes do Usuario</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading || !user ? (
          <div className="p-5 space-y-4">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* User Identity */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {user.firstName[0]}
                {user.lastName?.[0] || ''}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={STATUS_VARIANT[user.status] || 'secondary'}>
                    {user.status}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="success">Verificado</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              {user.status === 'ACTIVE' ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => updateStatus('SUSPENDED')}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Suspender
                </Button>
              ) : user.status === 'SUSPENDED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus('ACTIVE')}
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Reativar
                </Button>
              ) : null}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-foreground">
                  {user.stats.messages}
                </p>
                <p className="text-[10px] text-muted-foreground">Mensagens</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-foreground">
                  {user.stats.conversations}
                </p>
                <p className="text-[10px] text-muted-foreground">Conversas</p>
              </div>
              <div className="bg-secondary rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-foreground">
                  {user.stats.feedback}
                </p>
                <p className="text-[10px] text-muted-foreground">Feedback</p>
              </div>
            </div>

            {/* Security */}
            {user.credentials && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Seguranca
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MFA</span>
                    <Badge variant={user.credentials.mfaEnabled ? 'success' : 'secondary'}>
                      {user.credentials.mfaEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tentativas falhas</span>
                    <span>{user.credentials.failedAttempts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Senha alterada</span>
                    <span>{formatDate(user.credentials.passwordChangedAt)}</span>
                  </div>
                  {user.credentials.lockedUntil && (
                    <div className="flex justify-between text-destructive">
                      <span>Bloqueado ate</span>
                      <span>{formatDate(user.credentials.lockedUntil)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tenants */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Tenants ({user.memberships.length})
              </h3>
              <div className="space-y-2">
                {user.memberships.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-secondary"
                  >
                    <div>
                      <p className="text-sm text-foreground">{m.tenantName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {m.role} &middot; {m.tenantPlan}
                      </p>
                    </div>
                    <Badge
                      variant={m.status === 'ACTIVE' ? 'success' : 'secondary'}
                    >
                      {m.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            {user.sessions.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  Sessoes Ativas ({user.sessions.length})
                </h3>
                <div className="space-y-2">
                  {user.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-secondary text-xs"
                    >
                      <StatusDot color="green" pulse />
                      <div className="flex-1">
                        <p className="text-foreground">
                          {s.browser || s.deviceType || 'Desconhecido'}{' '}
                          {s.os ? `(${s.os})` : ''}
                        </p>
                        <p className="text-muted-foreground font-mono">
                          {s.ipAddress}
                        </p>
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(s.lastActivityAt)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t border-border">
              <p>Criado em: {formatDate(user.createdAt)}</p>
              {user.lastLoginAt && (
                <p>Ultimo login: {formatDate(user.lastLoginAt)}</p>
              )}
              <p className="font-mono text-[10px]">ID: {user.id}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
