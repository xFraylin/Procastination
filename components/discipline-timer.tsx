'use client';

import { useDisciplineTimer } from '@/hooks/use-discipline-timer';
import { Clock, Play, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export function DisciplineTimer() {
  const { startTimer, stopTimer, timerStatus, setTimerDuration } = useDisciplineTimer();

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

  const getMotivationalMessage = (duration: number, timeRemaining: number): string => {
    const progress = ((duration * 60 - timeRemaining) / (duration * 60)) * 100;
    
    // Frases según duración y progreso
    if (duration <= 15) {
      // Tareas cortas (5-15 min)
      if (progress >= 90) return '⚡ ¡Sé un rayo! Casi lo logras.';
      if (progress >= 75) return '🔥 Enfócate intensamente! La victoria está cerca.';
      if (progress >= 50) return '💪 Sigue adelante! Cada segundo cuenta.';
      if (progress >= 25) return '🎯 Bien comenzado! Mantén el ritmo.';
      return '🚀 Empieza con fuerza! Los 15 minutos pasarán volando.';
    }
    
    if (duration <= 30) {
      // Tareas medianas (15-30 min)
      if (progress >= 90) return '⚡ ¡Últimos minutos! Mantén la concentración máxima!';
      if (progress >= 75) return '🔥 Más de 3/4 completado! Sigue así, campeón.';
      if (progress >= 50) return '💪 Bien hecho! Llevas más de la mitad.';
      if (progress >= 25) return '🎯 Buen ritmo! La disciplina está funcionando.';
      return '🚀 Enfócate y entrega! Tu mejor versión está apareciendo.';
    }
    
    if (duration <= 45) {
      // Tareas largas (30-45 min)
      if (progress >= 90) return '⚡ ¡Momento decisivo! Tu determinación se está probando.';
      if (progress >= 75) return '🔥 Guerrero de la disciplina! No te rindas.';
      if (progress >= 50) return '💪 Campeón en marcha! La victoria es inevitable.';
      if (progress >= 25) return '🎯 Maestría en progreso! Cada minuto es una victoria.';
      return '🚀 Leyenda de la productividad! Estás escribiendo historia.';
    }
    
    // Tareas muy largas (45+ min)
    if (progress >= 90) return '⚡ ¡Inmortal! Tu disciplina es legendaria.';
    if (progress >= 75) return '🔥 Titan de la productividad! Nadie puede detenerte.';
    if (progress >= 50) return '💪 Maestro absoluto! Controlas el tiempo.';
    if (progress >= 25) return '🎯 Virtuoso de la disciplina! La excelencia es tu hábito.';
    return '🚀 Dios de la productividad! Has trascendido los límites.';
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
            onClick={() => startTimer(timerStatus.taskId || undefined, timerStatus.duration)}
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
                  // Actualizar duración en el store
                  setTimerDuration(value);
                  console.log('Nueva duración:', value, 'minutos');
                }}
                max={120}
                min={5}
                step={5}
                className="w-24"
                disabled={timerStatus.isActive} // Solo permitir cambiar cuando no está activo
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Ajusta la duración según tu tipo de tarea
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
            {getMotivationalMessage(timerStatus.duration, timerStatus.timeRemaining)}
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
