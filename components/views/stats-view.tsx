'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Target, Clock, Flame, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsView() {
  const { tasks, disciplineScore, dailyLogs } = useAppStore();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  
  const stats = useMemo(() => {
    const days = period === 'week' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const filteredTasks = tasks.filter(t => new Date(t.date) >= startDate);
    const completedTasks = filteredTasks.filter(t => t.completed === 1);
    const totalTimeSpent = filteredTasks.reduce((acc, t) => acc + t.time_spent, 0);
    const completionRate = filteredTasks.length > 0 
      ? Math.round((completedTasks.length / filteredTasks.length) * 100) 
      : 0;
    
    // Generar datos para el grafico
    const chartData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(t => t.date === dateStr);
      const dayCompleted = dayTasks.filter(t => t.completed === 1);
      const dayTimeSpent = dayTasks.reduce((acc, t) => acc + t.time_spent, 0);
      
      chartData.push({
        date: dateStr,
        completed: dayCompleted.length,
        total: dayTasks.length,
        timeSpent: Math.round(dayTimeSpent / 60),
        completionRate: dayTasks.length > 0 
          ? Math.round((dayCompleted.length / dayTasks.length) * 100) 
          : 0,
      });
    }
    
    // Estadisticas por categoria
    const categoryStats: Record<string, { completed: number; total: number }> = {
      SOC: { completed: 0, total: 0 },
      Content: { completed: 0, total: 0 },
      Personal: { completed: 0, total: 0 },
      Study: { completed: 0, total: 0 },
    };
    
    filteredTasks.forEach(task => {
      if (categoryStats[task.category]) {
        categoryStats[task.category].total++;
        if (task.completed === 1) {
          categoryStats[task.category].completed++;
        }
      }
    });
    
    return {
      totalTasks: filteredTasks.length,
      completedTasks: completedTasks.length,
      completionRate,
      totalTimeSpent,
      chartData,
      categoryStats,
      disciplineScore,
    };
  }, [tasks, period, disciplineScore]);
  
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="p-8 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ESTADISTICAS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            RASTREA TU RENDIMIENTO DE EJECUCION
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={period === 'week' ? 'default' : 'outline'}
            size="sm"
            className="text-xs tracking-wider"
            onClick={() => setPeriod('week')}
          >
            SEMANA
          </Button>
          <Button
            variant={period === 'month' ? 'default' : 'outline'}
            size="sm"
            className="text-xs tracking-wider"
            onClick={() => setPeriod('month')}
          >
            MES
          </Button>
        </div>
      </div>
      
      {/* Estadisticas Generales */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <Target className="h-3 w-3" />
              TOTAL TAREAS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalTasks}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              en {period === 'week' ? '7' : '30'} dias
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              TASA DE COMPLETADO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completionRate}%</p>
            <Progress value={stats.completionRate} className="h-1 mt-2" />
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
            <p className="text-3xl font-bold">{Math.round(stats.totalTimeSpent / 3600)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              horas totales
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] text-muted-foreground tracking-wider flex items-center gap-2">
              <Flame className="h-3 w-3" />
              PUNTUACION DISCIPLINA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              'text-3xl font-bold',
              stats.disciplineScore >= 70 ? 'text-success' :
              stats.disciplineScore >= 40 ? 'text-warning' : 'text-destructive'
            )}>
              {stats.disciplineScore}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              de 100
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Graficos */}
      <div className="grid grid-cols-2 gap-4">
        {/* Grafico de Tasa de Completado */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              TASA DE COMPLETADO DIARIA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '4px',
                    }}
                    labelFormatter={formatDate}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--success))" name="Completadas" />
                  <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Grafico de Tiempo Invertido */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-xs font-bold tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4" />
              TIEMPO INVERTIDO (MINUTOS)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.chartData}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '4px',
                    }}
                    labelFormatter={formatDate}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="timeSpent" 
                    stroke="hsl(var(--foreground))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--foreground))' }}
                    name="Minutos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Desglose por Categoria */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xs font-bold tracking-wider">
            DESGLOSE POR CATEGORIA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(stats.categoryStats).map(([category, data]) => {
              const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              const categoryLabels: Record<string, string> = {
                SOC: 'SOC',
                Content: 'CONTENIDO',
                Personal: 'PERSONAL',
                Study: 'ESTUDIO',
              };
              return (
                <div key={category} className="p-4 border border-border">
                  <p className="text-[10px] text-muted-foreground tracking-wider mb-2">
                    {categoryLabels[category] || category.toUpperCase()}
                  </p>
                  <p className="text-2xl font-bold">{data.completed}/{data.total}</p>
                  <Progress value={rate} className="h-1 mt-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{rate}% completado</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
