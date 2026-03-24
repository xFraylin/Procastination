'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAppStore, Task } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Square, Check, Target, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusViewProps {
  onCompleteTask: (task: Task, timeSpent: number) => void;
}

export function FocusView({ onCompleteTask }: FocusViewProps) {
  const {
    tasks,
    activeTask,
    setActiveTask,
    isFocusMode,
    setFocusMode,
    focusTimeRemaining,
    setFocusTimeRemaining,
    focusTimerRunning,
    setFocusTimerRunning,
    settings,
  } = useAppStore();
  
  const startTimeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const pendingTasks = tasks.filter(t => t.completed === 0);
  const defaultDuration = settings?.pomodoro_duration 
    ? parseInt(settings.pomodoro_duration) * 60 
    : 25 * 60; // Default: 25 minutos
  
  // Efecto del temporizador
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (focusTimerRunning && focusTimeRemaining > 0) {
      interval = setInterval(() => {
        setFocusTimeRemaining(focusTimeRemaining - 1);
      }, 1000);
    } else if (focusTimeRemaining === 0 && focusTimerRunning) {
      setFocusTimerRunning(false);
      playCompletionSound();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimerRunning, focusTimeRemaining, setFocusTimeRemaining, setFocusTimerRunning]);
  
  const playCompletionSound = () => {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSelectTask = (taskId: string) => {
    const task = tasks.find(t => t.id === parseInt(taskId));
    if (task) {
      setActiveTask(task);
      setFocusTimeRemaining(task.estimated_duration * 60);
    }
  };
  
  const handleStartFocus = () => {
    if (!activeTask) return;
    setFocusMode(true);
    setFocusTimerRunning(true);
    startTimeRef.current = Date.now();
  };
  
  const handlePauseFocus = () => {
    setFocusTimerRunning(false);
    totalTimeRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
  };
  
  const handleResumeFocus = () => {
    setFocusTimerRunning(true);
    startTimeRef.current = Date.now();
  };
  
  const handleStopFocus = () => {
    if (focusTimerRunning) {
      totalTimeRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    setFocusMode(false);
    setFocusTimerRunning(false);
    setFocusTimeRemaining(defaultDuration);
    totalTimeRef.current = 0;
  };
  
  const handleCompleteTask = () => {
    if (!activeTask) return;
    
    let timeSpent = totalTimeRef.current;
    if (focusTimerRunning) {
      timeSpent += Math.floor((Date.now() - startTimeRef.current) / 1000);
    }
    
    onCompleteTask(activeTask, timeSpent);
    
    setFocusMode(false);
    setFocusTimerRunning(false);
    setActiveTask(null);
    setFocusTimeRemaining(defaultDuration);
    totalTimeRef.current = 0;
    playCompletionSound();
  };
  
  const progress = activeTask 
    ? ((activeTask.estimated_duration * 60 - focusTimeRemaining) / (activeTask.estimated_duration * 60)) * 100
    : 0;
  
  return (
    <div className="p-8 h-full flex flex-col">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">MODO ENFOQUE</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ELIMINA DISTRACCIONES. EJECUTA.
        </p>
      </div>
      
      {/* Contenido Principal */}
      <div className="flex-1 flex items-center justify-center">
        {!isFocusMode ? (
          // Seleccion de Tarea
          <Card className="w-full max-w-lg bg-card border-border">
            <CardContent className="p-8">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
                  <h3 className="font-bold text-lg">NO HAY TAREAS PENDIENTES</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Define tareas primero antes de entrar en modo enfoque.
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <Target className="h-12 w-12 text-foreground mx-auto mb-4" />
                    <h2 className="text-lg font-bold">SELECCIONA TAREA PARA ENFOCARTE</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Una vez iniciado, no podras salir hasta completar.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Select 
                      value={activeTask?.id.toString()} 
                      onValueChange={handleSelectTask}
                    >
                      <SelectTrigger className="h-12 bg-input border-border">
                        <SelectValue placeholder="Selecciona una tarea..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {pendingTasks.map((task) => (
                          <SelectItem key={task.id} value={task.id.toString()}>
                            {task.title} ({task.estimated_duration} min)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      className="w-full h-12 text-sm tracking-wider font-bold"
                      disabled={!activeTask}
                      onClick={handleStartFocus}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      INICIAR SESION DE ENFOQUE
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          // Temporizador de Enfoque
          <div className="w-full max-w-2xl text-center">
            {/* Info de Tarea */}
            <div className="mb-8">
              <p className="text-xs text-muted-foreground tracking-wider mb-2">
                EJECUTANDO ACTUALMENTE
              </p>
              <h2 className="text-2xl font-bold">{activeTask?.title}</h2>
            </div>
            
            {/* Display del Temporizador */}
            <div className="relative mb-8">
              <div className="w-64 h-64 mx-auto border-4 border-foreground flex items-center justify-center relative">
                {/* Overlay de progreso */}
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-foreground/10 transition-all duration-1000"
                  style={{ height: `${progress}%` }}
                />
                <div className="relative z-10">
                  <p className="text-6xl font-mono font-bold tracking-wider">
                    {formatTime(focusTimeRemaining)}
                  </p>
                  <p className="text-xs text-muted-foreground tracking-wider mt-2">
                    {focusTimerRunning ? 'EN PROGRESO' : focusTimeRemaining === 0 ? 'TIEMPO AGOTADO' : 'PAUSADO'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Controles */}
            <div className="flex items-center justify-center gap-4">
              {focusTimerRunning ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-sm tracking-wider"
                  onClick={handlePauseFocus}
                >
                  <Pause className="h-5 w-5 mr-2" />
                  PAUSAR
                </Button>
              ) : focusTimeRemaining > 0 && focusTimeRemaining < (activeTask?.estimated_duration || 0) * 60 ? (
                <Button
                  size="lg"
                  className="h-14 px-8 text-sm tracking-wider"
                  onClick={handleResumeFocus}
                >
                  <Play className="h-5 w-5 mr-2" />
                  REANUDAR
                </Button>
              ) : null}
              
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-sm tracking-wider border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleStopFocus}
              >
                <Square className="h-5 w-5 mr-2" />
                ABORTAR
              </Button>
              
              <Button
                size="lg"
                className="h-14 px-8 text-sm tracking-wider bg-success hover:bg-success/90 text-background"
                onClick={handleCompleteTask}
              >
                <Check className="h-5 w-5 mr-2" />
                COMPLETAR
              </Button>
            </div>
            
            {/* Mensaje de Advertencia */}
            <div className="mt-8 p-4 border border-border bg-card">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">BLOQUEADO.</span> Navegacion deshabilitada hasta que la tarea sea completada o abortada.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
