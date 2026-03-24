'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ActivateLockButton } from '@/components/activate-lock-button';
import {
  Flame,
  Target,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap
} from 'lucide-react';

const motivationalQuotes = [
  "La disciplina es elegir entre lo que quieres ahora y lo que más quieres.",
  "La ejecución construye confianza. La procrastinación construye dudas.",
  "El dolor de la disciplina no es nada comparado con el dolor del arrepentimiento.",
  "La acción es la clave fundamental para todo éxito.",
  "Deja de esperar. Empieza a ejecutar.",
];

export function DashboardView() {
  const { tasks, streak, setCurrentView, settings } = useAppStore();
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  
  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);
  
  // Calcular estadísticas
  const completedTasks = tasks.filter(t => t.completed === 1).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.completed === 0);
  const totalTimeSpent = tasks.reduce((acc, t) => acc + t.time_spent, 0);
  
  // Tasks de hoy
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.date === today);
  const todayCompleted = todayTasks.filter(t => t.completed === 1).length;
  
  return (
    <div className="p-3 md:p-6 space-y-3 md:space-y-6 max-w-7xl mx-auto">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Panel de Control</h1>
          <p className="text-sm text-muted-foreground">Tu sistema de disciplina personal</p>
        </div>
        <Button 
          onClick={() => setCurrentView('tasks')}
          className="w-full sm:w-auto h-12 text-base"
        >
          Ver Tareas
        </Button>
      </div>
      
      {/* Cards Compactas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {/* Racha - Más prominente */}
        <Card className="border-streak/30 bg-streak/5">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 md:h-5 md:w-5 text-streak" />
              <span className="text-[8px] md:text-[10px] tracking-wider text-muted-foreground">
                RACHA
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-streak">
              {streak?.current_streak || 0}
            </p>
            <p className="text-[8px] md:text-[10px] text-muted-foreground">
              días consecutivos
            </p>
          </CardContent>
        </Card>
        
        {/* Tareas Completadas */}
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
              <span className="text-[8px] md:text-[10px] tracking-wider text-muted-foreground">
                COMPLETADAS
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-green-500">
              {completedTasks}
            </p>
            <p className="text-[8px] md:text-[10px] text-muted-foreground">
              de {totalTasks} totales
            </p>
          </CardContent>
        </Card>
        
        {/* Tareas Pendientes */}
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              <span className="text-[8px] md:text-[10px] tracking-wider text-muted-foreground">
                PENDIENTES
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-orange-500">
              {pendingTasks.length}
            </p>
            <p className="text-[8px] md:text-[10px] text-muted-foreground">
              por completar
            </p>
          </CardContent>
        </Card>
        
        {/* Progreso */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
              <span className="text-[8px] md:text-[10px] tracking-wider text-muted-foreground">
                PROGRESO
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-blue-500">
              {completionRate}%
            </p>
            <Progress value={completionRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Sección de Hoy - Compacta */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tareas del día</span>
            <span className="text-sm font-medium">{todayCompleted}/{todayTasks.length}</span>
          </div>
          <Progress value={todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0} className="h-2" />
          
          {todayTasks.length > 0 && (
            <div className="space-y-2">
              {todayTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span className="text-sm truncate flex-1">{task.title}</span>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.category === 'SOC' ? 'bg-purple-500/20 text-purple-500' :
                      task.category === 'Content' ? 'bg-blue-500/20 text-blue-500' :
                      task.category === 'Personal' ? 'bg-green-500/20 text-green-500' :
                      'bg-orange-500/20 text-orange-500'
                    }`}>
                      {task.category}
                    </span>
                    {task.completed === 1 && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
              {todayTasks.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{todayTasks.length - 3} tareas más
                </p>
              )}
            </div>
          )}
          
          {todayTasks.length === 0 && (
            <div className="text-center py-4">
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay tareas para hoy</p>
              <Button 
                onClick={() => setCurrentView('tasks')}
                variant="outline" 
                size="sm"
                className="mt-2"
              >
                Crear Tarea
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Acciones Rápidas - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Button
          onClick={() => setCurrentView('tasks')}
          className="h-12 text-base"
          variant="outline"
        >
          <Clock className="h-4 w-4 mr-2" />
          Ver Todas las Tareas
        </Button>
        
        <Button
          onClick={() => setCurrentView('focus')}
          className="h-12 text-base"
          variant="outline"
        >
          <Target className="h-4 w-4 mr-2" />
          Modo Enfoque
        </Button>
        
        <Button
          onClick={() => setCurrentView('stats')}
          className="h-12 text-base"
          variant="outline"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Estadísticas
        </Button>
      </div>
      
      {/* Botón de Bloqueo Absoluto - Solo visible si no está activo */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-destructive">Modo Disciplina Absoluto</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Bloquea todo acceso hasta completar tus tareas
              </p>
            </div>
            <ActivateLockButton />
          </div>
        </CardContent>
      </Card>
      
      {/* Mensaje Motivacional - Compacto */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Flame className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground italic">
                "{quote}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                - Motivación diaria
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
