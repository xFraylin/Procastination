'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Check, X, Clock, Flame, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReviewView() {
  const { tasks, disciplineScore, saveDailyLog, getDailyLog, updateStreak } = useAppStore();
  const [whatCompleted, setWhatCompleted] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [whyFailed, setWhyFailed] = useState('');
  const [saved, setSaved] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const completedTasks = todayTasks.filter(t => t.completed === 1);
  const failedTasks = todayTasks.filter(t => t.completed === 0);
  const totalTimeSpent = todayTasks.reduce((acc, t) => acc + t.time_spent, 0);
  
  useEffect(() => {
    const existingLog = getDailyLog(today);
    if (existingLog) {
      setWhatCompleted(existingLog.what_completed || '');
      setWhatFailed(existingLog.what_failed || '');
      setWhyFailed(existingLog.why_failed || '');
    }
  }, [today, getDailyLog]);
  
  const handleSaveReview = () => {
    saveDailyLog({
      date: today,
      tasks_completed: completedTasks.length,
      tasks_failed: failedTasks.length,
      total_time_spent: totalTimeSpent,
      what_completed: whatCompleted,
      what_failed: whatFailed,
      why_failed: whyFailed,
      discipline_score: disciplineScore,
    });
    
    updateStreak();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const completionRate = todayTasks.length > 0 
    ? Math.round((completedTasks.length / todayTasks.length) * 100) 
    : 0;
  
  return (
    <div className="p-8 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">REVISION DIARIA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}
          </p>
        </div>
        
        <Button
          onClick={handleSaveReview}
          className={cn(
            'h-10 text-xs tracking-wider font-bold',
            saved && 'bg-success hover:bg-success'
          )}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              GUARDADO
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              GUARDAR REVISION
            </>
          )}
        </Button>
      </div>
      
      {/* Resumen de Hoy */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-success" />
              <span className="text-[10px] tracking-wider text-muted-foreground">
                COMPLETADAS
              </span>
            </div>
            <p className="text-2xl font-bold text-success">{completedTasks.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="h-4 w-4 text-destructive" />
              <span className="text-[10px] tracking-wider text-muted-foreground">
                PENDIENTES
              </span>
            </div>
            <p className="text-2xl font-bold text-destructive">{failedTasks.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-[10px] tracking-wider text-muted-foreground">
                TIEMPO USADO
              </span>
            </div>
            <p className="text-2xl font-bold">{Math.round(totalTimeSpent / 60)} min</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-streak" />
              <span className="text-[10px] tracking-wider text-muted-foreground">
                DISCIPLINA
              </span>
            </div>
            <p className={cn(
              'text-2xl font-bold',
              disciplineScore >= 70 ? 'text-success' :
              disciplineScore >= 40 ? 'text-warning' : 'text-destructive'
            )}>
              {disciplineScore}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Progreso de Completado */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold tracking-wider">TASA DE COMPLETADO</span>
            <span className="text-2xl font-bold">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
          
          {completionRate === 100 && todayTasks.length > 0 && (
            <p className="text-sm text-success mt-3">
              Todas las tareas completadas. Excelente ejecucion.
            </p>
          )}
          {completionRate < 100 && completionRate >= 50 && (
            <p className="text-sm text-warning mt-3">
              Completado parcial. Hay espacio para mejorar.
            </p>
          )}
          {completionRate < 50 && todayTasks.length > 0 && (
            <p className="text-sm text-destructive mt-3">
              Tasa de completado baja. Debes hacerlo mejor.
            </p>
          )}
          {todayTasks.length === 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              No hay tareas para hoy. Agrega algunas para empezar.
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Formulario de Revision */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-wider flex items-center gap-2">
              <Check className="h-4 w-4 text-success" />
              QUE COMPLETASTE?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={whatCompleted}
              onChange={(e) => setWhatCompleted(e.target.value)}
              placeholder="Lista tus tareas completadas y logros..."
              className="bg-input border-border min-h-32"
            />
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-wider flex items-center gap-2">
              <X className="h-4 w-4 text-destructive" />
              QUE FALLO?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              placeholder="Que tareas no completaste?..."
              className="bg-input border-border min-h-32"
            />
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xs font-bold tracking-wider">
            POR QUE FALLASTE? (SE HONESTO)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={whyFailed}
            onChange={(e) => setWhyFailed(e.target.value)}
            placeholder="Analiza tus fallos. Sin excusas. Que causo el fallo? Como puedes prevenirlo manana?"
            className="bg-input border-border min-h-24"
          />
        </CardContent>
      </Card>
      
      {/* Mensaje Motivacional */}
      <div className="border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {completionRate === 100 
            ? "\"La ejecucion construye confianza. Sigue construyendo.\""
            : "\"Aprende de hoy. Ejecuta mejor manana.\""
          }
        </p>
      </div>
    </div>
  );
}
