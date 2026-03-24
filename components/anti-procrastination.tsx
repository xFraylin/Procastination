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
  
  // Verificación segura de settings
  const getNotificationInterval = () => {
    if (!settings) return 5 * 60 * 1000; // Default: 5 minutos
    if (!settings.notification_interval) return 5 * 60 * 1000;
    const interval = parseInt(settings.notification_interval);
    return isNaN(interval) ? 5 * 60 * 1000 : interval * 60 * 1000;
  };
  
  const pendingTasks = tasks.filter(t => t.completed === 0);
  const notificationInterval = getNotificationInterval();
  
  // Rastrear interaccion del usuario
  useEffect(() => {
    const handleInteraction = () => {
      setLastInteraction(Date.now());
      setIdleWarningShown(false);
    };
    
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
    };
  }, [setLastInteraction, setIdleWarningShown]);
  
  // Sistema de notificaciones
  useEffect(() => {
    if (isFocusMode || pendingTasks.length === 0) return;
    
    const checkIdleTime = () => {
      const now = Date.now();
      const timeSinceLastInteraction = now - lastInteraction;
      
      // Si ha pasado mucho tiempo sin interaccion
      if (timeSinceLastInteraction > notificationInterval && !idleWarningShown) {
        const randomMessage = aggressiveMessages[Math.floor(Math.random() * aggressiveMessages.length)];
        setWarningMessage(randomMessage);
        setShowWarning(true);
        setIdleWarningShown(true);
        
        // Mostrar notificacion del navegador si esta disponible
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ EJECUTA', {
            body: randomMessage,
            icon: '/favicon.ico',
          });
        }
      }
    };
    
    // Configurar intervalo de verificacion
    notificationIntervalRef.current = setInterval(checkIdleTime, 30000); // Verificar cada 30 segundos
    
    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [isFocusMode, pendingTasks.length, lastInteraction, idleWarningShown, setIdleWarningShown, notificationInterval]);
  
  // Solicitar permiso de notificacion
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const handleStartWorking = () => {
    setShowWarning(false);
    setLastInteraction(Date.now());
    setCurrentView('tasks');
  };
  
  const handleDismiss = () => {
    setShowWarning(false);
    setLastInteraction(Date.now());
  };
  
  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="bg-destructive/10 border-destructive/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            ¡ALERTA DE PROCRASTINACIÓN!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-destructive/80">
            {warningMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>
            Ignorar
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleStartWorking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Empezar a Trabajar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
