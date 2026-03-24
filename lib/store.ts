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

export type ContentIdea = {
  id: number;
  title: string;
  description: string | null;
  script: string | null;
  status: 'idea' | 'scripted' | 'recorded' | 'published';
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
  
  // Anti-Procrastination State
  lastInteraction: number;
  setLastInteraction: (time: number) => void;
  idleWarningShown: boolean;
  setIdleWarningShown: (shown: boolean) => void;
  settings: any;
  setSettings: (settings: any) => void;
  
  // Content Ideas State
  contentIdeas: ContentIdea[];
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'created_at'>) => void;
  updateContentIdea: (id: number, idea: Partial<ContentIdea>) => void;
  deleteContentIdea: (id: number) => void;
  
  // Daily Logs State
  dailyLogs: any[];
  getDailyLog: (date: string) => any;
  saveDailyLog: (log: any) => void;
  updateStreak: () => void;
  disciplineScore: number;
  
  // Focus Mode State
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;
  focusTimeRemaining: number;
  setFocusTimeRemaining: (time: number) => void;
  focusTimerRunning: boolean;
  setFocusTimerRunning: (running: boolean) => void;
  
  // Streak State
  streak: {
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
  };
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
      
      // Hydration State
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      // Anti-Procrastination State
      lastInteraction: Date.now(),
      setLastInteraction: (time) => set({ lastInteraction: time }),
      idleWarningShown: false,
      setIdleWarningShown: (shown) => set({ idleWarningShown: shown }),
      settings: null,
      setSettings: (settings) => set({ settings }),
      
      // Content Ideas State
      contentIdeas: [],
      addContentIdea: (idea) => {
        const ideas = get().contentIdeas;
        const newIdea = {
          ...idea,
          id: Date.now(),
          created_at: new Date().toISOString(),
        };
        set({ contentIdeas: [...ideas, newIdea] });
      },
      updateContentIdea: (id, idea) => {
        const ideas = get().contentIdeas.map(i => 
          i.id === id ? { ...i, ...idea } : i
        );
        set({ contentIdeas: ideas });
      },
      deleteContentIdea: (id) => {
        const ideas = get().contentIdeas.filter(i => i.id !== id);
        set({ contentIdeas: ideas });
      },
      
      // Daily Logs State
      dailyLogs: [],
      disciplineScore: 0,
      getDailyLog: (date) => {
        const logs = get().dailyLogs;
        return logs.find(log => log.date === date) || null;
      },
      saveDailyLog: (log) => {
        const logs = get().dailyLogs;
        const existingIndex = logs.findIndex(l => l.date === log.date);
        
        if (existingIndex >= 0) {
          logs[existingIndex] = log;
        } else {
          logs.push(log);
        }
        
        set({ dailyLogs: [...logs] });
      },
      updateStreak: () => {
        // Implementación simple de streak
        const today = new Date().toISOString().split('T')[0];
        const logs = get().dailyLogs;
        const todayLog = logs.find(log => log.date === today);
        
        if (todayLog) {
          // Calcular streak basado en logs consecutivos
          let streak = 1;
          const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          for (let i = 1; i < sortedLogs.length; i++) {
            const currentDate = new Date(sortedLogs[i-1].date);
            const prevDate = new Date(sortedLogs[i].date);
            const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
          
          set({ disciplineScore: streak * 10 });
        }
      },
      
      // Focus Mode State
      activeTask: null,
      setActiveTask: (task) => set({ activeTask: task }),
      isFocusMode: false,
      setFocusMode: (active) => set({ isFocusMode: active }),
      focusTimeRemaining: 0,
      setFocusTimeRemaining: (time) => set({ focusTimeRemaining: time }),
      focusTimerRunning: false,
      setFocusTimerRunning: (running) => set({ focusTimerRunning: running }),
      
      // Streak State
      streak: {
        current_streak: 0,
        longest_streak: 0,
        last_completed_date: null,
      },
    }),
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
          contentIdeas: state.contentIdeas,
          dailyLogs: state.dailyLogs,
          disciplineScore: state.disciplineScore,
          activeTask: state.activeTask,
          isFocusMode: state.isFocusMode,
          focusTimeRemaining: state.focusTimeRemaining,
          focusTimerRunning: state.focusTimerRunning,
          streak: state.streak,
        };
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Store rehidratado');
        state?.setHasHydrated(true);
      },
    }
  )
);
