'use client';

import { useState } from 'react';
import { useAbsoluteLock } from '@/hooks/use-absolute-lock';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

export function ActivateLockButton() {
  const { activateAbsoluteLock, lockStatus } = useAbsoluteLock();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Modo disciplina activado');
  const [confirmHardcore, setConfirmHardcore] = useState(false);

  const handleActivate = () => {
    if (!confirmHardcore) {
      alert('Debes confirmar que entiendes las consecuencias del modo hardcore.');
      return;
    }
    
    activateAbsoluteLock(reason);
    setOpen(false);
    setConfirmHardcore(false);
  };

  const lockReasons = [
    { value: 'Modo disciplina activado', label: 'Disciplina Diaria' },
    { value: 'Proyecto urgente - Sin distracciones', label: 'Proyecto Urgente' },
    { value: 'Recuperando foco perdido', label: 'Recuperar Foco' },
    { value: 'Modo examen - Estudio intensivo', label: 'Modo Examen' },
    { value: 'Deadlines cercanos - Ejecución obligatoria', label: 'Deadlines Cercanos' },
  ];

  if (lockStatus.isActive) {
    return null; // No mostrar si ya está activo
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          <Lock className="h-4 w-4 mr-2" />
          Activar Bloqueo Absoluto
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" />
            Activar Modo Disciplina Absoluto
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Este modo bloqueará completamente el acceso a otras partes de la aplicación hasta que completes todas tus tareas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advertencia */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-destructive">ADVERTENCIA: MODO HARDCORE</h4>
                <ul className="text-sm text-destructive/80 space-y-1">
                  <li>• No podrás navegar a otras secciones</li>
                  <li>• Solo podrás acceder a tareas pendientes</li>
                  <li>• Debes completar TODAS las tareas para desbloquear</li>
                  <li>• El bloqueo solo se desactiva con tareas completadas</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Razón del bloqueo */}
          <div className="space-y-3">
            <label className="text-sm font-medium">¿Por qué activas el bloqueo?</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 bg-input border border-border rounded-lg text-sm"
            >
              {lockReasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Confirmación Hardcore */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-medium">Confirmo que entiendo las consecuencias</label>
              <p className="text-xs text-muted-foreground mt-1">
                Entiendo que no podré acceder a otras funciones hasta completar todas mis tareas
              </p>
            </div>
            <Switch 
              checked={confirmHardcore}
              onCheckedChange={setConfirmHardcore}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleActivate}
              disabled={!confirmHardcore}
              className="flex-1 bg-destructive hover:bg-destructive/90"
            >
              <Lock className="h-4 w-4 mr-2" />
              Activar Bloqueo
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-xs text-muted-foreground text-center border-t border-border pt-4">
            <p>Puedes forzar el desbloqueo en caso de emergencia, pero afectará tu progreso de disciplina.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
