# Script para sincronizar cambios al VPS (PowerShell)
# Uso: .\sync-to-vps.ps1

$VPS_USER = "root"
$VPS_IP = "74.208.222.26"
$VPS_PATH = "/home/fray404/disciplina/Procastination"
$LOCAL_PATH = "./"

Write-Host "🔄 Sincronizando cambios al VPS..." -ForegroundColor Green

# Subir archivos actualizados
Write-Host "📤 Subiendo archivos de base de datos..." -ForegroundColor Blue
scp -r "$($LOCAL_PATH)lib/db-sync.ts" "$($VPS_USER)@$($VPS_IP):$($VPS_PATH)/lib/"
scp -r "$($LOCAL_PATH)lib/db.ts" "$($VPS_USER)@$($VPS_IP):$($VPS_PATH)/lib/"
scp -r "$($LOCAL_PATH)package.json" "$($VPS_USER)@$($VPS_IP):$($VPS_PATH)/"
scp -r "$($LOCAL_PATH)README.md" "$($VPS_USER)@$($VPS_IP):$($VPS_PATH)/"

# Instalar dependencias en el VPS
Write-Host "📦 Instalando dependencias en el VPS..." -ForegroundColor Blue
ssh "$($VPS_USER)@$($VPS_IP)" "cd $($VPS_PATH) && pnpm install"

# Reiniciar el servidor
Write-Host "🔄 Reiniciando el servidor..." -ForegroundColor Blue
ssh "$($VPS_USER)@$($VPS_IP)" "cd $($VPS_PATH) && pm2 restart disciplina || pm2 start npm --name disciplina -- start"

Write-Host "✅ Sincronización completada!" -ForegroundColor Green
Write-Host "🌐 Tu app está disponible en: http://74.208.222.26:3000" -ForegroundColor Yellow
