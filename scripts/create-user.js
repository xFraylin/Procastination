#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const db = require('./lib/db.ts');

async function createUser() {
  const username = 'xfraylin';
  const password = 'Fr080811';
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const stmt = db.prepare(`
      INSERT INTO users (username, password, created_at)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(username, hashedPassword, new Date().toISOString());
    
    console.log('✅ User created successfully!');
    console.log('📝 Username:', username);
    console.log('🔑 Password:', password);
    console.log('🆔 User ID:', result.lastInsertRowid);
    
    // Create default settings for user
    const settingsStmt = db.prepare(`
      INSERT INTO settings (user_id, lockdown_mode, force_mode, notification_interval, pomodoro_duration)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    settingsStmt.run(result.lastInsertRowid, 'false', 'false', '5', '25');
    
    console.log('⚙️ Default settings created for user');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createUser();
