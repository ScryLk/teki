'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { TagInput } from './TagInput';
import { FileDropzone } from './FileDropzone';
import { ProcessingStepper } from './ProcessingStepper';
import { CATEGORIES, RELATED_SYSTEMS, type Category, type Criticality, type SolutionStatus } from '@/lib/types';
import Link from 'next/link';

export function SolutionForm() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<Category | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [sistemasRelacionados, setSistemasRelacionados] = useState<string[]>([]);
  const [criticidade, setCriticidade] = useState<Criticality>('media');
  const [file, setFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<SolutionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!titulo.trim()) e.titulo = 'Titulo e obrigatorio';
    if (!descricao.trim()) e.descricao = 'Descricao e obrigatoria';
    if (!categoria) e.categoria = 'Selecione uma categoria';
    if (!file) e.file = 'Selecione um arquivo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate() || !file) return;

    setIsSubmitting(true);
    setProcessingStatus('uploading');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('titulo', titulo.trim());
      formData.append('descricao', descricao.trim());
      formData.append('categoria', categoria);
      formData.append('criticidade', criticidade);
      formData.append('tags', JSON.stringify(tags));
      formData.append('sistemasRelacionados', JSON.stringify(sistemasRelacionados));

      const response = await fetch('/api/solucoes', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar solucao');
      }

      const { id } = await response.json();
      setSubmittedId(id);

      // Poll for status updates
      pollStatus(id);
    } catch (error) {
      setProcessingStatus('error');
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro desconhecido'
      );
      setIsSubmitting(false);
    }
  };

  const pollStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/solucoes/${id}`);
        if (!res.ok) return;

        const data = await res.json();
        setProcessingStatus(data.status);

        if (data.status === 'error') {
          setErrorMessage(data.errorMessage);
          clearInterval(interval);
          setIsSubmitting(false);
        }

        if (data.status === 'indexed') {
          clearInterval(interval);
          setIsSubmitting(false);
        }
      } catch {
        // Keep polling
      }
    }, 1500);

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  };

  const toggleSistema = (sistema: string) => {
    setSistemasRelacionados((prev) =>
      prev.includes(sistema)
        ? prev.filter((s) => s !== sistema)
        : [...prev, sistema]
    );
  };

  // Show stepper after submission
  if (submittedId && processingStatus) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-base">Processando Solucao</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ProcessingStepper
            status={processingStatus}
            errorMessage={errorMessage}
          />

          {(processingStatus === 'indexed' || processingStatus === 'error') && (
            <div className="flex justify-center">
              <Link href="/base-conhecimento">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft size={14} />
                  Voltar para lista
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link href="/base-conhecimento">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <CardTitle className="text-base">Registrar Nova Solucao</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Titulo */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo">
              Titulo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Correcao erro 500 no Fluig"
              className="text-sm"
            />
            {errors.titulo && (
              <p className="text-xs text-destructive">{errors.titulo}</p>
            )}
          </div>

          {/* Descricao */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">
              Descricao <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva brevemente o problema e a solucao..."
              rows={4}
              className="text-sm resize-none"
            />
            {errors.descricao && (
              <p className="text-xs text-destructive">{errors.descricao}</p>
            )}
          </div>

          {/* Categoria + Criticidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select
                value={categoria}
                onValueChange={(v) => setCategoria(v as Category)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-xs text-destructive">{errors.categoria}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Criticidade</Label>
              <Select
                value={criticidade}
                onValueChange={(v) => setCriticidade(v as Criticality)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Critica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Digite e pressione Enter..."
            />
          </div>

          <Separator />

          {/* Sistemas Relacionados */}
          <div className="space-y-2">
            <Label>Sistemas Relacionados</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RELATED_SYSTEMS.map((sistema) => (
                <div key={sistema} className="flex items-center gap-2">
                  <Checkbox
                    id={`sistema-${sistema}`}
                    checked={sistemasRelacionados.includes(sistema)}
                    onCheckedChange={() => toggleSistema(sistema)}
                  />
                  <label
                    htmlFor={`sistema-${sistema}`}
                    className="text-xs cursor-pointer"
                  >
                    {sistema}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label>
              Arquivo da Solucao <span className="text-destructive">*</span>
            </Label>
            <FileDropzone
              file={file}
              onFileChange={setFile}
              error={errors.file}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
            Publicar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
