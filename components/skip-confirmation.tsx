'use client';

import { useState } from 'react';
import { Task } from '@/lib/store';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface SkipConfirmationProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SkipConfirmation({ task, open, onOpenChange, onConfirm }: SkipConfirmationProps) {
  if (!task) return null;
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border-destructive/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-lg font-bold tracking-wider">CONFIRMAR ELIMINACION</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground text-base mt-4">
            Estas a punto de eliminar: <strong>"{task.title}"</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 p-4 border border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive font-medium">
            ADVERTENCIA: Eliminar tareas afecta tu puntuacion de disciplina.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Estas evitando esta tarea porque es dificil? Exactamente por eso necesitas hacerla.
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs tracking-wider">
            MANTENER TAREA
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive hover:bg-destructive/90 text-xs tracking-wider font-bold"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            ELIMINAR DE TODOS MODOS
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
