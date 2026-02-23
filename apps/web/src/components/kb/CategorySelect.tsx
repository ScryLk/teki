'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bug,
  Database,
  Printer,
  Wifi,
  Gauge,
  Plug,
  Settings,
  ShieldCheck,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { KbCategoryData } from '@/lib/kb/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  bug: Bug,
  database: Database,
  printer: Printer,
  wifi: Wifi,
  gauge: Gauge,
  plug: Plug,
  settings: Settings,
  'shield-check': ShieldCheck,
  'file-text': FileText,
  'help-circle': HelpCircle,
};

interface CategorySelectProps {
  categories: KbCategoryData[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySelect({
  categories,
  value,
  onValueChange,
  placeholder = 'Selecione a categoria...',
}: CategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.filter((c) => c.active).map((cat) => {
          const Icon = ICON_MAP[cat.icon || ''] || HelpCircle;
          return (
            <SelectItem key={cat.id} value={cat.id}>
              <span className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center w-4 h-4 rounded"
                  style={{ color: cat.color || '#9CA3AF' }}
                >
                  <Icon size={12} />
                </span>
                {cat.name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
