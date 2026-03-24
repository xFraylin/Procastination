'use client';

import { useState } from 'react';
import { useAppStore, Task } from '@/lib/store';
import { TaskCard } from '@/components/task-card';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Lock, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TasksViewProps {
  onAddTask: (task: {
    title: string;
    category: 'SOC' | 'Content' | 'Personal' | 'Study';
    difficulty: number;
    estimated_duration: number;
    date: string;
  }) => void;
  onStartTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function TasksView({ onAddTask, onStartTask, onCompleteTask, onDeleteTask }: TasksViewProps) {
  const { 
    tasks, 
    isLockdownMode, 
    setLockdownMode, 
    isForceMode, 
    setForceMode,
  } = useAppStore();
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return task.completed === 0;
    if (filter === 'completed') return task.completed === 1;
    return true;
  });
  
  // Agrupar tareas por fecha
  const tasksByDate = filteredTasks.reduce((acc, task) => {
    const date = task.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.completed === 1);
  
  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Tareas Diarias</h1>
          <p className="text-sm text-muted-foreground">
            {tasks.filter(t => t.completed === 0).length} pendientes • {tasks.filter(t => t.completed === 1).length} completadas
          </p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto h-12 text-base"
        >
          Nueva Tarea
        </Button>
      </div>
      
      {/* Filtros Compactos */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="h-10 px-3 whitespace-nowrap"
        >
          Todas ({tasks.length})
        </Button>
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
          className="h-10 px-3 whitespace-nowrap"
        >
          Pendientes ({tasks.filter(t => t.completed === 0).length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
          className="h-10 px-3 whitespace-nowrap"
        >
          Completadas ({tasks.filter(t => t.completed === 1).length})
        </Button>
      </div>
      
      {/* Modos de Disciplina - Compactos */}
      {(isLockdownMode || isForceMode) && !allTasksCompleted && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            {isForceMode ? <Shield className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            <span className="text-sm font-bold">
              {isForceMode ? 'MODO FORZADO ACTIVO' : 'BLOQUEO ACTIVO'}
            </span>
          </div>
          <p className="text-xs text-destructive mt-1">
            {isForceMode 
              ? 'Completa todas las tareas o el sistema permanecerá bloqueado'
              : 'No puedes acceder a otras aplicaciones hasta completar las tareas'
            }
          </p>
        </div>
      )}
      
      {/* Lista de Tareas - Compacta */}
      <div className="space-y-3">
        {Object.entries(tasksByDate)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([date, dateTasks]) => (
            <div key={date} className="space-y-2">
              {/* Fecha Header */}
              <div className="flex items-center gap-2 sticky top-0 bg-background z-10 py-2">
                <h3 className="text-sm font-semibold text-foreground">
                  {new Date(date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                <span className="text-xs text-muted-foreground">
                  ({dateTasks.filter(t => t.completed === 1).length}/{dateTasks.length})
                </span>
              </div>
              
              {/* Tasks del día */}
              <div className="space-y-2">
                {dateTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStart={() => onStartTask(task)}
                    onComplete={() => onCompleteTask(task)}
                    onDelete={() => onDeleteTask(task)}
                  />
                ))}
              </div>
            </div>
          ))}
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === 'completed' ? 'No hay tareas completadas' : 
               filter === 'pending' ? 'No hay tareas pendientes' : 
               'No hay tareas'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === 'completed' ? 'Comienza a completar tus tareas para verlas aquí' :
               filter === 'pending' ? '¡Buen trabajo! No tienes tareas pendientes' :
               'Crea tu primera tarea para comenzar'}
            </p>
            {filter !== 'completed' && (
              <Button onClick={() => setShowAddDialog(true)} className="h-12">
                Crear Primera Tarea
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Diálogo para agregar tarea */}
      <AddTaskDialog
        onOpenChange={setShowAddDialog}
        onAddTask={onAddTask}
      />
    </div>
  );
}
