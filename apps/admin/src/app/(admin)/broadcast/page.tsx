'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import { Megaphone, Send, Loader2 } from 'lucide-react';

interface BroadcastItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  priority: string;
  isRead: boolean;
  createdAt: string;
  tenantName: string;
  recipientEmail: string;
  recipientName: string;
}

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'secondary' | 'outline'> = {
  URGENT: 'destructive',
  HIGH: 'warning',
  NORMAL: 'secondary',
  LOW: 'outline',
};

export default function BroadcastPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // New broadcast form
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [sent, setSent] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/broadcast')
      .then((r) => r.json())
      .then((data) => {
        setBroadcasts(data.broadcasts);
        setLoading(false);
      });
  }, []);

  async function handleSend() {
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    setSent(null);

    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, priority }),
    });

    const data = await res.json();
    setSending(false);

    if (data.success) {
      setSent(data.sent);
      setTitle('');
      setBody('');
      // Refresh list
      const refreshRes = await fetch('/api/broadcast');
      const refreshData = await refreshRes.json();
      setBroadcasts(refreshData.broadcasts);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Megaphone className="w-5 h-5" /> Broadcast
        </h1>
        <p className="text-xs text-muted-foreground">
          Enviar notificacoes para todos os usuarios
        </p>
      </div>

      {/* New Broadcast Form */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Notificacao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Titulo da notificacao"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Corpo da mensagem..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-transparent border border-input text-sm min-h-24 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-3">
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Baixa</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </Select>
            <Button onClick={handleSend} disabled={sending || !title.trim() || !body.trim()}>
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar para Todos
                </>
              )}
            </Button>
          </div>
          {sent !== null && (
            <p className="text-xs text-emerald-400">
              Notificacao enviada para {sent} usuarios
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recent Broadcasts */}
      <Card>
        <CardHeader>
          <CardTitle>Historico</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48" />
          ) : broadcasts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum broadcast enviado
            </p>
          ) : (
            <div className="space-y-2">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-foreground">
                        {b.title}
                      </p>
                      <Badge
                        variant={PRIORITY_VARIANT[b.priority] || 'secondary'}
                        className="text-[10px]"
                      >
                        {b.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {b.tenantName} &middot; {b.recipientName} ({b.recipientEmail})
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(b.createdAt)}
                    </p>
                    <Badge
                      variant={b.isRead ? 'secondary' : 'outline'}
                      className="text-[10px] mt-0.5"
                    >
                      {b.isRead ? 'Lido' : 'Nao lido'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
