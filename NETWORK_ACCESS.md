# 🌐 Acceso a la Aplicación desde Red Externa

## 🚀 Iniciar Servidor con Acceso de Red

### Opción 1: Script Automático (Recomendado)
```bash
npm run dev:network
```

### Opción 2: Manual
```bash
npm run dev
```

## 📱 URLs de Acceso

El servidor mostrará automáticamente todas las URLs disponibles:

```
📱 Accesible desde los siguientes dispositivos:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Wi-Fi: http://192.168.1.100:3000
🌐 Ethernet: http://10.0.0.5:3000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 Local: http://localhost:3000
```

## 🔧 Configuración Técnica

### ¿Qué se configuró?
- ✅ `--hostname 0.0.0.0` para escuchar en todas las interfaces
- ✅ CORS habilitado para APIs
- ✅ Headers de acceso configurados
- ✅ Script de detección automática de IPs

### Archivos modificados:
- `package.json` - Scripts de inicio
- `next.config.js` - Configuración de red
- `scripts/start-network.js` - Detección de IPs

## 📋 Requisitos de Red

### Para que funcione correctamente:
1. **Mismo Wi-Fi**: Todos los dispositivos deben estar en la misma red
2. **Firewall**: Permitir conexiones en el puerto 3000
3. **Antivirus**: No bloquear conexiones locales

### Si no funciona:
```bash
# Verificar firewall (Windows)
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow protocol=TCP localport=3000

# Verificar IPs disponibles
ipconfig
```

## 🌍 Dispositivos Compatibles

### ✅ Funciona desde:
- 📱 **Smartphones** (iOS/Android)
- 💻 **Laptops** (Windows/Mac/Linux)
- 📟 **Tablets** (iPad/Android)
- 🖥️ **Otros PCs** en la misma red

### 📲 Navegadores soportados:
- Chrome (recomendado)
- Safari
- Firefox
- Edge

## 🔒 Seguridad

### ⚠️ Importante:
- Solo usar en **redes locales/confiables**
- No exponer a **internet público**
- Requiere **autenticación** para acceder

### Para producción:
- Usar HTTPS
- Configurar firewall
- Implementar VPN si es necesario

## 🚨 Solución de Problemas

### No puedo acceder desde otro dispositivo:
1. ✅ Verificar que estén en la misma red Wi-Fi
2. ✅ Desactivar VPNs
3. ✅ Revisar configuración de firewall
4. ✅ Probar con `http://` (no `https://`)

### La IP no aparece:
```bash
# Forzar detección de IPs
npm run dev:network
```

### Error de conexión:
1. ✅ Reiniciar el servidor
2. ✅ Verificar el puerto 3000 esté libre
3. ✅ Probar con otra IP de la lista

---

**🎯 Listo! Ahora cualquiera en tu red puede usar la aplicación.**
