'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteSolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  solutionTitle?: string;
}

export function DeleteSolutionDialog({
  open,
  onOpenChange,
  onConfirm,
  solutionTitle,
}: DeleteSolutionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Excluir Solucao</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir{' '}
            {solutionTitle ? (
              <strong>&ldquo;{solutionTitle}&rdquo;</strong>
            ) : (
              'esta solucao'
            )}
            ? Esta acao ira remover o arquivo e os dados indexados.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
