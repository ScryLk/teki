'use client';

import { useDropzone } from 'react-dropzone';
import { CloudUpload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
}

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({ file, onFileChange, error }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxSize: MAX_SIZE,
    multiple: false,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        onFileChange(accepted[0]);
      }
    },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') {
        alert('Arquivo excede o limite de 10MB.');
      } else if (err?.code === 'file-invalid-type') {
        alert('Tipo de arquivo nao permitido. Use PDF, DOC ou DOCX.');
      }
    },
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : error
              ? 'border-destructive/50 bg-destructive/5'
              : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50'
        }`}
      >
        <input {...getInputProps()} />
        <CloudUpload
          size={32}
          className={`mx-auto mb-3 ${
            isDragActive ? 'text-primary' : 'text-muted-foreground'
          }`}
        />
        <p className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Solte o arquivo aqui'
            : 'Arraste o arquivo aqui ou clique para selecionar'}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          PDF, DOC ou DOCX (max. 10MB)
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {file && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50 border">
          <File size={16} className="text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
          >
            <X size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
