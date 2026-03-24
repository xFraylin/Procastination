'use client';

import { useAppStore } from '@/lib/store';
import { Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisciplineScoreProps {
  className?: string;
}

export function DisciplineScore({ className }: DisciplineScoreProps) {
  const { disciplineScore } = useAppStore();
  
  const getMessage = () => {
    if (disciplineScore >= 80) return "DISCIPLINA EXCEPCIONAL";
    if (disciplineScore >= 60) return "EJECUCION FUERTE";
    if (disciplineScore >= 40) return "NECESITA MEJORAR";
    return "CRITICO - TOMA ACCION";
  };
  
  const getTrend = () => {
    if (disciplineScore >= 60) return 'up';
    if (disciplineScore >= 40) return 'stable';
    return 'down';
  };
  
  const trend = getTrend();
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <div className={cn(
      'p-4 border bg-card',
      disciplineScore >= 60 ? 'border-success/30' : disciplineScore >= 40 ? 'border-warning/30' : 'border-destructive/30',
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className={cn(
            'h-4 w-4',
            disciplineScore >= 60 ? 'text-success' : disciplineScore >= 40 ? 'text-warning' : 'text-destructive'
          )} />
          <span className="text-[10px] tracking-wider text-muted-foreground">
            PUNTUACION DISCIPLINA
          </span>
        </div>
        <TrendIcon className={cn(
          'h-4 w-4',
          trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
        )} />
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn(
          'text-3xl font-bold',
          disciplineScore >= 60 ? 'text-success' : disciplineScore >= 40 ? 'text-warning' : 'text-destructive'
        )}>
          {disciplineScore}
        </span>
        <span className="text-sm text-muted-foreground">/100</span>
      </div>
      
      <p className={cn(
        'text-[10px] tracking-wider mt-1',
        disciplineScore >= 60 ? 'text-success' : disciplineScore >= 40 ? 'text-warning' : 'text-destructive'
      )}>
        {getMessage()}
      </p>
      
      {/* Barra de progreso */}
      <div className="h-1 bg-muted mt-3 overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-500',
            disciplineScore >= 60 ? 'bg-success' : disciplineScore >= 40 ? 'bg-warning' : 'bg-destructive'
          )}
          style={{ width: `${disciplineScore}%` }}
        />
      </div>
    </div>
  );
}
