'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, truncate } from '@/lib/utils';
import { ThumbsDown, ThumbsUp, MessageSquare } from 'lucide-react';

interface FeedbackItem {
  id: string;
  rating: string;
  comment: string | null;
  tags: string[] | null;
  actionTaken: string | null;
  correctedContent: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string };
  message: {
    content: string | null;
    isAiGenerated: boolean;
    conversationTitle: string | null;
    conversationType: string;
    provider: string | null;
    model: string | null;
    latencyMs: number | null;
  };
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState('NEGATIVE');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/feedback?rating=${rating}`)
      .then((r) => r.json())
      .then((data) => {
        setFeedbacks(data.feedbacks);
        setTotal(data.total);
        setLoading(false);
      });
  }, [rating]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <ThumbsDown className="w-5 h-5" /> Feedback
          </h1>
          <p className="text-xs text-muted-foreground">{total} registros</p>
        </div>
        <Select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="NEGATIVE">Negativo</option>
          <option value="POSITIVE">Positivo</option>
          <option value="MIXED">Misto</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : feedbacks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum feedback encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {f.rating === 'NEGATIVE' ? (
                      <ThumbsDown className="w-4 h-4 text-destructive" />
                    ) : f.rating === 'POSITIVE' ? (
                      <ThumbsUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {f.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {f.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(f.createdAt)}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {f.message.provider && (
                        <Badge variant="outline" className="text-[10px]">
                          {f.message.provider}/{f.message.model}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {f.message.conversationType}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* AI Response */}
                {f.message.content && (
                  <div className="bg-secondary rounded-lg p-3 mb-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground text-[10px] uppercase mb-1">
                      Resposta IA
                    </p>
                    {truncate(f.message.content, 300)}
                  </div>
                )}

                {/* User Comment */}
                {f.comment && (
                  <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-foreground text-[10px] uppercase mb-1">
                      Comentario do Usuario
                    </p>
                    <p className="text-foreground">{f.comment}</p>
                  </div>
                )}

                {/* Correction */}
                {f.correctedContent && (
                  <div className="mt-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-xs">
                    <p className="font-semibold text-emerald-400 text-[10px] uppercase mb-1">
                      Correcao Sugerida
                    </p>
                    <p className="text-foreground">{truncate(f.correctedContent, 300)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
