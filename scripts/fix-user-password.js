#!/usr/bin/env node

const bcrypt = require('bcryptjs');

// Base de datos en memoria - usuario actual
const users = [
  {
    id: 1,
    username: 'xfraylin',
    password: '$2a$10$rKZ8Y8k6w2QG8mF8J9mQ8mF8J9mQ', // Hash incorrecto
    created_at: new Date().toISOString()
  }
];

async function fixUserPassword() {
  const username = 'xfraylin';
  const password = 'Fr080811';
  
  try {
    // Generar el hash correcto para 'Fr080811'
    const correctHash = await bcrypt.hash(password, 10);
    
    // Actualizar el usuario con el hash correcto
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex !== -1) {
      users[userIndex].password = correctHash;
      
      console.log('✅ User password fixed!');
      console.log('📝 Username:', username);
      console.log('🔑 Password:', password);
      console.log('🔐 New Hash:', correctHash);
      console.log('🆔 User ID:', users[userIndex].id);
      
      console.log('');
      console.log('🎯 Ahora prueba iniciar sesión con:');
      console.log('   Usuario: xfraylin');
      console.log('   Contraseña: Fr080811');
      console.log('');
      
    } else {
      console.log('❌ User not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
}

fixUserPassword();
