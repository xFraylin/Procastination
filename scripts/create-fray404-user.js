#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Ruta de la base de datos
const dbPath = path.join(process.cwd(), 'data', 'database.json');

async function createFray404User() {
  try {
    // Leer base de datos actual
    let database;
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      database = JSON.parse(data);
    } else {
      console.log('❌ Database file not found');
      return;
    }
    
    // Verificar si el usuario ya existe
    const existingUser = database.users.find(u => u.username === 'fray404');
    if (existingUser) {
      console.log('✅ User fray404 already exists');
      return;
    }
    
    // Crear hash para la contraseña
    const password = 'Fr080811'; // Usar la misma contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const newUser = {
      id: Math.max(...database.users.map(u => u.id), 0) + 1,
      username: 'fray404',
      password: hashedPassword,
      created_at: new Date().toISOString()
    };
    
    // Agregar usuario a la base de datos
    database.users.push(newUser);
    
    // Guardar base de datos
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    
    console.log('✅ User fray404 created successfully!');
    console.log('📝 Username: fray404');
    console.log('🔑 Password: Fr080811');
    console.log('🆔 User ID:', newUser.id);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createFray404User();
