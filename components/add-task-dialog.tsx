'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddTaskDialogProps {
  onAdd: (task: {
    title: string;
    category: 'SOC' | 'Content' | 'Personal' | 'Study';
    difficulty: number;
    estimated_duration: number;
    date: string;
  }) => void;
  disabled?: boolean;
  tasksCount: number;
}

export function AddTaskDialog({ onAdd, disabled, tasksCount }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'SOC' | 'Content' | 'Personal' | 'Study'>('Personal');
  const [difficulty, setDifficulty] = useState(3);
  const [duration, setDuration] = useState(30);
  
  const handleSubmit = () => {
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      category,
      difficulty,
      estimated_duration: duration,
      date: new Date().toISOString().split('T')[0],
    });
    
    setTitle('');
    setCategory('Personal');
    setDifficulty(3);
    setDuration(30);
    setOpen(false);
  };
  
  const isMaxTasks = tasksCount >= 5;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 text-xs tracking-wider"
          disabled={disabled || isMaxTasks}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isMaxTasks ? 'MAXIMO DE TAREAS' : 'AGREGAR TAREA'}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold tracking-wider">
            AGREGAR TAREA CRITICA
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Completa todos los campos para agregar una nueva tarea a tu lista de ejecución.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
              TITULO DE LA TAREA
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Que debe hacerse?"
              className="bg-input border-border text-sm"
            />
          </div>
          
          <div>
            <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
              CATEGORIA
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
              <SelectTrigger className="bg-input border-border text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="SOC">SOC</SelectItem>
                <SelectItem value="Content">Contenido</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Study">Estudio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
              DIFICULTAD (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    'w-10 h-10 border text-sm font-bold transition-all',
                    difficulty === level
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-input border-border text-muted-foreground hover:border-foreground'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
              DURACION ESTIMADA (MINUTOS)
            </label>
            <div className="flex gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={cn(
                    'px-3 h-10 border text-xs font-medium transition-all',
                    duration === mins
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-input border-border text-muted-foreground hover:border-foreground'
                  )}
                >
                  {mins}
                </button>
              ))}
            </div>
          </div>
          
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="w-full h-10 text-xs tracking-wider font-bold"
          >
            AGREGAR A LISTA DE EJECUCION
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
