// Base de datos SQLite real para producción
import database from './db-sqlite';

const db = database;

// Exportar tipos para compatibilidad
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

export interface Streak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  updated_at: string;
}

export interface DailyLog {
  id: number;
  user_id: number;
  date: string;
  tasks_completed: number;
  time_spent: number;
  created_at: string;
}

export interface ContentIdea {
  id: number;
  user_id: number;
  title: string;
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
  created_at: string;
}

// Inicializar usuario por defecto si no existe
function initializeDefaultUser() {
  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get('xfraylin');
  
  if (!existingUser) {
    const hashedPassword = '$2b$10$MU3GDY8pJtlVbYmgTYYk/eR/X8tVonoNMiIWcFEf9Xx/TL5FOnJM6';
    
    db.prepare(`
      INSERT INTO users (username, password, created_at)
      VALUES (?, ?, ?)
    `).run('xfraylin', hashedPassword, new Date().toISOString());
    
    // Crear configuración por defecto
    const defaultSettings = [
      { user_id: 1, key: 'notification_interval', value: '5', created_at: new Date().toISOString() },
      { user_id: 1, key: 'pomodoro_duration', value: '25', created_at: new Date().toISOString() },
      { user_id: 1, key: 'lockdown_mode', value: 'false', created_at: new Date().toISOString() },
      { user_id: 1, key: 'force_mode', value: 'false', created_at: new Date().toISOString() }
    ];
    
    defaultSettings.forEach(setting => {
      db.prepare(`
        INSERT INTO settings (user_id, key, value, created_at)
        VALUES (?, ?, ?, ?)
      `).run(setting.user_id, setting.key, setting.value, setting.created_at);
    });
    
    // Crear streak inicial
    db.prepare(`
      INSERT INTO streaks (user_id, current_streak, longest_streak, updated_at)
      VALUES (?, ?, ?)
    `).run(1, 0, 0, new Date().toISOString());
    
    console.log('✅ Default user created: xfraylin');
  }
}

// Inicializar al cargar el módulo
initializeDefaultUser();

export default db;
