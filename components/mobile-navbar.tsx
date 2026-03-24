'use client';

import { useState } from 'react';
import { useAppStore, View } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  ListTodo,
  Target,
  BarChart3,
  Video,
  ClipboardCheck,
  Lock,
  Zap,
  Menu,
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

interface MobileNavbarProps {
  onLogout: () => void;
}

export function MobileNavbar({ onLogout }: MobileNavbarProps) {
  const { 
    currentView, 
    setCurrentView, 
    isLockdownMode, 
    isForceMode,
    tasks,
    isFocusMode
  } = useAppStore();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.completed === 1);
  const isNavigationLocked = (isLockdownMode || isForceMode) && !allTasksCompleted;
  
  const handleNavigation = (view: View) => {
    if (isFocusMode && view !== 'focus') {
      return;
    }
    
    if (isNavigationLocked && view !== 'tasks' && view !== 'focus') {
      return;
    }
    
    setCurrentView(view);
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };
  
  const NavContent = () => (
    <div className="flex flex-col h-full">
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
        {/* User info removed - no longer needed */}
      </div>
      
      {(isLockdownMode || isForceMode) && !allTasksCompleted && (
        <div className="px-4 py-3 bg-destructive/10 border-b border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold tracking-wider">
              {isForceMode ? 'MODO FORZADO ACTIVO' : 'BLOQUEO ACTIVO'}
            </span>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">
            Completa todas las tareas para desbloquear
          </p>
        </div>
      )}
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isLocked = isNavigationLocked && item.id !== 'tasks' && item.id !== 'focus';
            const isDisabled = (isFocusMode && item.id !== 'focus') || isLocked;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  disabled={isDisabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 text-xs font-medium tracking-wider transition-all min-h-[44px]',
                    currentView === item.id
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    isDisabled && 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isLocked && <Lock className="h-3 w-3 ml-auto" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full h-11 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
        <p className="text-[10px] text-muted-foreground tracking-wider text-center">
          DISCIPLINA {'>'} MOTIVACION
        </p>
      </div>
    </div>
  );

  return (
    <div className="md:hidden">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-foreground flex items-center justify-center">
              <Zap className="h-4 w-4 text-background" />
            </div>
            <span className="text-sm font-bold tracking-wider text-foreground">EJECUTA</span>
          </div>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
