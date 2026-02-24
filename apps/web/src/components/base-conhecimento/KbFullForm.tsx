'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Sparkles, X } from 'lucide-react';
import Link from 'next/link';

interface KbCategory {
  id: string;
  name: string;
  slug: string;
}

export function KbFullForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [difficulty, setDifficulty] = useState('basic');
  const [targetAudience, setTargetAudience] = useState('technician');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const [categories, setCategories] = useState<KbCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI suggestion state
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string | string[]>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Fetch categories
  useEffect(() => {
    fetch('/api/kb/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(console.error);
  }, []);

  // Debounced AI suggestions
  const requestSuggestions = useCallback(async () => {
    if (content.length < 100) return;

    setAiSuggesting(true);
    try {
      const res = await fetch('/api/kb/articles/analyze-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category: categoryId }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data.suggestion ?? {});
      }
    } catch {
      // Silent fail for suggestions
    } finally {
      setAiSuggesting(false);
    }
  }, [title, content, categoryId]);

  const handleContentChange = (value: string) => {
    setContent(value);
    // Debounce AI suggestions
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(requestSuggestions, 2000);
  };

  const applySuggestion = (field: string, value: string | string[]) => {
    switch (field) {
      case 'title':
        if (!title && typeof value === 'string') setTitle(value);
        break;
      case 'summary':
        if (!summary && typeof value === 'string') setSummary(value);
        break;
      case 'category':
        if (!categoryId && typeof value === 'string') {
          const match = categories.find(
            (c) => c.name.toLowerCase() === (value as string).toLowerCase()
          );
          if (match) setCategoryId(match.id);
        }
        break;
      case 'tags':
        if (tags.length === 0 && Array.isArray(value)) setTags(value as string[]);
        break;
    }
    // Remove applied suggestion
    setAiSuggestions((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleSave = async () => {
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
          status,
          difficulty,
          targetAudience,
          insertionMode: 'full_form',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="h-14 w-14 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-base font-medium mb-1">Artigo salvo com sucesso!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            O artigo foi salvo como {status === 'published' ? 'publicado' : 'rascunho'}.
          </p>
          <Link href="/base-conhecimento">
            <Button variant="outline" className="gap-2">
              <ArrowLeft size={14} />
              Voltar para lista
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link href="/base-conhecimento">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <CardTitle className="text-base">Novo Artigo</CardTitle>
          {aiSuggesting && (
            <Badge variant="secondary" className="gap-1 text-[10px] ml-auto">
              <Loader2 size={10} className="animate-spin" />
              IA analisando...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="full-title">
            Título <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Correcão erro 500 no Fluig"
            className="text-sm"
          />
          {aiSuggestions.title && !title && (
            <button
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              onClick={() => applySuggestion('title', aiSuggestions.title)}
            >
              <Sparkles size={10} />
              Sugestão: {aiSuggestions.title as string}
            </button>
          )}
        </div>

        {/* Category + Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
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
            {aiSuggestions.category && !categoryId && (
              <button
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                onClick={() => applySuggestion('category', aiSuggestions.category)}
              >
                <Sparkles size={10} />
                Sugestão: {aiSuggestions.category as string}
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Dificuldade</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
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
            <div className="space-y-1.5">
              <Label>Público</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end_user">Usuário</SelectItem>
                  <SelectItem value="technician">Técnico</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label>Tags</Label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1 text-xs cursor-pointer hover:bg-destructive/20"
                  onClick={() => setTags(tags.filter((t) => t !== tag))}
                >
                  {tag}
                  <X size={10} />
                </Badge>
              ))}
            </div>
          )}
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
            placeholder="Digite e pressione Enter..."
            className="h-9 text-sm"
          />
          {aiSuggestions.tags && tags.length === 0 && (
            <button
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              onClick={() => applySuggestion('tags', aiSuggestions.tags)}
            >
              <Sparkles size={10} />
              Sugestão: {(aiSuggestions.tags as string[]).join(', ')}
            </button>
          )}
        </div>

        <Separator />

        {/* Content */}
        <div className="space-y-1.5">
          <Label htmlFor="full-content">
            Conteúdo <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="full-content"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={16}
            className="text-sm font-mono resize-y"
            placeholder="Escreva o conteúdo do artigo aqui... Suporta Markdown."
          />
          <p className="text-[10px] text-muted-foreground">
            O editor suporta Markdown (## Títulos, **negrito**, listas, blocos de código)
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="full-summary">Resumo</Label>
            {content.length > 200 && !summary && (
              <button
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                onClick={requestSuggestions}
                disabled={aiSuggesting}
              >
                <Sparkles size={10} />
                Gerar resumo com IA
              </button>
            )}
          </div>
          <Textarea
            id="full-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="text-sm resize-none"
            placeholder="Resumo breve de 2-3 frases (preenchido pela IA automaticamente)"
          />
          {aiSuggestions.summary && !summary && (
            <button
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              onClick={() => applySuggestion('summary', aiSuggestions.summary)}
            >
              <Sparkles size={10} />
              Aplicar sugestão
            </button>
          )}
        </div>

        <Separator />

        {/* Publish options */}
        <div className="flex items-center gap-4">
          <Label>Status:</Label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="full-status"
              checked={status === 'draft'}
              onChange={() => setStatus('draft')}
              className="accent-primary"
            />
            <span className="text-sm">Rascunho</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="full-status"
              checked={status === 'published'}
              onChange={() => setStatus('published')}
              className="accent-primary"
            />
            <span className="text-sm">Publicado</span>
          </label>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2">
          <Link href="/base-conhecimento" className="flex-1">
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              setStatus('draft');
              handleSave();
            }}
            disabled={saving}
          >
            {saving && <Loader2 size={14} className="animate-spin mr-2" />}
            Salvar Rascunho
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setStatus('published');
              handleSave();
            }}
            disabled={saving}
          >
            {saving && <Loader2 size={14} className="animate-spin mr-2" />}
            Publicar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
