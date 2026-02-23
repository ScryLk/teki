'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface DynamicField {
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

interface DynamicFormProps {
  fields: DynamicField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  errors?: Record<string, string>;
}

export function DynamicForm({ fields, values, onChange, errors }: DynamicFormProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.fieldKey} className="space-y-1.5">
          <Label htmlFor={field.fieldKey} className="text-sm font-medium">
            {field.fieldLabel}
            {field.required && <span className="text-destructive ml-1">*</span>}
            {field.aiWeight === 'high' && (
              <span className="ml-2 text-xs text-blue-400 font-normal">(importante para diagnóstico)</span>
            )}
          </Label>

          {field.fieldType === 'text' && (
            <Input
              id={field.fieldKey}
              placeholder={field.placeholder ?? undefined}
              value={(values[field.fieldKey] as string) ?? ''}
              onChange={(e) => onChange(field.fieldKey, e.target.value)}
              required={field.required}
            />
          )}

          {field.fieldType === 'textarea' && (
            <Textarea
              id={field.fieldKey}
              placeholder={field.placeholder ?? undefined}
              value={(values[field.fieldKey] as string) ?? ''}
              onChange={(e) => onChange(field.fieldKey, e.target.value)}
              required={field.required}
              rows={3}
            />
          )}

          {field.fieldType === 'number' && (
            <Input
              id={field.fieldKey}
              type="number"
              placeholder={field.placeholder ?? undefined}
              value={(values[field.fieldKey] as string) ?? ''}
              onChange={(e) => onChange(field.fieldKey, e.target.value ? Number(e.target.value) : '')}
              required={field.required}
            />
          )}

          {field.fieldType === 'date' && (
            <Input
              id={field.fieldKey}
              type="date"
              value={(values[field.fieldKey] as string) ?? ''}
              onChange={(e) => onChange(field.fieldKey, e.target.value)}
              required={field.required}
            />
          )}

          {field.fieldType === 'boolean' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={field.fieldKey}
                checked={(values[field.fieldKey] as boolean) ?? false}
                onCheckedChange={(checked) => onChange(field.fieldKey, checked)}
              />
              <Label htmlFor={field.fieldKey} className="text-sm font-normal text-muted-foreground">
                Sim
              </Label>
            </div>
          )}

          {field.fieldType === 'select' && field.fieldOptions && (
            <Select
              value={(values[field.fieldKey] as string) ?? ''}
              onValueChange={(val) => onChange(field.fieldKey, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder ?? 'Selecione...'} />
              </SelectTrigger>
              <SelectContent>
                {(field.fieldOptions as string[]).map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {errors?.[field.fieldKey] && (
            <p className="text-xs text-destructive">{errors[field.fieldKey]}</p>
          )}
        </div>
      ))}
    </div>
  );
}
