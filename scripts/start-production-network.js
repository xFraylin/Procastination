#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

console.log('🏭 Iniciando aplicación en modo producción con acceso de red...\n');

// Obtener interfaces de red
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
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

// Mostrar IPs disponibles
const ips = getNetworkInterfaces();
if (ips.length > 0) {
  console.log('📱 Aplicación accesible desde:');
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
  console.log('🔨 Construyendo aplicación...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🚀 Iniciando servidor de producción...');
  execSync('npm run start', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
