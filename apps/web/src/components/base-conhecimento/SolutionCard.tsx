'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Download } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CriticalityBadge } from './CriticalityBadge';
import type { SolutionRecord } from '@/lib/types';

interface SolutionCardProps {
  solution: SolutionRecord;
  onDelete: (id: string) => void;
}

export function SolutionCard({ solution, onDelete }: SolutionCardProps) {
  return (
    <Card className="hover:bg-accent/30 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium truncate">{solution.titulo}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {solution.descricao}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {solution.status === 'indexed' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
              >
                <a href={solution.fileUrl} download>
                  <Download size={14} />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(solution.id)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {solution.categoria}
          </Badge>
          <CriticalityBadge criticality={solution.criticidade} />
          <StatusBadge status={solution.status} />

          {solution.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {solution.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{solution.tags.length - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
          <span>{solution.fileName}</span>
          <span>
            {new Date(solution.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {solution.status === 'error' && solution.errorMessage && (
          <p className="text-[11px] text-destructive mt-2">
            {solution.errorMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
