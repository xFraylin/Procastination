'use client';

import { useDisciplineTimer } from '@/hooks/use-discipline-timer';
import { Clock, Play, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export function DisciplineTimer() {
  const { startTimer, stopTimer, timerStatus } = useDisciplineTimer();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 90) return 'text-destructive';
    if (progress >= 75) return 'text-orange-500';
    if (progress >= 50) return 'text-yellow-500';
    return 'text-primary';
  };

  const getProgressVariant = (progress: number): 'default' | 'destructive' | 'secondary' => {
    if (progress >= 90) return 'destructive';
    if (progress >= 75) return 'secondary';
    return 'default';
  };

  if (!timerStatus.isActive) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5 sticky top-4 z-40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5" />
          Temporizador de Disciplina
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tiempo principal */}
        <div className="text-center space-y-2">
          <div className={`text-6xl font-bold tabular-nums ${getProgressColor(timerStatus.progress)}`}>
            {formatTime(timerStatus.timeRemaining)}
          </div>
          <div className="text-sm text-muted-foreground">
            {timerStatus.duration} minutos • {Math.round(timerStatus.progress)}% completado
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className={getProgressColor(timerStatus.progress)}>
              {Math.round(timerStatus.progress)}%
            </span>
          </div>
          <Progress 
            value={timerStatus.progress} 
            className="h-3"
          />
        </div>

        {/* Controles */}
        <div className="flex gap-2">
          <Button
            onClick={stopTimer}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            Detener
          </Button>
          <Button
            onClick={() => startTimer(timerStatus.taskId || undefined)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        {/* Ajuste de duración */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Duración</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">
                {timerStatus.duration}m
              </span>
              <Slider
                value={[timerStatus.duration]}
                onValueChange={([value]) => {
                  // Solo permitir cambiar duración si el temporizador no está activo
                  if (!timerStatus.isActive) {
                    // Esto se manejará en el hook
                    console.log('Nueva duración:', value, 'minutos');
                  }
                }}
                max={120}
                min={5}
                step={5}
                className="w-24"
                disabled={timerStatus.isActive}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Ajusta la duración antes de iniciar el temporizador
          </div>
        </div>

        {/* Indicadores de estado */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Volume2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Sonido activo</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">
              {timerStatus.timeRemaining > 0 ? 'En ejecución' : 'Completado'}
            </span>
          </div>
        </div>

        {/* Mensaje motivacional según progreso */}
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-sm font-medium text-muted-foreground">
            {timerStatus.progress >= 90 && '⚡ ¡Últimos minutos! Mantén el foco!'}
            {timerStatus.progress >= 75 && timerStatus.progress < 90 && '🔥 Más de 3/4 completado! Sigue así!'}
            {timerStatus.progress >= 50 && timerStatus.progress < 75 && '💪 Bien hecho! Llevas más de la mitad!'}
            {timerStatus.progress >= 25 && timerStatus.progress < 50 && '🚀 Buen comienzo! Sigue adelante!'}
            {timerStatus.progress < 25 && '🎯 Enfócate y empieza fuerte!'}
          </p>
        </div>

        {/* Estado de la tarea */}
        {timerStatus.taskId && (
          <div className="text-center p-2 bg-primary/10 border border-primary/20 rounded">
            <p className="text-xs text-primary">
              Temporizador asignado a la tarea #{timerStatus.taskId}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
