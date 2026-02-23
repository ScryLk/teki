'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
} from 'lucide-react';

interface TemplateField {
  id: string;
  fieldKey: string;
  fieldLabel: string;
  fieldType: string;
  fieldOptions: string[] | null;
  placeholder: string | null;
  required: boolean;
  aiWeight: string;
  displayOrder: number;
  subcategory: string | null;
}

interface CategoryInfo {
  category: string;
  fieldCount: number;
}

const aiWeightColors: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function TemplateConfigPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFields, setLoadingFields] = useState(false);
  const [showNewField, setShowNewField] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newField, setNewField] = useState({
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'text',
    fieldOptions: '',
    placeholder: '',
    required: false,
    aiWeight: 'medium',
  });

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/templates');
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const loadFields = async (category: string) => {
    setSelectedCategory(category);
    setLoadingFields(true);
    const res = await fetch(`/api/templates/${encodeURIComponent(category)}`);
    if (res.ok) setFields(await res.json());
    setLoadingFields(false);
  };

  const addField = async () => {
    if (!selectedCategory || !newField.fieldKey || !newField.fieldLabel) return;
    setSaving(true);

    const payload = {
      category: selectedCategory,
      fieldKey: newField.fieldKey,
      fieldLabel: newField.fieldLabel,
      fieldType: newField.fieldType,
      fieldOptions: newField.fieldType === 'select' && newField.fieldOptions
        ? newField.fieldOptions.split(',').map(o => o.trim()).filter(Boolean)
        : null,
      placeholder: newField.placeholder || null,
      required: newField.required,
      aiWeight: newField.aiWeight,
      displayOrder: fields.length,
    };

    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowNewField(false);
      setNewField({ fieldKey: '', fieldLabel: '', fieldType: 'text', fieldOptions: '', placeholder: '', required: false, aiWeight: 'medium' });
      loadFields(selectedCategory);
      fetchCategories();
    } else {
      const err = await res.json();
      alert(err.error || 'Erro ao adicionar campo');
    }
    setSaving(false);
  };

  const updateField = async (field: TemplateField, updates: Partial<TemplateField>) => {
    const res = await fetch('/api/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: field.id, ...updates }),
    });

    if (res.ok && selectedCategory) {
      loadFields(selectedCategory);
    }
  };

  const deleteField = async (id: string) => {
    if (!confirm('Remover este campo?')) return;
    const res = await fetch(`/api/templates?id=${id}`, { method: 'DELETE' });
    if (res.ok && selectedCategory) {
      loadFields(selectedCategory);
      fetchCategories();
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Configuração de Templates
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category List */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Categorias
          </h2>
          {categories.map((cat) => (
            <Card
              key={cat.category}
              className={`cursor-pointer transition-colors ${
                selectedCategory === cat.category
                  ? 'border-primary bg-primary/5'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => loadFields(cat.category)}
            >
              <CardContent className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium">{cat.category}</span>
                <Badge variant="secondary" className="text-xs">{cat.fieldCount} campos</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fields Editor */}
        <div className="lg:col-span-2">
          {!selectedCategory ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Selecione uma categoria para editar seus campos.
              </CardContent>
            </Card>
          ) : loadingFields ? (
            <div className="text-center py-12 text-muted-foreground">Carregando campos...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{selectedCategory}</h2>
                <Button size="sm" onClick={() => setShowNewField(true)} disabled={fields.length >= 20}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Campo
                </Button>
              </div>

              {fields.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Nenhum campo configurado.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {fields.map((field) => (
                    <Card key={field.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{field.fieldLabel}</span>
                              {field.required && <Badge variant="destructive" className="text-xs py-0">Obrigatório</Badge>}
                              <Badge variant="outline" className={`text-xs py-0 ${aiWeightColors[field.aiWeight]}`}>
                                {field.aiWeight}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <code>{field.fieldKey}</code>
                              <span>|</span>
                              <span>{field.fieldType}</span>
                              {field.fieldOptions && (
                                <>
                                  <span>|</span>
                                  <span>{(field.fieldOptions as string[]).length} opções</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Select
                              value={field.aiWeight}
                              onValueChange={(v) => updateField(field, { aiWeight: v })}
                            >
                              <SelectTrigger className="w-[100px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">high</SelectItem>
                                <SelectItem value="medium">medium</SelectItem>
                                <SelectItem value="low">low</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateField(field, { required: !field.required })}
                            >
                              {field.required ? 'Opcional' : 'Obrig.'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => deleteField(field.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Preview */}
              {fields.length > 0 && (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">
                      Preview do Formulário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fields.map((f) => (
                      <div key={f.fieldKey} className="space-y-1">
                        <Label className="text-xs">
                          {f.fieldLabel}
                          {f.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {f.fieldType === 'text' && <Input disabled placeholder={f.placeholder ?? ''} className="h-8 text-xs" />}
                        {f.fieldType === 'textarea' && <Input disabled placeholder={f.placeholder ?? ''} className="h-8 text-xs" />}
                        {f.fieldType === 'number' && <Input disabled type="number" className="h-8 text-xs" />}
                        {f.fieldType === 'date' && <Input disabled type="date" className="h-8 text-xs" />}
                        {f.fieldType === 'boolean' && (
                          <div className="flex items-center gap-2">
                            <Checkbox disabled />
                            <span className="text-xs text-muted-foreground">Sim</span>
                          </div>
                        )}
                        {f.fieldType === 'select' && (
                          <Select disabled>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                          </Select>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Field Dialog */}
      <Dialog open={showNewField} onOpenChange={setShowNewField}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Campo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Chave (snake_case)</Label>
                <Input
                  value={newField.fieldKey}
                  onChange={(e) => setNewField((p) => ({ ...p, fieldKey: e.target.value }))}
                  placeholder="ex: nome_campo"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Label</Label>
                <Input
                  value={newField.fieldLabel}
                  onChange={(e) => setNewField((p) => ({ ...p, fieldLabel: e.target.value }))}
                  placeholder="Nome exibido"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={newField.fieldType}
                  onValueChange={(v) => setNewField((p) => ({ ...p, fieldType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="textarea">Texto longo</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="boolean">Sim/Não</SelectItem>
                    <SelectItem value="select">Seleção</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Peso IA</Label>
                <Select
                  value={newField.aiWeight}
                  onValueChange={(v) => setNewField((p) => ({ ...p, aiWeight: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alto</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="low">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newField.fieldType === 'select' && (
              <div className="space-y-1.5">
                <Label>Opções (separadas por vírgula)</Label>
                <Input
                  value={newField.fieldOptions}
                  onChange={(e) => setNewField((p) => ({ ...p, fieldOptions: e.target.value }))}
                  placeholder="Opção 1, Opção 2, Opção 3"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Placeholder</Label>
              <Input
                value={newField.placeholder}
                onChange={(e) => setNewField((p) => ({ ...p, placeholder: e.target.value }))}
                placeholder="Texto de ajuda"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={newField.required}
                onCheckedChange={(v) => setNewField((p) => ({ ...p, required: !!v }))}
              />
              <Label>Campo obrigatório</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewField(false)}>
                Cancelar
              </Button>
              <Button onClick={addField} disabled={saving || !newField.fieldKey || !newField.fieldLabel}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
