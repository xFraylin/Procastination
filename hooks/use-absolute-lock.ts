'use client';

import { useEffect } from 'react';
import { useAppStore, View } from '@/lib/store';

export function useAbsoluteLock() {
  const { 
    isAbsoluteLockActive, 
    getAbsoluteLockStatus, 
    setCurrentView,
    completeTask 
  } = useAppStore();

  useEffect(() => {
    const lockStatus = getAbsoluteLockStatus();
    
    // Si el bloqueo está activo y no se puede desbloquear
    if (lockStatus.isActive && !lockStatus.canUnlock) {
      // Forzar navegación a tareas
      setCurrentView('tasks');
    }
    
    // Si todas las tareas están completadas y el bloqueo sigue activo
    if (lockStatus.isActive && lockStatus.canUnlock) {
      // Opcional: mostrar notificación de desbloqueo disponible
      console.log('¡Todas las tareas completadas! Puedes desbloquear la aplicación.');
    }
  }, [isAbsoluteLockActive, getAbsoluteLockStatus, setCurrentView]);

  // Función para activar el bloqueo absoluto
  const activateAbsoluteLock = (reason: string = 'Modo disciplina activado') => {
    const { setAbsoluteLockActive, setLockReason } = useAppStore.getState();
    setAbsoluteLockActive(true);
    setLockReason(reason);
    setCurrentView('tasks');
  };

  // Función para desactivar el bloqueo (solo si todas las tareas están completadas)
  const deactivateAbsoluteLock = () => {
    const lockStatus = getAbsoluteLockStatus();
    if (lockStatus.canUnlock) {
      const { setAbsoluteLockActive, setLockReason } = useAppStore.getState();
      setAbsoluteLockActive(false);
      setLockReason('');
      setCurrentView('dashboard');
    }
  };

  // Función para verificar si se puede navegar a una vista
  const canNavigateTo = (view: View): boolean => {
    const lockStatus = getAbsoluteLockStatus();
    
    // Si no hay bloqueo, permitir todo
    if (!lockStatus.isActive) return true;
    
    // Si hay bloqueo pero todas las tareas están completadas, permitir todo
    if (lockStatus.canUnlock) return true;
    
    // Si hay bloqueo activo, solo permitir tareas
    return view === 'tasks';
  };

  // Función segura para navegar
  const safeNavigateTo = (view: View) => {
    if (canNavigateTo(view)) {
      setCurrentView(view);
    } else {
      // Si no se puede navegar, forzar a tareas
      setCurrentView('tasks');
    }
  };

  return {
    activateAbsoluteLock,
    deactivateAbsoluteLock,
    canNavigateTo,
    safeNavigateTo,
    lockStatus: getAbsoluteLockStatus()
  };
}
