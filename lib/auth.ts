import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/jwt';
import db from './db';
import { User } from './db';

export interface AuthUser {
  id: number;
  username: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(username: string, password: string): Promise<User> {
  const hashedPassword = await hashPassword(password);
  
  const stmt = db.prepare(`
    INSERT INTO users (username, password) 
    VALUES (?, ?)
  `);
  
  const result = stmt.run(username, hashedPassword);
  
  // Initialize user's streak and default settings
  const streakStmt = db.prepare(`
    INSERT INTO streak (user_id, current_streak, longest_streak) 
    VALUES (?, 0, 0)
  `);
  streakStmt.run(result.lastInsertRowid as number);
  
  const settingsStmt = db.prepare(`
    INSERT INTO settings (user_id, key, value) VALUES 
    (?, 'lockdown_mode', 'false'),
    (?, 'force_mode', 'false'),
    (?, 'notification_interval', '5'),
    (?, 'pomodoro_duration', '25')
  `);
  settingsStmt.run(result.lastInsertRowid as number);
  settingsStmt.run(result.lastInsertRowid as number);
  settingsStmt.run(result.lastInsertRowid as number);
  settingsStmt.run(result.lastInsertRowid as number);
  
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
  return user;
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password);
  return isValid ? user : null;
}

export async function getUserById(id: number): Promise<User | null> {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  return user || null;
}
