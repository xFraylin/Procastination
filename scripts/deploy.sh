#!/bin/bash

# Script de despliegue para VPS
# Uso: ./scripts/deploy.sh [usuario] [host] [dominio]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar argumentos
if [ $# -lt 3 ]; then
    log_error "Uso: $0 <usuario> <host> <dominio>"
    log_error "Ejemplo: $0 root 192.168.1.100 midominio.com"
    exit 1
fi

USER=$1
HOST=$2
DOMAIN=$3

log_info "Iniciando despliegue a VPS..."
log_info "Usuario: $USER"
log_info "Host: $HOST"
log_info "Dominio: $DOMAIN"

# Verificar archivos necesarios
if [ ! -f "package.json" ]; then
    log_error "package.json no encontrado"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    log_error "Dockerfile no encontrado"
    exit 1
fi

# Crear directorios necesarios
log_info "Creando directorios en el servidor..."
ssh $USER@$HOST "mkdir -p ~/app/{data,uploads,ssl}"

# Copiar archivos al servidor
log_info "Copiando archivos al servidor..."
scp -r . $USER@$HOST:~/app/

# Configurar variables de entorno
log_info "Configurando variables de entorno..."
ssh $USER@$HOST "cd ~/app && cp .env.production .env"

# Actualizar dominio en nginx.conf
log_info "Configurando dominio en nginx..."
ssh $USER@$HOST "cd ~/app && sed -i 's/your-domain.com/$DOMAIN/g' nginx.conf"

# Generar certificado SSL auto-firmado (para desarrollo)
log_warning "Generando certificado SSL auto-firmado..."
ssh $USER@$HOST "cd ~/app && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj '/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN'"

# Construir y levantar contenedores
log_info "Construyendo y levantando contenedores Docker..."
ssh $USER@$HOST "cd ~/app && docker-compose down && docker-compose build && docker-compose up -d"

# Esperar a que la aplicación esté lista
log_info "Esperando a que la aplicación esté lista..."
sleep 30

# Verificar que la aplicación esté funcionando
log_info "Verificando el despliegue..."
if curl -k -f https://$DOMAIN/api/health > /dev/null 2>&1; then
    log_success "¡Despliegue completado con éxito!"
    echo ""
    echo "🌐 URLs de acceso:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔒 HTTPS: https://$DOMAIN"
    echo "📱 Móvil: https://$DOMAIN"
    echo "🔧 API: https://$DOMAIN/api"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  Nota: El certificado SSL es auto-firmado."
    echo "   Tu navegador mostrará una advertencia de seguridad."
    echo "   Para producción, usa certificados Let's Encrypt."
else
    log_error "La aplicación no está respondiendo. Verifica los logs:"
    ssh $USER@$HOST "cd ~/app && docker-compose logs app"
    exit 1
fi

log_info "Para ver los logs en tiempo real:"
echo "ssh $USER@$HOST 'cd ~/app && docker-compose logs -f'"
echo ""
log_info "Para actualizar la aplicación:"
echo "ssh $USER@$HOST 'cd ~/app && git pull && docker-compose build && docker-compose up -d'"
