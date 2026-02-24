'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloudUpload, File, X, Loader2, FileText, AlertTriangle } from 'lucide-react';

interface KbFileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxFileSize: number;
  allowedFileTypes: string[];
  storageUsed: string;
  storageLimit: string;
  storagePercentage: number;
  onAnalyzed: (data: {
    suggestion: Record<string, unknown>;
    ai: Record<string, unknown>;
    categories: Array<Record<string, unknown>>;
    extraction: { text: string; wordCount: number; pageCount?: number };
    file: { name: string; type: string; size: number };
  }) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FILE_ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
};

export function KbFileUploadModal({
  open,
  onOpenChange,
  maxFileSize,
  allowedFileTypes,
  storageUsed,
  storageLimit,
  storagePercentage,
  onAnalyzed,
}: KbFileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<{
    text: string;
    wordCount: number;
    pageCount?: number;
  } | null>(null);

  const accept = Object.fromEntries(
    Object.entries(FILE_ACCEPT).filter(([mime]) => allowedFileTypes.includes(mime))
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxSize: maxFileSize,
    multiple: false,
    onDrop: (accepted) => {
      if (accepted.length > 0) {
        setFile(accepted[0]);
        setError(null);
        setExtraction(null);
      }
    },
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0];
      if (err?.code === 'file-too-large') {
        setError(`Arquivo excede o limite de ${formatSize(maxFileSize)}`);
      } else if (err?.code === 'file-invalid-type') {
        setError('Tipo de arquivo não permitido no seu plano');
      }
    },
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/kb/articles/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao processar arquivo');
      }

      const data = await res.json();
      setExtraction(data.extraction);
      onAnalyzed(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatLabels = allowedFileTypes
    .map((t) => {
      const map: Record<string, string> = {
        'application/pdf': 'PDF',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'text/plain': 'TXT',
        'text/markdown': 'MD',
      };
      return map[t] ?? t;
    })
    .join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileText size={18} />
            Upload de Arquivo
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Arraste um arquivo ou clique para selecionar.
            <br />
            Formatos aceitos: {formatLabels} — Tamanho máx: {formatSize(maxFileSize)}
          </p>

          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <input {...getInputProps()} />
              <CloudUpload
                size={36}
                className={`mx-auto mb-3 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <p className="text-sm text-muted-foreground">
                {isDragActive
                  ? 'Solte o arquivo aqui'
                  : 'Arraste seu arquivo aqui ou clique para selecionar'}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {formatLabels}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-md bg-accent/50 border">
                <File size={20} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => {
                    setFile(null);
                    setExtraction(null);
                  }}
                  disabled={loading}
                >
                  <X size={14} />
                </Button>
              </div>

              {extraction && (
                <div className="space-y-2">
                  <p className="text-xs text-emerald-400">
                    Texto extraído com sucesso ({extraction.wordCount.toLocaleString()} palavras)
                  </p>
                  {extraction.wordCount > 3000 && (
                    <div className="flex items-start gap-2 text-xs text-amber-400">
                      <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                      Documento extenso — a IA pode sugerir dividir em múltiplos artigos
                    </div>
                  )}
                  <ScrollArea className="h-[120px] rounded-md border p-3">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {extraction.text}
                    </p>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Storage bar */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Armazenamento: {storageUsed} / {storageLimit}
            </p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  storagePercentage > 95
                    ? 'bg-destructive'
                    : storagePercentage > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              Analisar com IA
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
