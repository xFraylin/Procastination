import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipos básicos que necesitamos
export type Task = {
  id: number;
  user_id: number;
  title: string;
  category: 'SOC' | 'Content' | 'Personal' | 'Study';
  difficulty: number;
  estimated_duration: number;
  date: string;
  completed: number;
  completed_at: string | null;
  time_spent: number;
  created_at: string;
};

export type View = 'dashboard' | 'tasks' | 'focus' | 'stats' | 'content' | 'review';

interface AppState {
  // User
  currentUserId: number | null;
  setCurrentUserId: (userId: number | null) => void;
  
  // Navigation
  currentView: View;
  setCurrentView: (view: View) => void;
  
  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (taskData: Omit<Task, 'id' | 'completed' | 'completed_at' | 'time_spent' | 'created_at'>) => void;
  completeTask: (id: number, timeSpent?: number) => void;
  deleteTask: (id: number) => void;
  
  // Timer System
  isTimerActive: boolean;
  setTimerActive: (active: boolean) => void;
  timerDuration: number; // minutos
  setTimerDuration: (duration: number) => void;
  timerTimeRemaining: number; // en segundos
  setTimerTimeRemaining: (time: number) => void;
  timerTaskId: number | null;
  setTimerTaskId: (taskId: number | null) => void;
  getTimerStatus: () => { 
    isActive: boolean; 
    duration: number; 
    timeRemaining: number; 
    taskId: number | null;
    progress: number;
  };
  
  // Absolute Lock System
  isAbsoluteLockActive: boolean;
  setAbsoluteLockActive: (active: boolean) => void;
  lockReason: string;
  setLockReason: (reason: string) => void;
  getAbsoluteLockStatus: () => { 
    isActive: boolean; 
    reason: string; 
    canUnlock: boolean; 
    tasksRemaining: number; 
    totalTasks: number; 
  };
  
  // Hydration State
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      currentUserId: null,
      setCurrentUserId: (userId) => set({ currentUserId: userId }),
      
      // Navigation
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),
      
      // Tasks
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      addTask: (taskData) => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        
        const tasks = get().tasks;
        const newTask: Task = {
          ...taskData,
          user_id: currentUserId,
          id: Date.now(),
          completed: 0,
          completed_at: null,
          time_spent: 0,
          created_at: new Date().toISOString(),
        };
        set({ tasks: [...tasks, newTask] });
      },
      completeTask: (id, timeSpent) => {
        const tasks = get().tasks.map(t => 
          t.id === id 
            ? { ...t, completed: 1, completed_at: new Date().toISOString(), time_spent: timeSpent || 0 }
            : t
        );
        set({ tasks });
        
        // Verificar si se debe desactivar el bloqueo absoluto
        const { isAbsoluteLockActive, getAbsoluteLockStatus } = get();
        if (isAbsoluteLockActive) {
          const lockStatus = getAbsoluteLockStatus();
          if (lockStatus.canUnlock) {
            // Auto-desbloquear cuando todas las tareas están completadas
            setTimeout(() => {
              const state = get();
              if (state.isAbsoluteLockActive) {
                state.setAbsoluteLockActive(false);
                state.setLockReason('');
                state.setCurrentView('dashboard');
                console.log('🎉 ¡Bloqueo absoluto desactivado! Todas las tareas completadas.');
              }
            }, 1000);
          }
        }
      },
      deleteTask: (id) => {
        const tasks = get().tasks.filter(t => t.id !== id);
        set({ tasks });
      },
      
      // Timer System
      isTimerActive: false,
      setTimerActive: (active) => set({ isTimerActive: active }),
      timerDuration: 30, // 30 minutos por defecto
      setTimerDuration: (duration) => set({ timerDuration: duration }),
      timerTimeRemaining: 0,
      setTimerTimeRemaining: (time) => set({ timerTimeRemaining: time }),
      timerTaskId: null,
      setTimerTaskId: (taskId) => set({ timerTaskId: taskId }),
      getTimerStatus: () => {
        const state = get();
        const progress = state.timerDuration > 0 
          ? ((state.timerDuration * 60 - state.timerTimeRemaining) / (state.timerDuration * 60)) * 100
          : 0;
          
        return {
          isActive: state.isTimerActive,
          duration: state.timerDuration,
          timeRemaining: state.timerTimeRemaining,
          taskId: state.timerTaskId,
          progress: Math.min(100, Math.max(0, progress))
        };
      },
      
      // Hydration State
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      // Absolute Lock System
      isAbsoluteLockActive: false,
      setAbsoluteLockActive: (active) => set({ isAbsoluteLockActive: active }),
      lockReason: '',
      setLockReason: (reason) => set({ lockReason: reason }),
      getAbsoluteLockStatus: () => {
        const state = get();
        const tasks = state.tasks;
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => t.date === today);
        const allCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed === 1);
        
        return {
          isActive: state.isAbsoluteLockActive,
          reason: state.lockReason,
          canUnlock: allCompleted,
          tasksRemaining: todayTasks.filter(t => t.completed === 0).length,
          totalTasks: todayTasks.length
        };
      },
    },
    {
      name: 'disciplina-store',
      partialize: (state) => {
        // Solo persistir lo que necesitamos
        return {
          tasks: state.tasks,
          currentUserId: state.currentUserId,
          currentView: state.currentView,
          isAbsoluteLockActive: state.isAbsoluteLockActive,
          lockReason: state.lockReason,
          isTimerActive: state.isTimerActive,
          timerDuration: state.timerDuration,
          timerTimeRemaining: state.timerTimeRemaining,
          timerTaskId: state.timerTaskId,
        };
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store rehidratado');
        state?.setHasHydrated(true);
      },
    }
  )
);
