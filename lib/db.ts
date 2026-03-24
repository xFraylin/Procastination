// Base de datos SQLite real para producción
import database from './db-sqlite';

const db = database;

interface MemoryUser {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

interface MemoryTask {
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
}

interface MemoryStreak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  updated_at: string;
}

interface MemorySetting {
  id: number;
  user_id: number;
  key: string;
  value: string;
  created_at?: string;
}

// In-memory storage
let users: MemoryUser[] = [
  {
    id: 1,
    username: 'xfraylin',
    password: '$2b$10$MU3GDY8pJtlVbYmgTYYk/eR/X8tVonoNMiIWcFEf9Xx/TL5FOnJM6', // Hash correcto para 'Fr080811'
    created_at: new Date().toISOString()
  }
];
let tasks: MemoryTask[] = [];
let streaks: MemoryStreak[] = [];
let settings: MemorySetting[] = [
  {
    id: 1,
    user_id: 1,
    key: 'notification_interval',
    value: '5',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    user_id: 1,
    key: 'pomodoro_duration',
    value: '25',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    user_id: 1,
    key: 'lockdown_mode',
    value: 'false',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    user_id: 1,
    key: 'force_mode',
    value: 'false',
    created_at: new Date().toISOString()
  }
];

let userIdCounter = 1;
let taskIdCounter = 1;
let streakIdCounter = 1;
let settingIdCounter = 1;

// Helper types
export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Task {
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
}

export interface DailyLog {
  id: number;
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
  created_at: string;
}

export interface Streak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  updated_at: string;
}

export interface ContentIdea {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  script: string | null;
  status: 'idea' | 'scripted' | 'recorded' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  user_id: number;
  key: string;
  value: string;
  updated_at: string;
}

// Database interface methods
const db = {
  prepare: (query: string) => ({
    run: (...params: any[]) => {
      if (query.includes('INSERT INTO users')) {
        const [username, password] = params;
        
        // Check if user already exists
        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
          throw new Error('Username already exists');
        }
        
        const newUser: MemoryUser = {
          id: userIdCounter++,
          username,
          password,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        
        // Initialize streak and settings for new user
        const newStreak: MemoryStreak = {
          id: streakIdCounter++,
          user_id: newUser.id,
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null,
          updated_at: new Date().toISOString()
        };
        streaks.push(newStreak);
        
        const defaultSettings: MemorySetting[] = [
          { id: settingIdCounter++, user_id: newUser.id, key: 'lockdown_mode', value: 'false', created_at: new Date().toISOString() },
          { id: settingIdCounter++, user_id: newUser.id, key: 'force_mode', value: 'false', created_at: new Date().toISOString() },
          { id: settingIdCounter++, user_id: newUser.id, key: 'notification_interval', value: '5', created_at: new Date().toISOString() },
          { id: settingIdCounter++, user_id: newUser.id, key: 'pomodoro_duration', value: '25', created_at: new Date().toISOString() }
        ];
        settings.push(...defaultSettings);
        
        return { lastInsertRowid: newUser.id };
      }
      
      if (query.includes('INSERT INTO tasks')) {
        const [user_id, title, category, difficulty, estimated_duration, date, completed, completed_at, time_spent] = params;
        const newTask: MemoryTask = {
          id: taskIdCounter++,
          user_id,
          title,
          category,
          difficulty,
          estimated_duration,
          date,
          completed,
          completed_at,
          time_spent,
          created_at: new Date().toISOString()
        };
        tasks.push(newTask);
        return { lastInsertRowid: newTask.id };
      }
      
      if (query.includes('UPDATE tasks')) {
        const [completed, completed_at, time_spent, id] = params;
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
          tasks[taskIndex] = { ...tasks[taskIndex], completed, completed_at, time_spent };
        }
        return {};
      }
      
      if (query.includes('DELETE FROM tasks')) {
        const [id] = params;
        tasks = tasks.filter(t => t.id !== id);
        return {};
      }
      
      if (query.includes('UPDATE streak')) {
        const [current_streak, longest_streak, last_completed_date, user_id] = params;
        const streakIndex = streaks.findIndex(s => s.user_id === user_id);
        if (streakIndex !== -1) {
          streaks[streakIndex] = { 
            ...streaks[streakIndex], 
            current_streak, 
            longest_streak, 
            last_completed_date,
            updated_at: new Date().toISOString()
          };
        }
        return {};
      }
      
      return {};
    },
    get: (...params: any[]) => {
      if (query.includes('SELECT * FROM users WHERE username = ?')) {
        const [username] = params;
        return users.find(u => u.username === username) || undefined;
      }
      
      if (query.includes('SELECT * FROM users WHERE id = ?')) {
        const [id] = params;
        return users.find(u => u.id === id) || undefined;
      }
      
      if (query.includes('SELECT * FROM tasks WHERE id = ?')) {
        const [id] = params;
        return tasks.find(t => t.id === id) || undefined;
      }
      
      if (query.includes('SELECT * FROM tasks WHERE user_id = ?')) {
        const [user_id] = params;
        return tasks.filter(t => t.user_id === user_id);
      }
      
      if (query.includes('SELECT * FROM streak WHERE user_id = ?')) {
        const [user_id] = params;
        return streaks.find(s => s.user_id === user_id) || undefined;
      }
      
      if (query.includes('SELECT * FROM settings WHERE user_id = ?')) {
        const [user_id] = params;
        return settings.filter(s => s.user_id === user_id);
      }
      
      return undefined;
    },
    all: (...params: any[]) => {
      if (query.includes('SELECT * FROM tasks WHERE user_id = ?')) {
        const [user_id] = params;
        return tasks.filter(t => t.user_id === user_id);
      }
      
      return [];
    },
    exec: () => {
      // Schema initialization - no-op for in-memory
    }
  })
};

export default db;
