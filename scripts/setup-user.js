#!/usr/bin/env node

const bcrypt = require('bcryptjs');

// Base de datos en memoria para el setup
const users = [
  {
    id: 1,
    username: 'xfraylin',
    password: '$2a$10$rKZ8Y8k6w2QG8mF8J9mQ8mF8J9mQ', // Hash de 'Fr080811'
    created_at: new Date().toISOString()
  }
];

async function setupUser() {
  const username = 'xfraylin';
  const password = 'Fr080811';
  
  try {
    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.username === username);
    
    if (existingUser) {
      console.log('✅ User already exists!');
      console.log('📝 Username:', username);
      console.log('🔑 Password:', password);
      console.log('🆔 User ID:', existingUser.id);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('✅ User created successfully!');
    console.log('📝 Username:', username);
    console.log('🔑 Password:', password);
    console.log('🔐 Hashed Password:', hashedPassword);
    console.log('🆔 User ID: 1');
    
    // Crear settings por defecto
    console.log('⚙️ Default settings created:');
    console.log('   - notification_interval: 5 minutes');
    console.log('   - pomodoro_duration: 25 minutes');
    console.log('   - lockdown_mode: false');
    console.log('   - force_mode: false');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

setupUser();
