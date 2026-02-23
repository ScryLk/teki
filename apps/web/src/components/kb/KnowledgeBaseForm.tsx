'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  Info,
} from 'lucide-react';
import { KbTagInput } from './KbTagInput';
import { CategorySelect } from './CategorySelect';
import { KbStatusBadge } from './KbStatusBadge';
import Link from 'next/link';
import type { KbCategoryData } from '@/lib/kb/types';
import type { KbArticleStatus, KbSolutionType, KbVisibility } from '@prisma/client';

interface FormData {
  title: string;
  categoryId: string;
  subcategory: string;
  tags: string[];
  softwareName: string;
  versionMin: string;
  versionMax: string;
  modules: string[];
  environments: string[];
  databases: string[];
  problemDescription: string;
  rootCause: string;
  solutionSteps: string;
  solutionType: KbSolutionType;
  prevention: string;
  notes: string;
  errorCodes: string[];
  errorMessages: string[];
  relatedTables: string[];
  relatedConfigs: string[];
  sqlQueries: string;
  commands: string;
  aiContextNote: string;
  priorityWeight: number;
  visibility: KbVisibility;
  status: KbArticleStatus;
}

const INITIAL_FORM: FormData = {
  title: '',
  categoryId: '',
  subcategory: '',
  tags: [],
  softwareName: '',
  versionMin: '',
  versionMax: '',
  modules: [],
  environments: [],
  databases: [],
  problemDescription: '',
  rootCause: '',
  solutionSteps: '',
  solutionType: 'PERMANENT_FIX',
  prevention: '',
  notes: '',
  errorCodes: [],
  errorMessages: [],
  relatedTables: [],
  relatedConfigs: [],
  sqlQueries: '',
  commands: '',
  aiContextNote: '',
  priorityWeight: 50,
  visibility: 'AI_AND_AGENTS',
  status: 'DRAFT',
};

interface KnowledgeBaseFormProps {
  articleId?: string;
}

export function KnowledgeBaseForm({ articleId }: KnowledgeBaseFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [categories, setCategories] = useState<KbCategoryData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!articleId);
  const [articleNumber, setArticleNumber] = useState<string>('');
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);

  // Collapsible state
  const [scopeOpen, setScopeOpen] = useState(true);
  const [techOpen, setTechOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  // Metrics (only for edit)
  const [metrics, setMetrics] = useState<{
    usageCount: number;
    successCount: number;
    failureCount: number;
    successRate: number;
    lastUsedAt: string | null;
    avgResolutionMinutes: number | null;
  } | null>(null);

  // Auto-save ref
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<string>('');

  const isEditing = !!articleId;

  // Fetch categories
  useEffect(() => {
    fetch('/api/kb/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  // Fetch article for edit
  useEffect(() => {
    if (!articleId) return;
    setIsLoading(true);
    fetch(`/api/kb/${articleId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) return;
        setForm({
          title: data.title || '',
          categoryId: data.categoryId || '',
          subcategory: data.subcategory || '',
          tags: data.tags || [],
          softwareName: data.softwareName || '',
          versionMin: data.versionMin || '',
          versionMax: data.versionMax || '',
          modules: data.modules || [],
          environments: data.environments || [],
          databases: data.databases || [],
          problemDescription: data.problemDescription || '',
          rootCause: data.rootCause || '',
          solutionSteps: data.solutionSteps || '',
          solutionType: data.solutionType || 'PERMANENT_FIX',
          prevention: data.prevention || '',
          notes: data.notes || '',
          errorCodes: data.errorCodes || [],
          errorMessages: data.errorMessages || [],
          relatedTables: data.relatedTables || [],
          relatedConfigs: data.relatedConfigs || [],
          sqlQueries: data.sqlQueries || '',
          commands: data.commands || '',
          aiContextNote: data.aiContextNote || '',
          priorityWeight: data.priorityWeight ?? 50,
          visibility: data.visibility || 'AI_AND_AGENTS',
          status: data.status || 'DRAFT',
        });
        setArticleNumber(data.articleNumber);
        setMetrics({
          usageCount: data.usageCount,
          successCount: data.successCount,
          failureCount: data.failureCount,
          successRate: data.successRate,
          lastUsedAt: data.lastUsedAt,
          avgResolutionMinutes: data.avgResolutionMinutes,
        });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [articleId]);

  // Auto-save for drafts every 30 seconds
  const autoSave = useCallback(async () => {
    if (!articleId || form.status !== 'DRAFT') return;

    const formJson = JSON.stringify(form);
    if (formJson === lastSavedRef.current) return;

    try {
      const res = await fetch(`/api/kb/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: formJson,
      });
      if (res.ok) {
        lastSavedRef.current = formJson;
        setAutoSavedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch {
      // Silent fail for auto-save
    }
  }, [articleId, form]);

  useEffect(() => {
    if (!articleId || form.status !== 'DRAFT') return;

    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setInterval(autoSave, 30000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [articleId, autoSave, form.status]);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Titulo e obrigatorio';
    if (form.title.length > 500) e.title = 'Titulo deve ter no maximo 500 caracteres';
    if (!form.categoryId) e.categoryId = 'Selecione uma categoria';
    if (!form.problemDescription.trim() || form.problemDescription.trim().length < 20) {
      e.problemDescription = 'Descricao do problema deve ter no minimo 20 caracteres';
    }
    if (!form.solutionSteps.trim() || form.solutionSteps.trim().length < 30) {
      e.solutionSteps = 'Passos de solucao devem ter no minimo 30 caracteres';
    }
    if (form.priorityWeight < 1 || form.priorityWeight > 100) {
      e.priorityWeight = 'Peso de prioridade deve ser entre 1 e 100';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (publishStatus: KbArticleStatus = 'DRAFT') => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = { ...form, status: publishStatus };

    try {
      const url = isEditing ? `/api/kb/${articleId}` : '/api/kb';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.details) {
          setErrors(data.error.details);
        }
        return;
      }

      router.push('/settings/knowledge-base');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="py-16 text-center">
          <Loader2 size={24} className="animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando artigo...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/settings/knowledge-base">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft size={16} />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-base">
                {isEditing ? 'Editar Artigo' : 'Novo Artigo da Base de Conhecimento'}
              </CardTitle>
              {articleNumber && (
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {articleNumber}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && <KbStatusBadge status={form.status} size="default" />}
            {autoSavedAt && (
              <span className="text-[10px] text-muted-foreground">
                Salvo as {autoSavedAt}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Identification */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            Identificacao
          </h3>

          <div className="space-y-1.5">
            <Label htmlFor="title">
              Titulo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Ex: Erro ao transmitir NFC-e - Rejeicao 656"
              className="text-sm"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>
                Categoria <span className="text-destructive">*</span>
              </Label>
              <CategorySelect
                categories={categories}
                value={form.categoryId}
                onValueChange={(v) => updateField('categoryId', v)}
              />
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Input
                id="subcategory"
                value={form.subcategory}
                onChange={(e) => updateField('subcategory', e.target.value)}
                placeholder="Ex: Transmissao NFC-e"
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <KbTagInput
              tags={form.tags}
              onChange={(tags) => updateField('tags', tags)}
              placeholder="Digite e pressione Enter..."
            />
          </div>
        </div>

        <Separator />

        {/* Section 2: Scope (collapsible) */}
        <Collapsible open={scopeOpen} onOpenChange={setScopeOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <h3 className="text-sm font-medium">Escopo de Aplicacao</h3>
            {scopeOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="softwareName">Software</Label>
                <Input
                  id="softwareName"
                  value={form.softwareName}
                  onChange={(e) => updateField('softwareName', e.target.value)}
                  placeholder="Ex: JPosto"
                  className="text-sm"
                />
              </div>
              {form.softwareName && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="versionMin">Versao minima</Label>
                    <Input
                      id="versionMin"
                      value={form.versionMin}
                      onChange={(e) => updateField('versionMin', e.target.value)}
                      placeholder="Ex: 1.400.0"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="versionMax">Versao maxima</Label>
                    <Input
                      id="versionMax"
                      value={form.versionMax}
                      onChange={(e) => updateField('versionMax', e.target.value)}
                      placeholder="Vazio = todas"
                      className="text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            {form.softwareName && (
              <div className="space-y-1.5">
                <Label>Modulos</Label>
                <KbTagInput
                  tags={form.modules}
                  onChange={(v) => updateField('modules', v)}
                  placeholder="Ex: PDV, Fiscal..."
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ambientes (SO)</Label>
                <KbTagInput
                  tags={form.environments}
                  onChange={(v) => updateField('environments', v)}
                  placeholder="Ex: Windows, Linux..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bancos de dados</Label>
                <KbTagInput
                  tags={form.databases}
                  onChange={(v) => updateField('databases', v)}
                  placeholder="Ex: PostgreSQL, Oracle..."
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Info size={12} />
              Deixe em branco para aplicar a todos os contextos.
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Section 3: Content */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Conteudo</h3>

          <div className="space-y-1.5">
            <Label htmlFor="problemDescription">
              Descricao do Problema <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="problemDescription"
              value={form.problemDescription}
              onChange={(e) => updateField('problemDescription', e.target.value)}
              placeholder="Descreva o que o cliente relata, como o problema se manifesta e em qual contexto ocorre."
              rows={4}
              className="text-sm resize-none"
            />
            {errors.problemDescription && (
              <p className="text-xs text-destructive">{errors.problemDescription}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rootCause">Causa Raiz</Label>
            <Textarea
              id="rootCause"
              value={form.rootCause}
              onChange={(e) => updateField('rootCause', e.target.value)}
              placeholder="Por que o problema acontece tecnicamente."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="solutionSteps">
              Passos de Solucao <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="solutionSteps"
              value={form.solutionSteps}
              onChange={(e) => updateField('solutionSteps', e.target.value)}
              placeholder="1. Primeiro passo...&#10;2. Segundo passo...&#10;3. Terceiro passo..."
              rows={6}
              className="text-sm resize-none"
            />
            {errors.solutionSteps && (
              <p className="text-xs text-destructive">{errors.solutionSteps}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de Solucao</Label>
            <Select
              value={form.solutionType}
              onValueChange={(v) => updateField('solutionType', v as KbSolutionType)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERMANENT_FIX">Correcao definitiva</SelectItem>
                <SelectItem value="WORKAROUND">Contorno temporario</SelectItem>
                <SelectItem value="CONFIGURATION">Configuracao</SelectItem>
                <SelectItem value="KNOWN_ISSUE">Problema conhecido</SelectItem>
                <SelectItem value="INFORMATIONAL">Informativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prevention">Prevencao</Label>
            <Textarea
              id="prevention"
              value={form.prevention}
              onChange={(e) => updateField('prevention', e.target.value)}
              placeholder="O que fazer para evitar que ocorra novamente."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observacoes Internas</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Notas visiveis apenas para a equipe (nao enviadas a IA por padrao)."
              rows={2}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <Separator />

        {/* Section 4: Technical Data (collapsible, closed by default) */}
        <Collapsible open={techOpen} onOpenChange={setTechOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <h3 className="text-sm font-medium">Dados Tecnicos</h3>
            {techOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label>Codigos de erro</Label>
              <KbTagInput
                tags={form.errorCodes}
                onChange={(v) => updateField('errorCodes', v)}
                placeholder='Ex: 656, ERR_CONNECTION_REFUSED...'
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="errorMessages">Mensagens de erro</Label>
              <Textarea
                id="errorMessages"
                value={form.errorMessages.join('\n')}
                onChange={(e) => updateField('errorMessages', e.target.value.split('\n').filter(Boolean))}
                placeholder="Uma mensagem por linha..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tabelas relacionadas</Label>
                <KbTagInput
                  tags={form.relatedTables}
                  onChange={(v) => updateField('relatedTables', v)}
                  placeholder="Ex: pdvnfs, nfedadosadicionais..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Configuracoes envolvidas</Label>
                <KbTagInput
                  tags={form.relatedConfigs}
                  onChange={(v) => updateField('relatedConfigs', v)}
                  placeholder="Ex: porta_impressora..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sqlQueries">Queries SQL uteis</Label>
              <Textarea
                id="sqlQueries"
                value={form.sqlQueries}
                onChange={(e) => updateField('sqlQueries', e.target.value)}
                placeholder="SELECT * FROM ..."
                rows={4}
                className="text-sm resize-none font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="commands">Comandos de terminal</Label>
              <Textarea
                id="commands"
                value={form.commands}
                onChange={(e) => updateField('commands', e.target.value)}
                placeholder="systemctl restart service..."
                rows={3}
                className="text-sm resize-none font-mono text-xs"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Section 5: AI Configuration (collapsible, closed by default) */}
        <Collapsible open={aiOpen} onOpenChange={setAiOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1">
            <h3 className="text-sm font-medium">Configuracao de IA</h3>
            {aiOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            <div className="space-y-1.5">
              <Label htmlFor="aiContextNote">Nota de contexto para IA</Label>
              <Textarea
                id="aiContextNote"
                value={form.aiContextNote}
                onChange={(e) => updateField('aiContextNote', e.target.value)}
                placeholder='Ex: "Esta solucao exige reiniciar o servico, confirmar com cliente antes"'
                rows={3}
                className="text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priorityWeight">
                Peso de prioridade ({form.priorityWeight}/100)
              </Label>
              <input
                id="priorityWeight"
                type="range"
                min={1}
                max={100}
                value={form.priorityWeight}
                onChange={(e) => updateField('priorityWeight', parseInt(e.target.value))}
                className="w-full accent-primary"
              />
              {errors.priorityWeight && (
                <p className="text-xs text-destructive">{errors.priorityWeight}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Visibilidade</Label>
              <Select
                value={form.visibility}
                onValueChange={(v) => updateField('visibility', v as KbVisibility)}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI_AND_AGENTS">IA e atendentes</SelectItem>
                  <SelectItem value="AI_ONLY">Somente IA</SelectItem>
                  <SelectItem value="AGENTS_ONLY">Somente atendentes</SelectItem>
                  <SelectItem value="PUBLIC">Publico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Section 6: Metrics (edit only) */}
        {isEditing && metrics && metrics.usageCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Metricas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Usado pela IA</p>
                  <p className="text-lg font-semibold">{metrics.usageCount}x</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Taxa de sucesso</p>
                  <p className="text-lg font-semibold">{Math.round(metrics.successRate)}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Ultimo uso</p>
                  <p className="text-sm font-medium">
                    {metrics.lastUsedAt
                      ? new Date(metrics.lastUsedAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground">Tempo medio</p>
                  <p className="text-sm font-medium">
                    {metrics.avgResolutionMinutes ? `${metrics.avgResolutionMinutes} min` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/settings/knowledge-base">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Salvar Rascunho
            </Button>
            <Button
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isSubmitting}
              className="gap-1.5 bg-white text-black hover:bg-white/90"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Publicar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
