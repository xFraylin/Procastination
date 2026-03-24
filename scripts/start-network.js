#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

// Obtener interfaces de red
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ignorar interfaces internas y no IPv4
      if (!interface.internal && interface.family === 'IPv4') {
        ips.push({
          name: name,
          ip: interface.address,
        });
      }
    }
  }
  
  return ips;
}

console.log('🚀 Iniciando servidor de desarrollo...\n');

// Mostrar IPs disponibles
const ips = getNetworkInterfaces();
if (ips.length > 0) {
  console.log('📱 Accesible desde los siguientes dispositivos:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  ips.forEach(({ name, ip }) => {
    console.log(`🌐 ${name}: http://${ip}:3000`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`💻 Local: http://localhost:3000`);
  console.log('');
} else {
  console.log('⚠️  No se encontraron interfaces de red externas');
  console.log(`💻 Solo accesible localmente: http://localhost:3000`);
  console.log('');
}

try {
  // Iniciar el servidor
  execSync('npm run dev', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error al iniciar el servidor:', error.message);
  process.exit(1);
}
