'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  "La disciplina es elegir entre lo que quieres ahora y lo que mas quieres.",
  "La ejecucion construye confianza. La procrastinacion construye dudas.",
  "El dolor de la disciplina no es nada comparado con el dolor del arrepentimiento.",
  "La accion es la clave fundamental para todo exito.",
  "Deja de esperar. Empieza a ejecutar.",
];

export function DashboardView() {
  const { tasks, streak, setCurrentView, settings } = useAppStore();
  const [quote, setQuote] = useState(motivationalQuotes[0]);
  
  // Calcular estadísticas
  const completedTasks = tasks.filter(t => t.completed === 1).length;
  const pendingTasks = tasks.filter(t => t.completed === 0).length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
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
              de {tasks.length} totales
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
              {pendingTasks}
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
              {Math.round(completionRate)}%
            </p>
            <Progress value={completionRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);
  
  const completedTasks = tasks.filter(t => t.completed === 1).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = tasks.filter(t => t.completed === 0);
  const totalTimeSpent = tasks.reduce((acc, t) => acc + t.time_spent, 0);
  
  return (
    <div className="p-8 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PANEL DE EJECUCION</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }).toUpperCase()}
          </p>
        </div>
        
        {streak && streak.current_streak > 0 && (
          <div className="flex items-center gap-2 bg-streak/10 border border-streak/20 px-4 py-2">
            <Flame className="h-5 w-5 text-streak" />
            <span className="text-lg font-bold text-streak">{streak.current_streak}</span>
            <span className="text-[10px] text-muted-foreground tracking-wider">DIAS DE RACHA</span>
          </div>
        )}
      </div>
      
      {/* Cita */}
      <div className="border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground italic">"{quote}"</p>
      </div>
      
      {/* Grid de Estadisticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <Target className="h-3 w-3" />
              TAREAS HOY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTasks}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {completedTasks} completadas
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3" />
              TASA DE COMPLETADO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionRate}%</p>
            <Progress value={completionRate} className="h-1 mt-2" />
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <Clock className="h-3 w-3" />
              TIEMPO INVERTIDO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(totalTimeSpent / 60)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              minutos hoy
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <Flame className="h-3 w-3" />
              RACHA ACTUAL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-streak">{streak?.current_streak || 0}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              mejor: {streak?.longest_streak || 0} dias
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Seccion de Accion */}
      {pendingTasks.length > 0 ? (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-destructive/20 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {pendingTasks.length} TAREA{pendingTasks.length > 1 ? 'S' : ''} PENDIENTE{pendingTasks.length > 1 ? 'S' : ''}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Estas evitando la ejecucion. Comienza ahora.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentView('tasks')}
                className="h-12 px-6 text-xs tracking-wider font-bold"
              >
                VER TAREAS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : totalTasks === 0 ? (
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-warning/20 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">NO HAY TAREAS DEFINIDAS</h3>
                  <p className="text-sm text-muted-foreground">
                    Define 3-5 tareas criticas para hoy. Sin excusas.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentView('tasks')}
                className="h-12 px-6 text-xs tracking-wider font-bold"
              >
                DEFINIR TAREAS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">TODAS LAS TAREAS COMPLETADAS</h3>
                  <p className="text-sm text-muted-foreground">
                    Excelente ejecucion. Sigue construyendo impulso.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setCurrentView('review')}
                variant="outline"
                className="h-12 px-6 text-xs tracking-wider font-bold"
              >
                REVISION DIARIA
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Acciones Rapidas */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-1"
          onClick={() => setCurrentView('focus')}
          disabled={pendingTasks.length === 0}
        >
          <Target className="h-5 w-5" />
          <span className="text-[10px] tracking-wider">MODO ENFOQUE</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-1"
          onClick={() => setCurrentView('stats')}
        >
          <Flame className="h-5 w-5" />
          <span className="text-[10px] tracking-wider">VER ESTADISTICAS</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-1"
          onClick={() => setCurrentView('content')}
        >
          <Zap className="h-5 w-5" />
          <span className="text-[10px] tracking-wider">CREADOR DE CONTENIDO</span>
        </Button>
      </div>
    </div>
  );
}
