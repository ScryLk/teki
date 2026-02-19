'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { KBDocumentItem } from './KBDocumentItem';
import { useKnowledgeBase } from '@/hooks/useAgent';

interface KnowledgeBaseManagerProps {
  agentId: string;
}

const ACCEPT_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export function KnowledgeBaseManager({ agentId }: KnowledgeBaseManagerProps) {
  const { documents, loading, uploading, uploadDocument, deleteDocument } =
    useKnowledgeBase(agentId);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploadError(null);
      for (const file of acceptedFiles) {
        try {
          await uploadDocument(file);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'Erro ao enviar arquivo');
        }
      }
    },
    [uploadDocument]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_TYPES,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm">Knowledge Base</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Envie documentos para que sua IA use como referência nas respostas.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 size={24} className="animate-spin text-primary" />
        ) : (
          <Upload size={24} className="text-muted-foreground" />
        )}
        <p className="mt-2 text-sm text-muted-foreground text-center">
          {uploading
            ? 'Processando documento...'
            : isDragActive
              ? 'Solte o arquivo aqui'
              : 'Arrastar arquivos ou clicar para upload'}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          PDF, TXT, MD, CSV, DOCX — Máx: 10MB
        </p>
      </div>

      {uploadError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin text-muted-foreground" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Documentos ({documents.length})
          </Label>
          {documents.map((doc) => (
            <KBDocumentItem
              key={doc.id}
              id={doc.id}
              fileName={doc.fileName}
              fileSize={doc.fileSize}
              fileType={doc.fileType}
              onDelete={deleteDocument}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">
          Nenhum documento enviado ainda.
        </p>
      )}
    </div>
  );
}
