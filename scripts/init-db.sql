-- Initialize SQLite database for Discipline Execution System

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('SOC', 'Content', 'Personal', 'Study')),
  difficulty INTEGER NOT NULL CHECK(difficulty >= 1 AND difficulty <= 5),
  estimated_duration INTEGER NOT NULL, -- in minutes
  date TEXT NOT NULL, -- YYYY-MM-DD format
  completed INTEGER DEFAULT 0,
  completed_at TEXT,
  time_spent INTEGER DEFAULT 0, -- actual time in seconds
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Daily logs for review system
CREATE TABLE IF NOT EXISTS daily_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  notes TEXT,
  what_completed TEXT,
  what_failed TEXT,
  why_failed TEXT,
  discipline_score INTEGER DEFAULT 50,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Streaks tracking
CREATE TABLE IF NOT EXISTS streaks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Content creator ideas
CREATE TABLE IF NOT EXISTS content_ideas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  script TEXT,
  status TEXT DEFAULT 'idea' CHECK(status IN ('idea', 'scripted', 'recorded', 'published')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Settings for lockdown/focus modes
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Idle tracking
CREATE TABLE IF NOT EXISTS idle_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  idle_duration INTEGER DEFAULT 0, -- in seconds
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value) VALUES ('lockdown_mode', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('force_mode', 'false');
INSERT OR IGNORE INTO settings (key, value) VALUES ('notification_interval', '5'); -- minutes
INSERT OR IGNORE INTO settings (key, value) VALUES ('pomodoro_duration', '25'); -- minutes

-- Insert initial streak record
INSERT OR IGNORE INTO streaks (id, current_streak, longest_streak) VALUES (1, 0, 0);
