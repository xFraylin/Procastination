# Script para desplegar desde GitHub al VPS (PowerShell)
# Uso: .\deploy-from-github.ps1

$VPS_USER = "root"
$VPS_IP = "74.208.222.26"
$VPS_PATH = "/home/fray404/disciplina/Procastination"
$REPO_URL = "https://github.com/xFraylin/Procastination.git"

Write-Host "🚀 Desplegando desde GitHub al VPS..." -ForegroundColor Green

# Conectar al VPS y actualizar desde GitHub
$script = @"
echo "📁 Navegando al directorio del proyecto..."
cd /home/fray404/disciplina/Procastination

echo "🔄 Actualizando desde GitHub..."
git pull origin master

echo "📦 Instalando dependencias..."
pnpm install

echo "🔨 Construyendo aplicación..."
pnpm run build

echo "🔄 Reiniciando servidor..."
pm2 restart disciplina || pm2 start npm --name disciplina -- start

echo "✅ Despliegue completado!"
echo "🌐 Aplicación disponible en: http://74.208.222.26:3000"
echo "📊 Verificar logs con: pm2 logs disciplina"
"@

ssh "$($VPS_USER)@$($VPS_IP)" $script

Write-Host "🎉 Despliegue desde GitHub completado!" -ForegroundColor Green
