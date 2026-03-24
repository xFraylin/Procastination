'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { BottomNav } from '@/components/bottom-nav';
import { AntiProcrastination } from '@/components/anti-procrastination';
import { SkipConfirmation } from '@/components/skip-confirmation';
import { DisciplineScore } from '@/components/discipline-score';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { TasksView } from '@/components/views/tasks-view';
import { DashboardView } from '@/components/views/dashboard-view';
import { FocusView } from '@/components/views/focus-view';
import { StatsView } from '@/components/views/stats-view';
import { ContentView } from '@/components/views/content-view';
import { ReviewView } from '@/components/views/review-view';
import { AddTaskDialog } from '@/components/add-task-dialog';
import { Flame, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Task } from '@/lib/store';

export function AppShell({ userId }: { userId?: number }) {
  const router = useRouter();
  
  const {
    currentView,
    tasks,
    addTask,
    completeTask,
    deleteTask,
    activeTask,
    setActiveTask,
    setCurrentView,
    setFocusTimeRemaining,
    isFocusMode,
    _hasHydrated,
    streak,
  } = useAppStore();
  
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userId && _hasHydrated) {
      router.push('/login');
    }
  }, [userId, _hasHydrated, router]);
  
  // Set user ID in store when authenticated
  useEffect(() => {
    if (userId) {
      useAppStore.getState().setCurrentUserId(userId);
    }
  }, [userId]);
  
  const handleLogout = () => {
    useAppStore.getState().setCurrentUserId(null);
    router.push('/login');
  };
  
  const handleAddTask = (task: {
    title: string;
    category: 'SOC' | 'Content' | 'Personal' | 'Study';
    difficulty: number;
    estimated_duration: number;
    date: string;
  }) => {
    const currentUserId = useAppStore.getState().currentUserId;
    if (!currentUserId) return;
    
    addTask({
      ...task,
      user_id: currentUserId
    });
  };
  
  const handleStartTask = (task: Task) => {
    setActiveTask(task);
    setFocusTimeRemaining(task.estimated_duration * 60);
    setCurrentView('focus');
  };
  
  const handleCompleteTask = (task: Task, timeSpent?: number) => {
    completeTask(task.id, timeSpent);
  };
  
  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };
  
  const handleStartFirstTask = useCallback(() => {
    const pendingTasks = tasks.filter(t => t.completed === 0);
    if (pendingTasks.length > 0) {
      handleStartTask(pendingTasks[0]);
    }
  }, [tasks]);
  
  const handleCompleteActiveTask = useCallback(() => {
    const { activeTask, focusTimeRemaining } = useAppStore.getState();
    if (activeTask) {
      const timeSpent = (activeTask.estimated_duration * 60) - focusTimeRemaining;
      completeTask(activeTask.id, timeSpent);
    }
  }, [completeTask]);
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return (
          <TasksView
            onAddTask={handleAddTask}
            onStartTask={handleStartTask}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
          />
        );
      case 'focus':
        return <FocusView onCompleteTask={handleCompleteTask} />;
      case 'stats':
        return <StatsView />;
      case 'content':
        return <ContentView />;
      case 'review':
        return <ReviewView />;
      default:
        return <DashboardView />;
    }
  };

  // Mostrar pantalla de carga mientras se hidrata o autentica
  if (!_hasHydrated || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold text-foreground mb-2">EJECUTA</div>
          <p className="text-sm text-muted-foreground">Cargando sistema de disciplina...</p>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="flex-1 overflow-auto min-h-screen pb-16 md:pb-0">
          {renderView()}
        </main>
        
        {/* Bottom Navigation - Mobile Only */}
        <BottomNav />
        
        {/* Right Panel - Desktop: fixed, Mobile: hidden */}
        <aside className="hidden lg:block w-64 min-h-screen border-l border-border p-4 space-y-4">
            {/* Racha */}
            <div className="p-4 border border-streak/30 bg-streak/5">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-streak" />
                <span className="text-[10px] tracking-wider text-muted-foreground">
                  RACHA ACTUAL
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-streak">
                {streak?.current_streak || 0}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Mejor racha: {streak?.longest_streak || 0} dias
              </p>
            </div>
            
            {/* Puntuacion de Disciplina */}
            <DisciplineScore />
            
            {/* Mensajes Motivacionales */}
            <div className="p-4 border border-border">
              <p className="text-[10px] tracking-wider text-muted-foreground mb-2">
                RECUERDA
              </p>
              <p className="text-xs text-foreground font-medium">
                {"\"Disciplina > Motivacion\""}
              </p>
              <p className="text-xs text-foreground font-medium mt-2">
                {"\"La ejecucion construye confianza\""}
              </p>
            </div>
            
            {/* Atajos de Teclado */}
            <div className="p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] tracking-wider text-muted-foreground">
                  ATAJOS
                </span>
              </div>
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Iniciar Tarea</span>
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground">Ctrl+S</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completar</span>
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground">Ctrl+Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modo Enfoque</span>
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground">Ctrl+F</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Navegar</span>
                  <kbd className="px-1.5 py-0.5 bg-muted text-muted-foreground">1-6</kbd>
                </div>
              </div>
            </div>
          </aside>
        </div>
        
        {/* Mobile Bottom Panel */}
        <div className="lg:hidden border-t border-border bg-background p-4 space-y-4">
          {/* Racha */}
          <div className="p-4 border border-streak/30 bg-streak/5">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-streak" />
              <span className="text-[10px] tracking-wider text-muted-foreground">
                RACHA ACTUAL
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-streak">
              {streak?.current_streak || 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Mejor racha: {streak?.longest_streak || 0} dias
            </p>
          </div>
          
          {/* Puntuacion de Disciplina */}
          <DisciplineScore />
          
          {/* Mensajes Motivacionales */}
          <div className="p-4 border border-border">
            <p className="text-[10px] tracking-wider text-muted-foreground mb-2">
              RECUERDA
            </p>
            <p className="text-xs text-foreground font-medium">
              {"\"Disciplina > Motivacion\""}
            </p>
            <p className="text-xs text-foreground font-medium mt-2">
              {"\"La ejecucion construye confianza\""}
            </p>
          </div>
        </aside>
        
        {/* Sistema anti-procrastinacion */}
        <AntiProcrastination />
        
        {/* Confirmacion de eliminacion */}
        <SkipConfirmation
          task={taskToDelete}
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={confirmDeleteTask}
        />
        
        {/* Manejador de atajos de teclado */}
        <KeyboardShortcuts
          onStartFirstTask={handleStartFirstTask}
          onCompleteActiveTask={handleCompleteActiveTask}
        />
      </div>
    </TooltipProvider>
  );
}
