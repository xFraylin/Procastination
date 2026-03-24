#!/bin/bash

# Script para sincronizar cambios al VPS
# Uso: ./sync-to-vps.sh

VPS_USER="root"
VPS_IP="74.208.222.26"
VPS_PATH="/home/fray404/disciplina/Procastination"
LOCAL_PATH="./"

echo "🔄 Sincronizando cambios al VPS..."

# Subir archivos actualizados
scp -r $LOCAL_PATH/lib/db-sync.ts $VPS_USER@$VPS_IP:$VPS_PATH/lib/
scp -r $LOCAL_PATH/lib/db.ts $VPS_USER@$VPS_IP:$VPS_PATH/lib/
scp -r $LOCAL_PATH/package.json $VPS_USER@$VPS_IP:$VPS_PATH/
scp -r $LOCAL_PATH/README.md $VPS_USER@$VPS_IP:$VPS_PATH/

# Instalar dependencias en el VPS
echo "📦 Instalando dependencias en el VPS..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH && pnpm install"

# Reiniciar el servidor
echo "🔄 Reiniciando el servidor..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH && pm2 restart disciplina || pm2 start npm --name disciplina -- start"

echo "✅ Sincronización completada!"
echo "🌐 Tu app está disponible en: http://74.208.222.26:3000"
