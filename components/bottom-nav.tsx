'use client';

import { useAppStore, View } from '@/lib/store';
import { useAbsoluteLock } from '@/hooks/use-absolute-lock';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ListTodo,
  Target,
  BarChart3,
} from 'lucide-react';

const navItems: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Panel', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'tasks', label: 'Tareas', icon: <ListTodo className="h-5 w-5" /> },
  { id: 'focus', label: 'Enfoque', icon: <Target className="h-5 w-5" /> },
  { id: 'stats', label: 'Estadísticas', icon: <BarChart3 className="h-5 w-5" /> },
];

export function BottomNav() {
  const { currentView, setCurrentView } = useAppStore();
  const { canNavigateTo } = useAbsoluteLock();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const canNavigate = canNavigateTo(item.id);
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => canNavigate ? setCurrentView(item.id) : null}
              disabled={!canNavigate}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : canNavigate
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-muted-foreground/50 cursor-not-allowed"
              )}
              title={canNavigate ? item.label : "Bloqueado - Completa tus tareas primero"}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
