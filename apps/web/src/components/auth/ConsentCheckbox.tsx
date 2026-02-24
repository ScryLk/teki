'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  required,
  disabled,
  children,
  className,
}: ConsentCheckboxProps) {
  return (
    <div className={cn('flex items-start gap-2', className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(val) => onCheckedChange(val === true)}
        disabled={disabled}
        className="mt-0.5"
        required={required}
      />
      <Label
        htmlFor={id}
        className="text-xs leading-relaxed text-muted-foreground font-normal cursor-pointer"
      >
        {children}
      </Label>
    </div>
  );
}
