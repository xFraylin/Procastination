'use client';

import { useAppStore } from '@/lib/store';
import { Lock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DisciplineTimer } from '@/components/discipline-timer';

export function AbsoluteLock() {
  const { 
    isAbsoluteLockActive, 
    lockReason, 
    getAbsoluteLockStatus,
    setAbsoluteLockActive,
    setCurrentView,
    tasks
  } = useAppStore();

  const lockStatus = getAbsoluteLockStatus();

  // Si no está activo, no mostrar nada
  if (!lockStatus.isActive) return null;

  const progressPercentage = lockStatus.totalTasks > 0 
    ? ((lockStatus.totalTasks - lockStatus.tasksRemaining) / lockStatus.totalTasks) * 100 
    : 0;

  const handleForceUnlock = () => {
    if (confirm('⚠️ ADVERTENCIA: Estás a punto de romper tu disciplina. ¿Seguro que quieres desbloquear? Esto afectará tu progreso.')) {
      setAbsoluteLockActive(false);
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-destructive/10 rounded-full">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            MODO DISCIPLINA ACTIVO
          </h1>
          <p className="text-sm text-muted-foreground">
            Completa tus tareas para continuar
          </p>
        </div>

        {/* Reason */}
        {lockReason && (
          <div className="bg-muted/50 border border-border rounded-lg p-3">
            <p className="text-sm text-muted-foreground text-center">
              {lockReason}
            </p>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso de ejecución</span>
            <span className="font-medium">
              {lockStatus.totalTasks - lockStatus.tasksRemaining} / {lockStatus.totalTasks}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {Math.round(progressPercentage)}%
            </p>
            <p className="text-xs text-muted-foreground">
              {lockStatus.tasksRemaining > 0 
                ? `${lockStatus.tasksRemaining} tarea${lockStatus.tasksRemaining > 1 ? 's' : ''} pendiente${lockStatus.tasksRemaining > 1 ? 's' : ''}`
                : 'Todas completadas'
              }
            </p>
          </div>
        </div>

        {/* Temporizador de Disciplina */}
        <DisciplineTimer />

        {/* Status */}
        <div className={`rounded-lg p-4 text-center ${
          lockStatus.canUnlock 
            ? 'bg-success/10 border border-success/20' 
            : 'bg-destructive/10 border border-destructive/20'
        }`}>
          {lockStatus.canUnlock ? (
            <>
              <CheckCircle2 className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-success">
                ¡Todas las tareas completadas!
              </p>
              <p className="text-xs text-success mt-1">
                Puedes continuar usando la aplicación
              </p>
              <Button 
                onClick={() => setAbsoluteLockActive(false)}
                className="mt-3 w-full"
              >
                Desbloquear y Continuar
              </Button>
            </>
          ) : (
            <>
              <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium text-destructive">
                BLOQUEO ACTIVO
              </p>
              <p className="text-xs text-destructive mt-1">
                No puedes acceder a otras secciones hasta completar tus tareas
              </p>
            </>
          )}
        </div>

        {/* Force Unlock (Emergency) */}
        {!lockStatus.canUnlock && (
          <div className="pt-4 border-t border-border">
            <Button 
              variant="outline" 
              onClick={handleForceUnlock}
              className="w-full text-xs"
            >
              Forzar Desbloqueo (No Recomendado)
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Esto romperá tu disciplina y afectará tu progreso
            </p>
          </div>
        )}

        {/* Tasks Preview */}
        {lockStatus.tasksRemaining > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Tareas pendientes:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {tasks
                .filter(t => t.date === new Date().toISOString().split('T')[0] && t.completed === 0)
                .slice(0, 3)
                .map(task => (
                  <div key={task.id} className="text-xs bg-muted/50 rounded p-2">
                    <span className="font-medium">{task.title}</span>
                    <span className="text-muted-foreground ml-2">
                      ({task.category})
                    </span>
                  </div>
                ))}
              {lockStatus.tasksRemaining > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ... y {lockStatus.tasksRemaining - 3} más
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
