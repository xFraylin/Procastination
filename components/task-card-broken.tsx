'use client';

import { Task, useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Play, Clock, Flame, Trash2 } from 'lucide-react';

const categoryColors: Record<string, string> = {
  SOC: 'bg-chart-1/20 text-chart-1 border-chart-1/30',
  Content: 'bg-chart-2/20 text-chart-2 border-chart-2/30',
  Personal: 'bg-chart-3/20 text-chart-3 border-chart-3/30',
  Study: 'bg-chart-4/20 text-chart-4 border-chart-4/30',
};

const categoryLabels: Record<string, string> = {
  SOC: 'SOC',
  Content: 'CONTENIDO',
  Personal: 'PERSONAL',
  Study: 'ESTUDIO',
};

const difficultyBars = (level: number) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            'w-1 h-3',
            i <= level ? 'bg-foreground' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  onStart: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ 
  task, 
  onStart, 
  onComplete, 
  onDelete 
}: TaskCardProps) {
  const { activeTask } = useAppStore();
  const isActive = activeTask?.id === task.id;
  
  return (
    <div className={cn(
      // Base styles
      'p-3 md:p-4 rounded-lg border transition-all duration-200',
      // Mobile optimizado
      'touch-manipulation active:scale-[0.98]',
      // Estados
      task.completed === 1 
        ? 'bg-muted/50 border-muted' 
        : isActive 
          ? 'bg-primary/10 border-primary/30 shadow-lg' 
          : 'bg-background border-border hover:border-muted-foreground/20',
      // Animación suave
      'hover:shadow-md'
    )}>
      <div className="flex items-start gap-3">
        {/* Checkbox grande para móvil */}
        <button
          onClick={() => onComplete(task)}
          disabled={task.completed === 1}
          className={cn(
            'mt-1 w-5 h-5 md:w-6 md:h-6 rounded border-2 transition-all duration-200',
            'flex items-center justify-center',
            'touch-manipulation active:scale-110',
            task.completed === 1 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-muted-foreground hover:border-primary hover:bg-primary/10'
          )}
        >
          {task.completed === 1 && <Check className="w-3 h-3 md:w-4 md:h-4" />}
        </button>
        
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={cn(
              'font-medium text-sm md:text-base leading-tight',
              'transition-colors duration-200',
              task.completed === 1 
                ? 'text-muted-foreground line-through' 
                : 'text-foreground'
            )}>
              {task.title}
            </h3>
            
            {/* Botones compactos */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {task.completed === 0 && !isActive && (
                <button
                  onClick={() => onStart(task)}
                  className={cn(
                    'p-1.5 md:p-2 rounded-md transition-all duration-200',
                    'touch-manipulation active:scale-95',
                    'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  )}
                >
                  <Play className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(task)}
                className={cn(
                  'p-1.5 md:p-2 rounded-md transition-all duration-200',
                  'touch-manipulation active:scale-95',
                  'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                )}
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
          
          {/* Meta información compacta */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {/* Categoría */}
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              categoryColors[task.category]
            )}>
              {categoryLabels[task.category]}
            </span>
            
            {/* Dificultad */}
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {difficultyBars(task.difficulty)}
            </div>
            
            {/* Duración */}
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{task.estimated_duration}min</span>
            </div>
            
            {/* Tiempo gastado */}
            {task.time_spent > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs">
                  {Math.floor(task.time_spent / 60)}:{(task.time_spent % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          
          {/* Estado activo */}
          {isActive && (
            <div className="mt-2 flex items-center gap-2 text-xs text-primary">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>En progreso...</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-9 sm:h-8 w-9 sm:w-8 p-0 text-muted-foreground hover:text-destructive min-h-[44px] sm:min-h-0"
                onClick={() => onDelete(task)}
                disabled={isFocusMode}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
          {task.completed && (
            <div className="h-9 sm:h-8 w-9 sm:w-8 bg-success/20 flex items-center justify-center min-h-[44px] sm:min-h-0">
              <Check className="h-4 w-4 text-success" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
