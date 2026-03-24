import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

export async function getDatabase() {
  if (db) return db;

  const dbPath = path.join(process.cwd(), 'data', 'discipline.db');
  const dataDir = path.dirname(dbPath);

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Initialize database schema
  await initializeSchema(db);

  return db;
}

async function initializeSchema(db: Database) {
  // Create tables
  await db.exec(`
    -- Users table for authentication
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Tasks table (updated to include user_id)
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('SOC', 'Content', 'Personal', 'Study')),
      difficulty INTEGER NOT NULL CHECK(difficulty >= 1 AND difficulty <= 5),
      estimated_duration INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      time_spent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Daily logs for review (updated to include user_id)
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      tasks_completed INTEGER DEFAULT 0,
      tasks_failed INTEGER DEFAULT 0,
      total_time_spent INTEGER DEFAULT 0,
      notes TEXT,
      what_completed TEXT,
      what_failed TEXT,
      why_failed TEXT,
      discipline_score INTEGER DEFAULT 50,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, date)
    );

    -- Streak tracking (updated to include user_id)
    CREATE TABLE IF NOT EXISTS streak (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_completed_date TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Content ideas for creator mode (updated to include user_id)
    CREATE TABLE IF NOT EXISTS content_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      script TEXT,
      status TEXT DEFAULT 'idea' CHECK(status IN ('idea', 'scripted', 'recorded', 'published')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Settings (updated to include user_id)
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, key)
    );
  `);
}

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

export default getDatabase;
