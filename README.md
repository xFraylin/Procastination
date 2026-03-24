# 🚀 EJECUTA - Sistema de Disciplina

Una aplicación Next.js para gestionar tareas, mejorar productividad y mantener el enfoque.

## ✨ Características

### 📱 **Móvil Optimizado**
- Navegación inferior fija para móvil
- Touch targets optimizados (48px mínimo)
- Animaciones suaves y micro-interacciones
- Diseño compacto y responsive
- Soporte completo para gestos táctiles

### 💻 **Desktop Funcional**
- Sidebar tradicional para escritorio
- Panel derecho con estadísticas y motivación
- Atajos de teclado configurables
- Modos de enfoque y productividad

### 🔐 **Seguridad**
- Autenticación con JWT
- Modos de bloqueo y fuerza
- Rate limiting en APIs
- Validación de inputs

### 📊 **Estadísticas**
- Gráficos de progreso diario
- Seguimiento de rachas de productividad
- Análisis de tiempo invertido
- Tasa de completion

### ⏰ **Gestión del Tiempo**
- Temporizador Pomodoro integrado
- Modo focus anti-distracciones
- Notificaciones de procrastinación
- Registro de tiempo por tarea

## 🛠️ **Tecnologías**

- **Frontend:** Next.js 13 con App Router
- **Estilos:** Tailwind CSS + Radix UI
- **Estado:** Zustand para gestión global
- **Base de datos:** SQLite con persistencia
- **Autenticación:** JWT + bcrypt
- **Despliegue:** Docker + Nginx para producción

## 🚀 **Inicio Rápido**

### **Requisitos**
- Node.js 18+
- npm o pnpm
- Windows, macOS o Linux

### **Instalación**
```bash
# Clonar el repositorio
git clone https://github.com/xFraylin/Procastination.git

# Instalar dependencias
cd Procastination
pnpm install

# Iniciar desarrollo
pnpm dev

# O para producción con acceso de red
pnpm run start:prod
```

### **Configuración**
```bash
# Configurar variables de entorno
cp .env.production .env

# Configurar base de datos (opcional)
# La aplicación usa SQLite en memoria por defecto
```

## 🌐 **Despliegue**

### **Desarrollo**
```bash
pnpm dev          # Desarrollo local
pnpm dev:network   # Desarrollo con acceso de red
```

### **Producción**
```bash
pnpm run start:prod    # Construye y ejecuta en producción
```

### **Docker (Opcional)**
```bash
docker-compose up -d    # Iniciar con Docker
```

## 📱 **Acceso a la Aplicación**

### **Desarrollo**
- **Local:** `http://localhost:3000`
- **Red:** `http://[tu-ip]:3000`

### **Producción**
- **HTTPS:** `https://[tu-dominio]:3000`
- **HTTP:** `http://[tu-ip]:3000`

## 🔧 **Configuración Avanzada**

### **Variables de Entorno**
```env
NODE_ENV=production
JWT_SECRET=tu-clave-secreta-aqui
DATABASE_URL=sqlite:./data/app.db
ALLOWED_ORIGINS=https://tu-dominio.com
```

### **Personalización**
- Editar `lib/db.ts` para base de datos real
- Modificar `next.config.js` para dominio personalizado
- Ajustar estilos en `app/globals.css`

## 🎯 **Flujo de Trabajo**

1. **Planificación** - Crear y organizar tareas
2. **Ejecución** - Modo focus para completar tareas
3. **Análisis** - Revisar estadísticas y progreso
4. **Mejora** - Ajustar configuración y hábitos

## 📚 **Documentación**

- **API:** `/api/docs` - Documentación de endpoints
- **Componentes:** `/components` - Librería UI reutilizable
- **Utils:** `/lib` - Funciones auxiliares
- **Estilos:** `/app/globals.css` - Estilos globales

## 🤝 **Contribuir**

1. Fork del repositorio
2. Crear feature branch
3. Hacer cambios con commits descriptivos
4. Abrir Pull Request

---

## 📄 **Licencia**

MIT License - Libre para uso personal y comercial

---

**🚀 ¡Transforma tu productividad con EJECUTA!**

*Desarrollado con ❤️ por [xFraylin](https://github.com/xFraylin)*
