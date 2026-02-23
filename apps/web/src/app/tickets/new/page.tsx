'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { DynamicForm, type DynamicField } from '@/components/tickets/DynamicForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ClientOption {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
}

interface CategoryOption {
  category: string;
  fieldCount: number;
}

export default function NewTicketPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    category: '',
    subcategory: '',
    priority: 'medium' as string,
    summary: '',
    description: '',
    stepsToReproduce: [''],
    frequency: '',
    impact: '',
    errorCode: '',
    errorMessage: '',
  });

  const [categoryFieldValues, setCategoryFieldValues] = useState<Record<string, unknown>>({});

  const searchClients = useCallback(async (search: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/clients${params}`);
    if (res.ok) {
      const data = await res.json();
      setClients(data);
    }
  }, []);

  useEffect(() => {
    searchClients('');
    fetch('/api/templates')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, [searchClients]);

  useEffect(() => {
    const timer = setTimeout(() => searchClients(clientSearch), 300);
    return () => clearTimeout(timer);
  }, [clientSearch, searchClients]);

  const loadCategoryFields = async (category: string) => {
    if (!category) {
      setDynamicFields([]);
      return;
    }
    setLoadingFields(true);
    const res = await fetch(`/api/templates/${encodeURIComponent(category)}`);
    if (res.ok) {
      const fields = await res.json();
      setDynamicFields(fields);
      setCategoryFieldValues({});
    }
    setLoadingFields(false);
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
    loadCategoryFields(category);
  };

  const handleStepChange = (index: number, value: string) => {
    setFormData((prev) => {
      const steps = [...prev.stepsToReproduce];
      steps[index] = value;
      return { ...prev, stepsToReproduce: steps };
    });
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      stepsToReproduce: [...prev.stepsToReproduce, ''],
    }));
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      stepsToReproduce: prev.stepsToReproduce.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      clientId: formData.clientId,
      category: formData.category,
      subcategory: formData.subcategory || null,
      priority: formData.priority,
      summary: formData.summary,
      description: formData.description || null,
      categoryFields: Object.keys(categoryFieldValues).length > 0 ? categoryFieldValues : null,
      error:
        formData.errorCode || formData.errorMessage
          ? { code: formData.errorCode || undefined, message: formData.errorMessage || undefined }
          : null,
      stepsToReproduce: formData.stepsToReproduce.filter((s) => s.trim()),
      frequency: formData.frequency || null,
      impact: formData.impact || null,
    };

    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const ticket = await res.json();
      router.push(`/tickets/${ticket.id}`);
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao criar ticket');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Novo Ticket</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Buscar por nome, documento ou email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
            <Select
              value={formData.clientId}
              onValueChange={(val) => setFormData((p) => ({ ...p, clientId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.document ? `(${c.document})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Issue Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Problema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Categoria <span className="text-destructive">*</span></Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.category} value={c.category}>
                        {c.category} ({c.fieldCount} campos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(val) => setFormData((p) => ({ ...p, priority: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Resumo <span className="text-destructive">*</span></Label>
              <Input
                placeholder="Descrição curta do problema em 1 linha"
                value={formData.summary}
                onChange={(e) => setFormData((p) => ({ ...p, summary: e.target.value }))}
                required
                maxLength={500}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descrição detalhada</Label>
              <Textarea
                placeholder="Descreva o problema com mais detalhes..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Frequência</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(val) => setFormData((p) => ({ ...p, frequency: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Sempre</SelectItem>
                    <SelectItem value="intermittent">Intermitente</SelectItem>
                    <SelectItem value="first_time">Primeira vez</SelectItem>
                    <SelectItem value="after_update">Após atualização</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Impacto</Label>
                <Select
                  value={formData.impact}
                  onValueChange={(val) => setFormData((p) => ({ ...p, impact: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">Todos os usuários</SelectItem>
                    <SelectItem value="some_users">Alguns usuários</SelectItem>
                    <SelectItem value="single_user">Usuário único</SelectItem>
                    <SelectItem value="single_machine">Máquina única</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações de Erro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Código do erro</Label>
                <Input
                  placeholder="Ex: ERR-5001"
                  value={formData.errorCode}
                  onChange={(e) => setFormData((p) => ({ ...p, errorCode: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mensagem de erro</Label>
                <Input
                  placeholder="Mensagem exibida"
                  value={formData.errorMessage}
                  onChange={(e) => setFormData((p) => ({ ...p, errorMessage: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Steps to Reproduce */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Passos para Reproduzir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.stepsToReproduce.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                <Input
                  placeholder={`Passo ${i + 1}`}
                  value={step}
                  onChange={(e) => handleStepChange(i, e.target.value)}
                />
                {formData.stepsToReproduce.length > 1 && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeStep(i)}>
                    X
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              + Adicionar passo
            </Button>
          </CardContent>
        </Card>

        {/* Dynamic Category Fields */}
        {formData.category && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Campos Específicos: {formData.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFields ? (
                <div className="text-center py-4 text-muted-foreground">
                  Carregando campos...
                </div>
              ) : dynamicFields.length > 0 ? (
                <DynamicForm
                  fields={dynamicFields}
                  values={categoryFieldValues}
                  onChange={(key, value) =>
                    setCategoryFieldValues((prev) => ({ ...prev, [key]: value }))
                  }
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum campo dinâmico configurado para esta categoria.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/tickets">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading || !formData.clientId || !formData.category || !formData.summary}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Abrir Ticket'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
