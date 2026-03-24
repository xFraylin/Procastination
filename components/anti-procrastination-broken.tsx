'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
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
import { AlertTriangle, Clock, Zap } from 'lucide-react';

const aggressiveMessages = [
  "Estas evitando la ejecucion.",
  "Deja de procrastinar. Empieza AHORA.",
  "Cada minuto perdido es un minuto que no vuelve.",
  "Disciplina es elegir lo que mas quieres sobre lo que quieres ahora.",
  "Vas a dejar que otro dia se escape?",
  "La accion vence a la intencion. Siempre.",
  "El unico camino es atravesarlo.",
];

export function AntiProcrastination() {
  const {
    tasks,
    isFocusMode,
    lastInteraction,
    setLastInteraction,
    idleWarningShown,
    setIdleWarningShown,
    settings,
    setCurrentView,
  } = useAppStore();
  
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const pendingTasks = tasks.filter(t => t.completed === 0);
  const notificationInterval = settings && settings.notification_interval 
    ? parseInt(settings.notification_interval) * 60 * 1000 
    : 5 * 60 * 1000; // Default: 5 minutos
  
  // Rastrear interaccion del usuario
  useEffect(() => {
    const handleInteraction = () => {
      setLastInteraction(Date.now());
      setIdleWarningShown(false);
    };
    
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);
    
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [setLastInteraction, setIdleWarningShown]);
  
  // Deteccion de inactividad
  useEffect(() => {
    if (isFocusMode || pendingTasks.length === 0) return;
    
    const checkIdle = setInterval(() => {
      const idleTime = Date.now() - lastInteraction;
      const idleThreshold = 2 * 60 * 1000; // 2 minutos
      
      if (idleTime > idleThreshold && !idleWarningShown) {
        const randomMessage = aggressiveMessages[Math.floor(Math.random() * aggressiveMessages.length)];
        setWarningMessage(randomMessage);
        setShowWarning(true);
        setIdleWarningShown(true);
      }
    }, 30000); // Verificar cada 30 segundos
    
    return () => clearInterval(checkIdle);
  }, [lastInteraction, idleWarningShown, isFocusMode, pendingTasks.length, setIdleWarningShown]);
  
  // Notificaciones del navegador
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Solicitar permiso de notificaciones
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Limpiar intervalo existente
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    
    if (pendingTasks.length === 0 || isFocusMode) return;
    
    // Configurar notificaciones periodicas
    notificationIntervalRef.current = setInterval(() => {
      if ('Notification' in window && Notification.permission === 'granted' && pendingTasks.length > 0) {
        new Notification('EJECUTA: Tareas Pendientes', {
          body: `Tienes ${pendingTasks.length} tarea${pendingTasks.length > 1 ? 's' : ''} esperando. Deja de evitar la ejecucion.`,
          icon: '/icon.svg',
          tag: 'pending-tasks',
        });
      }
    }, notificationInterval);
    
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [pendingTasks.length, notificationInterval, isFocusMode]);
  
  const handleStartNow = () => {
    setShowWarning(false);
    setCurrentView('tasks');
  };
  
  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="bg-card border-destructive/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-lg font-bold tracking-wider">INACTIVIDAD DETECTADA</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground text-base mt-4">
            {warningMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 p-4 border border-border bg-secondary/50">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {pendingTasks.length} tarea{pendingTasks.length !== 1 ? 's' : ''} pendiente{pendingTasks.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                El tiempo pasa. Tus tareas estan esperando.
              </p>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs tracking-wider">
            ENTIENDO
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleStartNow}
            className="bg-destructive hover:bg-destructive/90 text-xs tracking-wider font-bold"
          >
            <Zap className="h-4 w-4 mr-2" />
            EMPEZAR AHORA
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
