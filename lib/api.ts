import db from './db';
import { Task, Settings, Streak, ContentIdea, DailyLog } from './store';

// Task API functions
export async function getUserTasks(userId: number): Promise<Task[]> {
  const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC').all(userId) as Task[];
  return tasks;
}

export async function createTask(task: Omit<Task, 'id' | 'created_at'>): Promise<Task> {
  const stmt = db.prepare(`
    INSERT INTO tasks (user_id, title, category, difficulty, estimated_duration, date, completed, completed_at, time_spent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    task.user_id,
    task.title,
    task.category,
    task.difficulty,
    task.estimated_duration,
    task.date,
    task.completed,
    task.completed_at,
    task.time_spent
  );
  
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
  return newTask;
}

export async function updateTask(id: number, updates: Partial<Task>): Promise<void> {
  const fields = Object.keys(updates).filter(key => key !== 'id').join(', ');
  const values = Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id');
  
  if (fields.length === 0) return;
  
  const stmt = db.prepare(`UPDATE tasks SET ${fields} WHERE id = ?`);
  stmt.run(...values, id);
}

export async function deleteTask(id: number): Promise<void> {
  const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
  stmt.run(id);
}

// Settings API functions
export async function getUserSettings(userId: number): Promise<Settings[]> {
  const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').all(userId) as Settings[];
  return settings;
}

export async function createDefaultSettings(userId: number): Promise<void> {
  const stmt = db.prepare(`
    INSERT INTO settings (user_id, key, value) VALUES 
    (?, 'lockdown_mode', 'false'),
    (?, 'force_mode', 'false'),
    (?, 'notification_interval', '5'),
    (?, 'pomodoro_duration', '25')
  `);
  
  stmt.run(userId, userId, userId, userId);
}

// Streak API functions
export async function getUserStreak(userId: number): Promise<Streak | null> {
  const streak = db.prepare('SELECT * FROM streak WHERE user_id = ?').get(userId) as Streak | undefined;
  return streak || null;
}

export async function createUserStreak(userId: number): Promise<Streak> {
  const stmt = db.prepare(`
    INSERT INTO streak (user_id, current_streak, longest_streak, last_completed_date)
    VALUES (?, 0, 0, NULL)
  `);
  
  const result = stmt.run(userId);
  const newStreak = db.prepare('SELECT * FROM streak WHERE id = ?').get(result.lastInsertRowid) as Streak;
  return newStreak;
}

export async function updateStreak(userId: number, streakData: Partial<Streak>): Promise<void> {
  const fields = Object.keys(streakData).filter(key => key !== 'user_id').join(', ');
  const values = Object.values(streakData).filter((_, index) => Object.keys(streakData)[index] !== 'user_id');
  
  if (fields.length === 0) return;
  
  const stmt = db.prepare(`UPDATE streak SET ${fields} WHERE user_id = ?`);
  stmt.run(...values, userId);
}

// Content Ideas API functions
export async function getUserContentIdeas(userId: number): Promise<ContentIdea[]> {
  const ideas = db.prepare('SELECT * FROM content_ideas WHERE user_id = ? ORDER BY created_at DESC').all(userId) as ContentIdea[];
  return ideas;
}

export async function createContentIdea(idea: Omit<ContentIdea, 'id' | 'created_at' | 'updated_at'>): Promise<ContentIdea> {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO content_ideas (user_id, title, description, script, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    idea.user_id,
    idea.title,
    idea.description,
    idea.script,
    idea.status,
    now,
    now
  );
  
  const newIdea = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(result.lastInsertRowid) as ContentIdea;
  return newIdea;
}

// Daily Logs API functions
export async function getUserDailyLog(userId: number, date: string): Promise<DailyLog | null> {
  const log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?').get(userId, date) as DailyLog | undefined;
  return log || null;
}

export async function saveDailyLog(log: Omit<DailyLog, 'id' | 'created_at'>): Promise<DailyLog> {
  const existingLog = await getUserDailyLog(log.user_id, log.date);
  
  if (existingLog) {
    const stmt = db.prepare(`
      UPDATE daily_logs 
      SET tasks_completed = ?, tasks_failed = ?, total_time_spent = ?, 
          notes = ?, what_completed = ?, what_failed = ?, why_failed = ?, discipline_score = ?
      WHERE user_id = ? AND date = ?
    `);
    
    stmt.run(
      log.tasks_completed,
      log.tasks_failed,
      log.total_time_spent,
      log.notes,
      log.what_completed,
      log.what_failed,
      log.why_failed,
      log.discipline_score,
      log.user_id,
      log.date
    );
    
    return await getUserDailyLog(log.user_id, log.date) as DailyLog;
  } else {
    const stmt = db.prepare(`
      INSERT INTO daily_logs (user_id, date, tasks_completed, tasks_failed, total_time_spent, 
                              notes, what_completed, what_failed, why_failed, discipline_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      log.user_id,
      log.date,
      log.tasks_completed,
      log.tasks_failed,
      log.total_time_spent,
      log.notes,
      log.what_completed,
      log.what_failed,
      log.why_failed,
      log.discipline_score
    );
    
    const newLog = db.prepare('SELECT * FROM daily_logs WHERE id = ?').get(result.lastInsertRowid) as DailyLog;
    return newLog;
  }
}
