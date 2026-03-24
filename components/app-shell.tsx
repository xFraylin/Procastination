'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { BottomNav } from '@/components/bottom-nav';
import { Sidebar } from '@/components/sidebar-desktop';
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
  
  const handleCompleteTask = (taskId: number) => {
    completeTask(taskId);
  };
  
  const handleDeleteTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setShowDeleteConfirm(true);
    }
  };
  
  const confirmDeleteTask = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
    }
  };
  
  const handleStartFirstTask = useCallback(() => {
    const pendingTasks = tasks.filter(t => t.completed === 0);
    if (pendingTasks.length > 0) {
      setActiveTask(pendingTasks[0]);
      setCurrentView('focus');
    }
  }, [tasks, setActiveTask, setCurrentView]);
  
  const handleCompleteActiveTask = useCallback(() => {
    if (activeTask) {
      completeTask(activeTask.id);
      setActiveTask(null);
    }
  }, [activeTask, completeTask, setActiveTask]);
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'tasks':
        return (
          <TasksView
            onAddTask={handleAddTask}
            onStartTask={(task) => setActiveTask(task)}
            onCompleteTask={(task) => completeTask(task.id)}
            onDeleteTask={(task) => handleDeleteTask(task.id)}
          />
        );
      case 'focus':
        return (
          <FocusView
            onCompleteTask={(task) => completeTask(task.id)}
          />
        );
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
        {/* Mobile Layout - Bottom Navigation */}
        <div className="md:hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto min-h-screen pb-16">
            {renderView()}
          </main>
          
          {/* Bottom Navigation - Mobile Only */}
          <BottomNav />
        </div>
        
        {/* Desktop Layout - Sidebar + Main Content */}
        <div className="hidden md:flex">
          {/* Desktop Sidebar */}
          <Sidebar onLogout={handleLogout} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto min-h-screen">
            {renderView()}
          </main>
          
          {/* Right Panel - Desktop: fixed */}
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
          </aside>
        </div>
        
        {/* Sistema anti-procrastinacion - Global */}
        <AntiProcrastination />
        
        {/* Confirmacion de eliminacion - Global */}
        <SkipConfirmation
          task={taskToDelete}
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
          onConfirm={confirmDeleteTask}
        />
        
        {/* Manejador de atajos de teclado - Global */}
        <KeyboardShortcuts
          onStartFirstTask={handleStartFirstTask}
          onCompleteActiveTask={handleCompleteActiveTask}
        />
      </div>
    </TooltipProvider>
  );
}
