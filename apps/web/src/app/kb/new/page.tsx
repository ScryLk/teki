'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewKbArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

    const res = await fetch('/api/kb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const article = await res.json();
      router.push(`/kb/${article.id}/edit`);
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao criar artigo');
    }
    setLoading(false);
  };

  const update = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/kb">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Novo Artigo</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Artigo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título <span className="text-destructive">*</span></Label>
              <Input
                value={formData.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Título descritivo do problema e solução"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Input
                  value={formData.category}
                  onChange={(e) => update('category', e.target.value)}
                  placeholder="ex: banco_dados"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Subcategoria</Label>
                <Input
                  value={formData.subcategory}
                  onChange={(e) => update('subcategory', e.target.value)}
                  placeholder="ex: postgresql"
                />
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
                <Input
                  value={formData.softwareName}
                  onChange={(e) => update('softwareName', e.target.value)}
                  placeholder="Nome do software"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Versão mínima</Label>
                <Input
                  value={formData.versionMin}
                  onChange={(e) => update('versionMin', e.target.value)}
                  placeholder="ex: 1.0.0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Versão máxima</Label>
                <Input
                  value={formData.versionMax}
                  onChange={(e) => update('versionMax', e.target.value)}
                  placeholder="ex: 2.0.0"
                />
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
              <Label>Descrição do Problema <span className="text-destructive">*</span></Label>
              <Textarea
                value={formData.problemDescription}
                onChange={(e) => update('problemDescription', e.target.value)}
                placeholder="Descreva o problema que este artigo resolve..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Passos da Solução <span className="text-destructive">*</span></Label>
              <Textarea
                value={formData.solutionSteps}
                onChange={(e) => update('solutionSteps', e.target.value)}
                placeholder="Descreva os passos para resolver o problema..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => update('notes', e.target.value)}
                placeholder="Notas adicionais, cuidados, etc."
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
              <Input
                value={formData.tags}
                onChange={(e) => update('tags', e.target.value)}
                placeholder="postgresql, connection_refused, banco_dados"
              />
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
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/kb">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Criar Artigo'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
