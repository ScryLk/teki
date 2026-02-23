'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SOLUTION_TYPE_LABELS } from '@/lib/kb/types';
import type { KbArticleFull } from '@/lib/kb/types';

interface KnowledgeBasePreviewProps {
  articleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KnowledgeBasePreview({
  articleId,
  open,
  onOpenChange,
}: KnowledgeBasePreviewProps) {
  const [article, setArticle] = useState<KbArticleFull | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!articleId || !open) return;
    setLoading(true);
    fetch(`/api/kb/${articleId}`)
      .then((res) => res.json())
      .then((data) => setArticle(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [articleId, open]);

  // Simulate relevance score based on article metrics
  const relevanceScore = article
    ? Math.min(100, Math.max(10, article.priorityWeight + (article.successRate > 0 ? article.successRate * 0.5 : 0)))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Preview: Como a IA ve este artigo
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Carregando...
          </div>
        ) : article ? (
          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Artigo {article.articleNumber}
              </span>
              <Badge variant="outline" className="text-xs">
                Relevancia simulada: {Math.round(relevanceScore)}%
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Titulo: </span>
                <span>{article.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Categoria: </span>
                <span>
                  {article.category.name}
                  {article.subcategory && ` > ${article.subcategory}`}
                </span>
              </div>
              {article.softwareName && (
                <div>
                  <span className="text-muted-foreground">Software: </span>
                  <span>
                    {article.softwareName}
                    {article.versionMin && ` v${article.versionMin}`}
                    {article.versionMax && `–${article.versionMax}`}
                    {article.versionMin && !article.versionMax && '+'}
                  </span>
                </div>
              )}
              {article.modules.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Modulos: </span>
                  <span>{article.modules.join(', ')}</span>
                </div>
              )}
              {article.environments.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Ambientes: </span>
                  <span>{article.environments.join(', ')}</span>
                </div>
              )}
            </div>

            {article.errorCodes.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Codigos de erro: </span>
                  <span>{article.errorCodes.join(', ')}</span>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-3">
              <div>
                <p className="text-muted-foreground mb-1">Problema:</p>
                <p className="whitespace-pre-wrap">{article.problemDescription}</p>
              </div>

              {article.rootCause && (
                <div>
                  <p className="text-muted-foreground mb-1">Causa raiz:</p>
                  <p className="whitespace-pre-wrap">{article.rootCause}</p>
                </div>
              )}

              <div>
                <p className="text-muted-foreground mb-1">Solucao:</p>
                <p className="whitespace-pre-wrap">{article.solutionSteps}</p>
              </div>

              <div>
                <span className="text-muted-foreground">Tipo: </span>
                <span>{SOLUTION_TYPE_LABELS[article.solutionType]}</span>
              </div>

              {article.prevention && (
                <div>
                  <p className="text-muted-foreground mb-1">Prevencao:</p>
                  <p className="whitespace-pre-wrap">{article.prevention}</p>
                </div>
              )}
            </div>

            {article.aiContextNote && (
              <>
                <Separator />
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1 text-xs">Nota de contexto IA:</p>
                  <p className="whitespace-pre-wrap text-amber-300">
                    &quot;{article.aiContextNote}&quot;
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Peso: {article.priorityWeight}/100</span>
              {article.usageCount > 0 && (
                <span>Sucesso: {Math.round(article.successRate)}%</span>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Artigo nao encontrado
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
