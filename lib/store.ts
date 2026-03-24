import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  user_id: number;
  title: string;
  description: string | null;
  script: string | null;
  status: 'idea' | 'scripted' | 'recorded' | 'published';
  created_at: string;
  updated_at: string;
};

export type Settings = {
  user_id: number;
  lockdown_mode: string;
  force_mode: string;
  notification_interval: string;
  pomodoro_duration: string;
};

export type Streak = {
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
};

export type DailyLog = {
  user_id: number;
  date: string;
  tasks_completed: number;
  tasks_failed: number;
  total_time_spent: number;
  notes: string | null;
  what_completed: string | null;
  what_failed: string | null;
  why_failed: string | null;
  discipline_score: number;
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
  addTask: (task: Omit<Task, 'id' | 'completed' | 'completed_at' | 'time_spent' | 'created_at'>) => void;
  completeTask: (id: number, timeSpent?: number) => void;
  deleteTask: (id: number) => void;
  activeTask: Task | null;
  setActiveTask: (task: Task | null) => void;
  
  // Focus mode
  isFocusMode: boolean;
  setFocusMode: (active: boolean) => void;
  focusTimeRemaining: number;
  setFocusTimeRemaining: (time: number) => void;
  focusTimerRunning: boolean;
  setFocusTimerRunning: (running: boolean) => void;
  
  // Lockdown
  isLockdownMode: boolean;
  setLockdownMode: (active: boolean) => void;
  isForceMode: boolean;
  setForceMode: (active: boolean) => void;
  
  // Settings
  settings: Settings | null;
  setSettings: (settings: Settings | null) => void;
  
  // Streak
  streak: Streak | null;
  updateStreak: () => void;
  
  // Discipline Score
  disciplineScore: number;
  updateDisciplineScore: (delta: number) => void;
  
  // Content
  contentIdeas: ContentIdea[];
  setContentIdeas: (ideas: ContentIdea[]) => void;
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'created_at' | 'updated_at'>) => void;
  updateContentIdea: (id: number, updates: Partial<ContentIdea>) => void;
  deleteContentIdea: (id: number) => void;
  
  // Daily Logs
  dailyLogs: DailyLog[];
  saveDailyLog: (log: DailyLog) => void;
  getDailyLog: (date: string) => DailyLog | undefined;
  
  // Anti-procrastination
  lastInteraction: number;
  setLastInteraction: (time: number) => void;
  idleWarningShown: boolean;
  setIdleWarningShown: (shown: boolean) => void;
  
  // Daily review
  showDailyReview: boolean;
  setShowDailyReview: (show: boolean) => void;
  
  // Hydration
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
            ? { ...t, completed: 1, completed_at: new Date().toISOString(), time_spent: timeSpent || t.time_spent }
            : t
        );
        set({ tasks });
        get().updateStreak();
        get().updateDisciplineScore(10);
      },
      deleteTask: (id) => {
        const tasks = get().tasks.filter(t => t.id !== id);
        set({ tasks });
        get().updateDisciplineScore(-5);
      },
      activeTask: null,
      setActiveTask: (task) => set({ activeTask: task }),
      
      // Focus mode
      isFocusMode: false,
      setFocusMode: (active) => set({ isFocusMode: active }),
      focusTimeRemaining: 25 * 60,
      setFocusTimeRemaining: (time) => set({ focusTimeRemaining: time }),
      focusTimerRunning: false,
      setFocusTimerRunning: (running) => set({ focusTimerRunning: running }),
      
      // Lockdown
      isLockdownMode: false,
      setLockdownMode: (active) => set({ isLockdownMode: active }),
      isForceMode: false,
      setForceMode: (active) => set({ isForceMode: active }),
      
      // Settings
      settings: null,
      setSettings: (settings) => set({ settings }),
      
      // Streak
      streak: null,
      updateStreak: () => {
        const currentUserId = get().currentUserId;
        if (!currentUserId) return;
        
        const today = new Date().toISOString().split('T')[0];
        const streak = get().streak;
        const tasks = get().tasks;
        
        if (!streak) return;
        
        const todayTasks = tasks.filter(t => t.date === today);
        const allCompleted = todayTasks.length > 0 && todayTasks.every(t => t.completed === 1);
        
        if (allCompleted && streak.last_completed_date !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          let newStreak = streak.current_streak;
          if (streak.last_completed_date === yesterdayStr) {
            newStreak += 1;
          } else if (streak.last_completed_date !== today) {
            newStreak = 1;
          }
          
          set({ 
            streak: {
              ...streak,
              current_streak: newStreak,
              longest_streak: Math.max(newStreak, streak.longest_streak),
              last_completed_date: today
            }
          });
        }
      },
      
      // Discipline Score
      disciplineScore: 50,
      updateDisciplineScore: (delta) => {
        const current = get().disciplineScore;
        const newScore = Math.max(0, Math.min(100, current + delta));
        set({ disciplineScore: newScore });
      },
      
      // Content
      contentIdeas: [],
      setContentIdeas: (ideas) => set({ contentIdeas: ideas }),
      addContentIdea: (ideaData) => {
        const ideas = get().contentIdeas;
        const newIdea: ContentIdea = {
          ...ideaData,
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set({ contentIdeas: [...ideas, newIdea] });
      },
      updateContentIdea: (id, updates) => {
        const ideas = get().contentIdeas.map(i => 
          i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i
        );
        set({ contentIdeas: ideas });
      },
      deleteContentIdea: (id) => {
        const ideas = get().contentIdeas.filter(i => i.id !== id);
        set({ contentIdeas: ideas });
      },
      
      // Daily Logs
      dailyLogs: [],
      saveDailyLog: (log) => {
        const logs = get().dailyLogs.filter(l => l.date !== log.date);
        set({ dailyLogs: [...logs, log] });
      },
      getDailyLog: (date) => {
        return get().dailyLogs.find(l => l.date === date);
      },
      
      // Anti-procrastination
      lastInteraction: Date.now(),
      setLastInteraction: (time) => set({ lastInteraction: time }),
      idleWarningShown: false,
      setIdleWarningShown: (shown) => set({ idleWarningShown: shown }),
      
      // Daily review
      showDailyReview: false,
      setShowDailyReview: (show) => set({ showDailyReview: show }),
      
      // Hydration
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'discipline-execution-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        streak: state.streak,
        disciplineScore: state.disciplineScore,
        contentIdeas: state.contentIdeas,
        dailyLogs: state.dailyLogs,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
