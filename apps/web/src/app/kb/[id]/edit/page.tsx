'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Trash2, TrendingUp } from 'lucide-react';

interface KbArticleDetail {
  id: string;
  articleNumber: string;
  title: string;
  category: string;
  subcategory: string | null;
  softwareName: string | null;
  versionMin: string | null;
  versionMax: string | null;
  problemDescription: string;
  solutionSteps: string;
  solutionType: string | null;
  notes: string | null;
  tags: string[];
  usageCount: number;
  successRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; name: string } | null;
  reviewedBy: { id: string; name: string } | null;
}

export default function EditKbArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<KbArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    softwareName: '',
    versionMin: '',
    versionMax: '',
    problemDescription: '',
    solutionSteps: '',
    solutionType: '',
    notes: '',
    tags: '',
    status: 'draft',
  });

  useEffect(() => {
    fetch(`/api/kb/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setArticle(data);
        setFormData({
          title: data.title || '',
          category: data.category || '',
          subcategory: data.subcategory || '',
          softwareName: data.softwareName || '',
          versionMin: data.versionMin || '',
          versionMax: data.versionMax || '',
          problemDescription: data.problemDescription || '',
          solutionSteps: data.solutionSteps || '',
          solutionType: data.solutionType || '',
          notes: data.notes || '',
          tags: (data.tags || []).join(', '),
          status: data.status || 'draft',
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...formData,
      subcategory: formData.subcategory || null,
      softwareName: formData.softwareName || null,
      versionMin: formData.versionMin || null,
      versionMax: formData.versionMax || null,
      solutionType: formData.solutionType || null,
      notes: formData.notes || null,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    };

    const res = await fetch(`/api/kb/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const updated = await res.json();
      setArticle({ ...article, ...updated } as KbArticleDetail);
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao salvar');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    const res = await fetch(`/api/kb/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/kb');
    }
  };

  const update = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }

  if (!article) {
    return <div className="text-center py-12 text-muted-foreground">Artigo não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/kb">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <span className="text-sm font-mono text-muted-foreground">{article.articleNumber}</span>
            <h1 className="text-xl font-bold">{article.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground text-right mr-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {article.usageCount} usos | {article.successRate.toFixed(0)}% sucesso
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input value={formData.title} onChange={(e) => update('title', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <Input value={formData.category} onChange={(e) => update('category', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Subcategoria</Label>
                <Input value={formData.subcategory} onChange={(e) => update('subcategory', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo de solução</Label>
                <Select value={formData.solutionType} onValueChange={(v) => update('solutionType', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="workaround">Workaround</SelectItem>
                    <SelectItem value="permanent_fix">Correção permanente</SelectItem>
                    <SelectItem value="configuration">Configuração</SelectItem>
                    <SelectItem value="known_issue">Problema conhecido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Software</Label>
                <Input value={formData.softwareName} onChange={(e) => update('softwareName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Versão mínima</Label>
                <Input value={formData.versionMin} onChange={(e) => update('versionMin', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Versão máxima</Label>
                <Input value={formData.versionMax} onChange={(e) => update('versionMax', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conteúdo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Descrição do Problema</Label>
              <Textarea
                value={formData.problemDescription}
                onChange={(e) => update('problemDescription', e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Passos da Solução</Label>
              <Textarea
                value={formData.solutionSteps}
                onChange={(e) => update('solutionSteps', e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => update('notes', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metadados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={formData.tags} onChange={(e) => update('tags', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                  <SelectItem value="deprecated">Depreciado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {article.createdBy && <p>Criado por: {article.createdBy.name}</p>}
              {article.reviewedBy && <p>Revisado por: {article.reviewedBy.name}</p>}
              <p>Criado em: {new Date(article.createdAt).toLocaleString('pt-BR')}</p>
              <p>Atualizado em: {new Date(article.updatedAt).toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
