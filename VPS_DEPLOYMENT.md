# 🚀 Guía de Despliegue en VPS

## 📋 Prerrequisitos

### En tu VPS:
- ✅ Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- ✅ Docker y Docker Compose instalados
- ✅ SSH configurado
- ✅ Dominio apuntando al VPS (opcional)

### Instalar Docker en VPS:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 🎯 Despliegue Automático

### 1. Usar el script de despliegue:
```bash
./scripts/deploy.sh <usuario> <host> <dominio>
```

**Ejemplos:**
```bash
# Con IP
./scripts/deploy.sh root 192.168.1.100 midominio.com

# Con dominio
./scripts/deploy.sh ubuntu server.midominio.com midominio.com
```

### 2. El script hará automáticamente:
- ✅ Crear directorios necesarios
- ✅ Copiar archivos al VPS
- ✅ Configurar variables de entorno
- ✅ Generar certificado SSL
- ✅ Construir y levantar contenedores
- ✅ Verificar que funcione

## 🔧 Despliegue Manual

### 1. Preparar archivos:
```bash
# Copiar archivos al VPS
scp -r . usuario@tu-vps:~/app/

# Conectarse al VPS
ssh usuario@tu-vps
cd ~/app
```

### 2. Configurar entorno:
```bash
# Copiar variables de producción
cp .env.production .env

# Editar variables importantes
nano .env
```

**Variables importantes a cambiar:**
- `JWT_SECRET` - Clave secreta única
- `ALLOWED_ORIGINS` - Tu dominio
- `SESSION_SECRET` - Secreto de sesión

### 3. Configurar dominio:
```bash
# Reemplazar tu dominio en nginx
sed -i 's/your-domain.com/tu-dominio.com/g' nginx.conf
```

### 4. Crear certificados SSL:
```bash
# Crear directorio SSL
mkdir -p ssl

# Generar certificado auto-firmado (para pruebas)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=tu-dominio.com'

# O con Let's Encrypt (producción)
certbot --nginx -d tu-dominio.com
```

### 5. Levantar la aplicación:
```bash
# Construir y levantar
docker-compose down
docker-compose build
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 🌐 Acceso a la Aplicación

### URLs después del despliegue:
```
🔒 HTTPS: https://tu-dominio.com
📱 Móvil: https://tu-dominio.com
🔧 API: https://tu-dominio.com/api
```

### Verificar que funciona:
```bash
# Health check
curl -k https://tu-dominio.com/api/health

# Verificar contenedores
docker-compose ps
```

## 🔒 Seguridad en Producción

### Configuraciones de seguridad:
- ✅ HTTPS con SSL/TLS
- ✅ Rate limiting en APIs
- ✅ Headers de seguridad
- ✅ CORS configurado
- ✅ Variables de entorno seguras

### Recomendaciones adicionales:
```bash
# Firewall básico
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Actualizar sistema
apt update && apt upgrade -y

# Backup de datos
docker-compose exec app tar -czf /backup/data-$(date +%Y%m%d).tar.gz /app/data
```

## 🔄 Actualización de la Aplicación

### Para actualizar:
```bash
# Conectarse al VPS
ssh usuario@tu-vps
cd ~/app

# Pull de cambios (si usas git)
git pull

# O copiar archivos nuevos
# scp -r . usuario@tu-vps:~/app/

# Reconstruir y levantar
docker-compose build
docker-compose up -d
```

### Script de actualización:
```bash
#!/bin/bash
cd ~/app
git pull
docker-compose build
docker-compose up -d
echo "✅ Aplicación actualizada"
```

## 📊 Monitoreo

### Ver estado:
```bash
# Estado de contenedores
docker-compose ps

# Logs en tiempo real
docker-compose logs -f app

# Logs de nginx
docker-compose logs -f nginx

# Uso de recursos
docker stats
```

### Health checks:
```bash
# Verificar API
curl -k https://tu-dominio.com/api/health

# Verificar frontend
curl -k -I https://tu-dominio.com
```

## 🚨 Solución de Problemas

### La aplicación no responde:
```bash
# Reiniciar contenedores
docker-compose restart

# Ver logs de errores
docker-compose logs app

# Verificar puertos
netstat -tlnp | grep :3000
```

### Error de SSL:
```bash
# Regenerar certificado
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=tu-dominio.com'

# Reiniciar nginx
docker-compose restart nginx
```

### Problemas de permisos:
```bash
# Fix permisos de directorios
sudo chown -R $USER:$USER ~/app
sudo chmod -R 755 ~/app
```

## 📱 Acceso desde Dispositivos Externos

### Para que otros accedan:
1. ✅ **Configurar DNS**: Apuntar dominio al VPS
2. ✅ **Abrir puertos**: 80 y 443 en firewall
3. ✅ **SSL válido**: Usar Let's Encrypt para producción
4. ✅ **Rate limiting**: Ya configurado en nginx

### Compartir la aplicación:
```
🌐 URL pública: https://tu-dominio.com
📱 Para móviles: https://tu-dominio.com
🔧 API endpoint: https://tu-dominio.com/api
```

---

**🎯 ¡Tu aplicación estará disponible globalmente en minutos!**

**⚠️ Importante**: Cambia las claves secretas en `.env` antes de producción.
