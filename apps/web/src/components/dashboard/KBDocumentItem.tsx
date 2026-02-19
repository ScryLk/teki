'use client';

import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KBDocumentItemProps {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  onDelete: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KBDocumentItem({ id, fileName, fileSize, fileType, onDelete }: KBDocumentItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-md border px-3 py-2">
      <FileText size={16} className="shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{fileName}</p>
        <p className="text-[10px] text-muted-foreground uppercase">
          {fileType} &middot; {formatFileSize(fileSize)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
        onClick={() => onDelete(id)}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  );
}
