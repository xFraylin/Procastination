'use client';

import { useAppStore, View } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ListTodo,
  Target,
  BarChart3,
  Video,
  ClipboardCheck,
  Lock,
  Zap,
  LogOut
} from 'lucide-react';

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'PANEL', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'tasks', label: 'TAREAS DIARIAS', icon: <ListTodo className="h-4 w-4" /> },
  { id: 'focus', label: 'MODO ENFOQUE', icon: <Target className="h-4 w-4" /> },
  { id: 'stats', label: 'ESTADISTICAS', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'content', label: 'CONTENIDO', icon: <Video className="h-4 w-4" /> },
  { id: 'review', label: 'REVISION DIARIA', icon: <ClipboardCheck className="h-4 w-4" /> },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { 
    currentView, 
    setCurrentView, 
    isLockdownMode, 
    isForceMode,
    tasks,
    isFocusMode
  } = useAppStore();
  
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.completed === 1);

  return (
    <div className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-foreground flex items-center justify-center">
            <Zap className="h-5 w-5 text-background" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-foreground">EJECUTA</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest">SISTEMA DE DISCIPLINA</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentView === item.id ? 'default' : 'ghost'}
            className={cn(
              'w-full justify-start gap-2 h-10',
              currentView === item.id && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setCurrentView(item.id)}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Button>
        ))}
      </nav>
      
      {/* Lockdown/Force Mode Warning */}
      {(isLockdownMode || isForceMode) && !allTasksCompleted && (
        <div className="px-4 py-3 mx-4 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold tracking-wider">
              {isForceMode ? 'MODO FORZADO ACTIVO' : 'BLOQUEO ACTIVO'}
            </span>
          </div>
        </div>
      )}
      
      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-10 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
}
