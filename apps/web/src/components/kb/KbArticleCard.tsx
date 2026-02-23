'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Eye,
  Archive,
  CheckCircle2,
  FileEdit,
} from 'lucide-react';
import { KbStatusBadge } from './KbStatusBadge';
import type { KbArticleStatus } from '@prisma/client';
import type { KbCategoryData } from '@/lib/kb/types';

interface KbArticleCardProps {
  article: {
    id: string;
    articleNumber: string;
    title: string;
    category: KbCategoryData;
    tags: string[];
    softwareName: string | null;
    errorCodes: string[];
    status: KbArticleStatus;
    usageCount: number;
    successRate: number;
    lastUsedAt: string | null;
    updatedAt: string;
  };
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onChangeStatus: (id: string, status: KbArticleStatus) => void;
  onPreview: (id: string) => void;
}

export function KbArticleCard({
  article,
  onEdit,
  onDuplicate,
  onChangeStatus,
  onPreview,
}: KbArticleCardProps) {
  const timeAgo = formatTimeAgo(article.updatedAt);

  return (
    <Card className="hover:bg-accent/30 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground font-mono mb-0.5">
              {article.articleNumber}
            </p>
            <h3 className="text-sm font-medium line-clamp-2">{article.title}</h3>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onEdit(article.id)}
            >
              <Pencil size={14} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(article.id)}>
                  <Pencil size={14} className="mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(article.id)}>
                  <Copy size={14} className="mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPreview(article.id)}>
                  <Eye size={14} className="mr-2" />
                  Preview IA
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {article.status === 'DRAFT' && (
                  <DropdownMenuItem onClick={() => onChangeStatus(article.id, 'PUBLISHED')}>
                    <CheckCircle2 size={14} className="mr-2" />
                    Publicar
                  </DropdownMenuItem>
                )}
                {article.status === 'PUBLISHED' && (
                  <DropdownMenuItem onClick={() => onChangeStatus(article.id, 'DRAFT')}>
                    <FileEdit size={14} className="mr-2" />
                    Voltar para rascunho
                  </DropdownMenuItem>
                )}
                {article.status !== 'ARCHIVED' && (
                  <DropdownMenuItem
                    onClick={() => onChangeStatus(article.id, 'ARCHIVED')}
                    className="text-destructive"
                  >
                    <Archive size={14} className="mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <Badge
            variant="outline"
            className="text-[10px]"
            style={{
              borderColor: article.category.color || '#9CA3AF',
              color: article.category.color || '#9CA3AF',
            }}
          >
            {article.category.name}
          </Badge>
          <KbStatusBadge status={article.status} />
          {article.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground">
              +{article.tags.length - 2}
            </span>
          )}
        </div>

        {(article.softwareName || article.errorCodes.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px] text-muted-foreground">
            {article.softwareName && (
              <span>📦 {article.softwareName}</span>
            )}
            {article.errorCodes.length > 0 && (
              <span>🔢 {article.errorCodes.slice(0, 3).join(', ')}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>Usado {article.usageCount}x</span>
            {article.usageCount > 0 && (
              <span>{Math.round(article.successRate)}% sucesso</span>
            )}
          </div>
          <span>{timeAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `ha ${diffMin} min`;
  if (diffHrs < 24) return `ha ${diffHrs}h`;
  if (diffDays < 30) return `ha ${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
}
