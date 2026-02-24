'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, X } from 'lucide-react';
import { KbAiFieldBadge } from './KbAiFieldBadge';
import { KbDuplicateWarning } from './KbDuplicateWarning';
import type { InsertionMode, AiFieldState } from '@/lib/kb/types';

interface KbReviewScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: {
    title?: string;
    summary?: string;
    content?: string;
    structuredContent?: string;
    category?: string;
    categoryConfidence?: number;
    tags?: string[];
    difficulty?: string;
    targetAudience?: string;
    duplicateWarning?: {
      articleId?: string;
      articleTitle?: string;
      similarity?: number;
    };
  };
  insertionMode: InsertionMode;
  aiInfo?: { model?: string; latencyMs?: number; tokensUsed?: number };
  categories: Array<{ id: string; name: string; slug: string }>;
  onSaved: () => void;
}

export function KbReviewScreen({
  open,
  onOpenChange,
  suggestion,
  insertionMode,
  aiInfo,
  categories,
  onSaved,
}: KbReviewScreenProps) {
  const [title, setTitle] = useState(suggestion.title ?? '');
  const [summary, setSummary] = useState(suggestion.summary ?? '');
  const [content, setContent] = useState(
    suggestion.structuredContent ?? suggestion.content ?? ''
  );
  const [categoryId, setCategoryId] = useState(() => {
    const match = categories.find(
      (c) => c.name.toLowerCase() === suggestion.category?.toLowerCase()
    );
    return match?.id ?? '';
  });
  const [tags, setTags] = useState<string[]>(suggestion.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [difficulty, setDifficulty] = useState(suggestion.difficulty ?? 'basic');
  const [targetAudience, setTargetAudience] = useState(
    suggestion.targetAudience ?? 'technician'
  );
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDuplicate, setShowDuplicate] = useState(
    !!suggestion.duplicateWarning?.articleTitle
  );

  // Track which fields were edited by user
  const [fieldSources, setFieldSources] = useState<Record<string, AiFieldState>>({
    title: { source: suggestion.title ? 'ai' : 'user' },
    summary: { source: suggestion.summary ? 'ai' : 'user' },
    content: { source: suggestion.structuredContent ? 'ai' : 'user' },
    category: { source: suggestion.category ? 'ai' : 'user' },
    tags: { source: suggestion.tags?.length ? 'ai' : 'user' },
    difficulty: { source: suggestion.difficulty ? 'ai' : 'user' },
    targetAudience: { source: suggestion.targetAudience ? 'ai' : 'user' },
  });

  const markEdited = useCallback(
    (field: string) => {
      if (fieldSources[field]?.source === 'ai') {
        setFieldSources((prev) => ({
          ...prev,
          [field]: { source: 'user', aiValue: prev[field]?.aiValue },
        }));
      }
    },
    [fieldSources]
  );

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      markEdited('tags');
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    markEdited('tags');
  };

  const handleSave = async (saveStatus: 'draft' | 'published') => {
    if (!title.trim() || !content.trim()) {
      setError('Título e conteúdo são obrigatórios');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/kb/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          summary: summary.trim() || null,
          categoryId: categoryId || null,
          tags,
          status: saveStatus,
          difficulty,
          targetAudience,
          insertionMode,
          aiData: aiInfo
            ? {
                provider: 'system',
                model: aiInfo.model,
                tokensUsed: aiInfo.tokensUsed,
                latencyMs: aiInfo.latencyMs,
                fieldsAutoFilled: Object.values(fieldSources).filter(
                  (f) => f.source === 'ai'
                ).length,
                fieldsUserEdited: Object.values(fieldSources).filter(
                  (f) => f.source === 'user'
                ).length,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar artigo');
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  const modeLabels: Record<InsertionMode, string> = {
    quick_add: 'Quick Add',
    file_upload: 'Upload',
    full_form: 'Formulário',
    from_chat: 'Chat',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Sparkles size={18} className="text-amber-400" />
            Artigo Gerado pela IA — Revise e Salve
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-160px)]">
          <div className="p-6 pt-4 space-y-5">
            {/* Duplicate Warning */}
            {showDuplicate && suggestion.duplicateWarning?.articleTitle && (
              <KbDuplicateWarning
                articleTitle={suggestion.duplicateWarning.articleTitle}
                similarity={suggestion.duplicateWarning.similarity ?? 0}
                onViewExisting={() => {
                  // Could open the existing article in a new tab
                  setShowDuplicate(false);
                }}
                onCreateAnyway={() => setShowDuplicate(false)}
              />
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="review-title">
                  Título <span className="text-destructive">*</span>
                </Label>
                <KbAiFieldBadge source={fieldSources.title?.source ?? 'user'} />
              </div>
              <Input
                id="review-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markEdited('title');
                }}
                className="text-sm"
              />
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="review-summary">Resumo</Label>
                <KbAiFieldBadge source={fieldSources.summary?.source ?? 'user'} />
              </div>
              <Textarea
                id="review-summary"
                value={summary}
                onChange={(e) => {
                  setSummary(e.target.value);
                  markEdited('summary');
                }}
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            {/* Category + Difficulty row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Categoria</Label>
                  <KbAiFieldBadge source={fieldSources.category?.source ?? 'user'} />
                </div>
                <Select
                  value={categoryId}
                  onValueChange={(v) => {
                    setCategoryId(v);
                    markEdited('category');
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {suggestion.categoryConfidence !== undefined && (
                  <p className="text-[10px] text-muted-foreground">
                    Confiança: {Math.round(suggestion.categoryConfidence * 100)}%
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Dificuldade</Label>
                  <KbAiFieldBadge source={fieldSources.difficulty?.source ?? 'user'} />
                </div>
                <Select
                  value={difficulty}
                  onValueChange={(v) => {
                    setDifficulty(v);
                    markEdited('difficulty');
                  }}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <KbAiFieldBadge source={fieldSources.tags?.source ?? 'user'} />
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X size={10} />
                  </Badge>
                ))}
              </div>
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                onBlur={() => {
                  if (tagInput.trim()) addTag(tagInput);
                }}
                placeholder="Adicionar tag..."
                className="h-8 text-sm"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Público-alvo</Label>
                <KbAiFieldBadge source={fieldSources.targetAudience?.source ?? 'user'} />
              </div>
              <Select
                value={targetAudience}
                onValueChange={(v) => {
                  setTargetAudience(v);
                  markEdited('targetAudience');
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end_user">Usuário final</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Content */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="review-content">
                  Conteúdo <span className="text-destructive">*</span>
                </Label>
                <KbAiFieldBadge source={fieldSources.content?.source ?? 'user'} />
              </div>
              <Textarea
                id="review-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  markEdited('content');
                }}
                rows={12}
                className="text-sm font-mono resize-y"
                placeholder="Conteúdo do artigo em Markdown..."
              />
              <p className="text-[10px] text-muted-foreground">
                Suporta Markdown (## Títulos, **negrito**, listas, blocos de código)
              </p>
            </div>

            <Separator />

            {/* Publish options */}
            <div className="space-y-2">
              <Label>Publicação</Label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="accent-primary"
                  />
                  <span className="text-sm">Rascunho</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'published'}
                    onChange={() => setStatus('published')}
                    className="accent-primary"
                  />
                  <span className="text-sm">Publicado</span>
                </label>
              </div>
            </div>

            {/* Footer info */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2">
              <span>Fonte: {modeLabels[insertionMode]}</span>
              {aiInfo?.model && <span>IA: {aiInfo.model}</span>}
              {aiInfo?.latencyMs && <span>{aiInfo.latencyMs}ms</span>}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 p-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSave('draft')}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Salvar Rascunho
          </Button>
          <Button
            onClick={() => handleSave('published')}
            disabled={saving}
          >
            {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Publicar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
