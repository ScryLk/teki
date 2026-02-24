'use client';

import { IconLock, IconPencil } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

interface LockedEmailFieldProps {
  email: string;
  onChangeEmail?: () => void;
}

export function LockedEmailField({ email, onChangeEmail }: LockedEmailFieldProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <IconLock className="size-4 text-muted-foreground" />
      <span className="flex-1 truncate text-sm text-foreground">{email}</span>
      {onChangeEmail && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onChangeEmail}
          aria-label="Trocar email"
        >
          <IconPencil className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
