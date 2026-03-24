import fs from 'fs';
import path from 'path';

// Ruta del archivo de base de datos
const dbPath = path.join(process.cwd(), 'data', 'database.json');

// Crear directorio si no existe
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
}

// Base de datos inicial
interface Database {
  users: User[];
  tasks: Task[];
  streaks: Streak[];
  settings: Setting[];
  dailyLogs: DailyLog[];
  contentIdeas: ContentIdea[];
}

interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

interface Task {
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

interface Streak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  updated_at: string;
}

interface Setting {
  id: number;
  user_id: number;
  key: string;
  value: string;
  created_at: string;
}

interface DailyLog {
  id: number;
  user_id: number;
  date: string;
  tasks_completed: number;
  time_spent: number;
  created_at: string;
}

interface ContentIdea {
  id: number;
  user_id: number;
  title: string;
  script: string | null;
  status: 'idea' | 'scripted' | 'recorded' | 'published';
  created_at: string;
  updated_at: string;
}

// Cargar base de datos desde archivo
function loadDatabase(): Database {
  if (!fs.existsSync(dbPath)) {
    // Crear base de datos inicial
    const initialDb: Database = {
      users: [
        {
          id: 1,
          username: 'xfraylin',
          password: '$2b$10$MU3GDY8pJtlVbYmgTYYk/eR/X8tVonoNMiIWcFEf9Xx/TL5FOnJM6',
          created_at: new Date().toISOString()
        }
      ],
      tasks: [],
      streaks: [
        {
          id: 1,
          user_id: 1,
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null,
          updated_at: new Date().toISOString()
        }
      ],
      settings: [
        { id: 1, user_id: 1, key: 'notification_interval', value: '5', created_at: new Date().toISOString() },
        { id: 2, user_id: 1, key: 'pomodoro_duration', value: '25', created_at: new Date().toISOString() },
        { id: 3, user_id: 1, key: 'lockdown_mode', value: 'false', created_at: new Date().toISOString() },
        { id: 4, user_id: 1, key: 'force_mode', value: 'false', created_at: new Date().toISOString() }
      ],
      dailyLogs: [],
      contentIdeas: []
    };
    
    saveDatabase(initialDb);
    return initialDb;
  }
  
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error);
    return loadDatabase(); // Recreate if corrupted
  }
}

// Guardar base de datos a archivo
function saveDatabase(db: Database): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// Exportar tipos
export type { User, Task, Streak, Setting, DailyLog, ContentIdea };

// Crear interfaz de base de datos compatible
const db = {
  prepare: (query: string) => {
    return {
      run: (...params: any[]) => {
        const database = loadDatabase();
        
        if (query.includes('INSERT INTO users')) {
          const [username, password] = params;
          const newUser: User = {
            id: Math.max(...database.users.map(u => u.id), 0) + 1,
            username,
            password,
            created_at: new Date().toISOString()
          };
          database.users.push(newUser);
          saveDatabase(database);
          return { lastInsertRowid: newUser.id };
        }
        
        if (query.includes('INSERT INTO tasks')) {
          const [user_id, title, category, difficulty, estimated_duration, date, completed, completed_at, time_spent] = params;
          const newTask: Task = {
            id: Math.max(...database.tasks.map(t => t.id), 0) + 1,
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
          database.tasks.push(newTask);
          saveDatabase(database);
          return { lastInsertRowid: newTask.id };
        }
        
        return { lastInsertRowid: 1 };
      },
      
      get: (...params: any[]) => {
        const database = loadDatabase();
        
        if (query.includes('SELECT * FROM users WHERE username = ?')) {
          const [username] = params;
          return database.users.find(u => u.username === username);
        }
        
        if (query.includes('SELECT * FROM users WHERE id = ?')) {
          const [id] = params;
          return database.users.find(u => u.id === id);
        }
        
        if (query.includes('SELECT * FROM tasks WHERE id = ?')) {
          const [id] = params;
          return database.tasks.find(t => t.id === id);
        }
        
        return undefined;
      },
      
      all: (...params: any[]) => {
        const database = loadDatabase();
        
        if (query.includes('SELECT * FROM tasks WHERE user_id = ?')) {
          const [user_id] = params;
          return database.tasks.filter(t => t.user_id === user_id);
        }
        
        if (query.includes('SELECT * FROM users')) {
          return database.users;
        }
        
        if (query.includes('SELECT * FROM settings WHERE user_id = ?')) {
          const [user_id] = params;
          return database.settings.filter(s => s.user_id === user_id);
        }
        
        return [];
      },
      
      exec: () => {
        // Para queries que no retornan datos
      }
    };
  }
};

export default db;
