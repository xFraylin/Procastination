'use client';

import { useAppStore, View } from '@/lib/store';
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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
              "min-h-[48px] min-w-[48px]",
              currentView === item.id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <div className="transition-transform duration-200 active:scale-95">
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
