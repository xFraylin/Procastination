'use client';

import { useState } from 'react';
import { useAppStore, ContentIdea } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import { Plus, Video, FileText, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  idea: { label: 'IDEA', icon: FileText, color: 'text-muted-foreground' },
  scripted: { label: 'GUIONIZADO', icon: FileText, color: 'text-chart-4' },
  recorded: { label: 'GRABADO', icon: Video, color: 'text-chart-1' },
  published: { label: 'PUBLICADO', icon: Check, color: 'text-success' },
};

export function ContentView() {
  const { contentIdeas, addContentIdea, updateContentIdea, deleteContentIdea } = useAppStore();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', script: '', status: 'idea' as const });
  
  const handleAddIdea = () => {
    if (!newIdea.title.trim()) return;
    
    addContentIdea({
      title: newIdea.title,
      description: newIdea.description || null,
      script: newIdea.script || null,
      status: newIdea.status,
    });
    
    setNewIdea({ title: '', description: '', script: '', status: 'idea' });
    setAddDialogOpen(false);
  };
  
  const handleUpdateStatus = (idea: ContentIdea, status: ContentIdea['status']) => {
    updateContentIdea(idea.id, { status });
  };
  
  const handleDeleteIdea = (id: number) => {
    deleteContentIdea(id);
  };
  
  const groupedIdeas = {
    idea: contentIdeas.filter(i => i.status === 'idea'),
    scripted: contentIdeas.filter(i => i.status === 'scripted'),
    recorded: contentIdeas.filter(i => i.status === 'recorded'),
    published: contentIdeas.filter(i => i.status === 'published'),
  };
  
  return (
    <div className="p-8 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CREADOR DE CONTENIDO</h1>
          <p className="text-sm text-muted-foreground mt-1">
            RASTREA IDEAS DE VIDEOS, GUIONES Y PROGRESO
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 text-xs tracking-wider">
              <Plus className="h-4 w-4 mr-2" />
              NUEVA IDEA
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold tracking-wider">
                AGREGAR IDEA DE CONTENIDO
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
                  TITULO
                </label>
                <Input
                  value={newIdea.title}
                  onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                  placeholder="Titulo del video o concepto"
                  className="bg-input border-border"
                />
              </div>
              
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
                  DESCRIPCION
                </label>
                <Textarea
                  value={newIdea.description}
                  onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                  placeholder="Breve descripcion del contenido"
                  className="bg-input border-border min-h-20"
                />
              </div>
              
              <div>
                <label className="text-[10px] text-muted-foreground tracking-wider block mb-2">
                  GUION (OPCIONAL)
                </label>
                <Textarea
                  value={newIdea.script}
                  onChange={(e) => setNewIdea({ ...newIdea, script: e.target.value })}
                  placeholder="Escribe tu guion aqui..."
                  className="bg-input border-border min-h-32"
                />
              </div>
              
              <Button
                onClick={handleAddIdea}
                disabled={!newIdea.title.trim()}
                className="w-full h-10 text-xs tracking-wider font-bold"
              >
                AGREGAR IDEA
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Resumen de Estados */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(groupedIdeas).map(([status, ideas]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          const Icon = config.icon;
          return (
            <Card key={status} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-4 w-4', config.color)} />
                  <span className="text-[10px] tracking-wider text-muted-foreground">
                    {config.label}
                  </span>
                </div>
                <p className="text-2xl font-bold">{ideas.length}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Kanban de Contenido */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(groupedIdeas).map(([status, ideas]) => {
          const config = statusConfig[status as keyof typeof statusConfig];
          return (
            <div key={status} className="space-y-2">
              <h3 className={cn('text-xs font-bold tracking-wider mb-3', config.color)}>
                {config.label} ({ideas.length})
              </h3>
              
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <Card key={idea.id} className="bg-card border-border">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-2">{idea.title}</h4>
                      
                      {idea.description && (
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {idea.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Select
                          value={idea.status}
                          onValueChange={(v) => handleUpdateStatus(idea, v as ContentIdea['status'])}
                        >
                          <SelectTrigger className="h-8 text-[10px] bg-input border-border flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="idea">Idea</SelectItem>
                            <SelectItem value="scripted">Guionizado</SelectItem>
                            <SelectItem value="recorded">Grabado</SelectItem>
                            <SelectItem value="published">Publicado</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteIdea(idea.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {ideas.length === 0 && (
                  <div className="border border-dashed border-border p-4 text-center">
                    <p className="text-xs text-muted-foreground">Sin elementos</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
