'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, XCircle, Clock, TrendingUp, Calendar, Save, ListTodo } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  category: 'SOC' | 'Content' | 'Personal' | 'Study';
  difficulty: number;
  estimated_duration: number;
  completed: boolean;
  time_spent: number;
  completed_at: string | null;
}

interface DailyReviewData {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  total_time_spent: number;
  tasks: Task[];
  daily_log: {
    id: number;
    what_completed: string | null;
    what_failed: string | null;
    why_failed: string | null;
    discipline_score: number;
    completed_task_ids: number[];
    failed_task_ids: number[];
  } | null;
}

export function ReviewViewInteractive() {
  const { currentUserId } = useAppStore();
  const [reviewData, setReviewData] = useState<DailyReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Selección de tareas
  const [selectedCompletedIds, setSelectedCompletedIds] = useState<number[]>([]);
  const [selectedFailedIds, setSelectedFailedIds] = useState<number[]>([]);
  
  // Form state
  const [whatCompleted, setWhatCompleted] = useState('');
  const [whatFailed, setWhatFailed] = useState('');
  const [whyFailed, setWhyFailed] = useState('');
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadReviewData();
  }, []);

  const loadReviewData = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      console.log('🔍 Cargando datos de revisión para userId:', currentUserId, 'date:', today);
      
      const response = await fetch(`/api/daily-reviews?userId=${currentUserId}&date=${today}`);
      const result = await response.json();
      
      console.log('📊 Respuesta del API:', result);
      
      if (result.success) {
        console.log('✅ Datos cargados:', result.data);
        setReviewData(result.data);
        
        // Cargar datos existentes si hay
        if (result.data.daily_log) {
          setWhatCompleted(result.data.daily_log.what_completed || '');
          setWhatFailed(result.data.daily_log.what_failed || '');
          setWhyFailed(result.data.daily_log.why_failed || '');
          
          // Cargar selecciones de tareas existentes
          setSelectedCompletedIds(result.data.daily_log.completed_task_ids || []);
          setSelectedFailedIds(result.data.daily_log.failed_task_ids || []);
        } else {
          // Auto-seleccionar basado en estado actual de tareas
          const completedIds = result.data.tasks
            .filter((t: Task) => t.completed)
            .map((t: Task) => t.id);
          const failedIds = result.data.tasks
            .filter((t: Task) => !t.completed)
            .map((t: Task) => t.id);
          
          setSelectedCompletedIds(completedIds);
          setSelectedFailedIds(failedIds);
        }
      } else {
        console.error('❌ Error en respuesta del API:', result);
      }
    } catch (error) {
      console.error('❌ Error cargando datos de revisión:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDisciplineScore = () => {
    if (!reviewData) return 0;
    
    const completionRate = selectedCompletedIds.length > 0 
      ? (selectedCompletedIds.length / reviewData.total_tasks) * 100 
      : 0;
    
    // Base score por completion rate
    let score = Math.round(completionRate * 0.5);
    
    // Bonus por tiempo dedicado
    if (reviewData.total_time_spent > 0) {
      score += Math.min(20, Math.round(reviewData.total_time_spent / 30));
    }
    
    // Bonus por completar tareas
    score += selectedCompletedIds.length * 5;
    
    // Penalización por tareas fallidas
    score -= selectedFailedIds.length * 3;
    
    return Math.max(0, Math.min(100, score));
  };

  const handleTaskToggle = (taskId: number, isCompleted: boolean) => {
    if (isCompleted) {
      setSelectedCompletedIds(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      );
    } else {
      setSelectedFailedIds(prev => 
        prev.includes(taskId) 
          ? prev.filter(id => id !== taskId)
          : [...prev, taskId]
      );
    }
  };

  const handleSave = async () => {
    if (!currentUserId || !reviewData) return;
    
    try {
      setSaving(true);
      
      const disciplineScore = calculateDisciplineScore();
      
      const response = await fetch('/api/daily-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUserId,
          date: today,
          completedTaskIds: selectedCompletedIds,
          failedTaskIds: selectedFailedIds,
          whatCompleted: whatCompleted.trim(),
          whatFailed: whatFailed.trim(),
          whyFailed: whyFailed.trim(),
          disciplineScore
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        
        // Recargar datos para actualizar el estado
        await loadReviewData();
      }
    } catch (error) {
      console.error('Error guardando revisión:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No hay datos para revisar</h2>
          <p className="text-muted-foreground">No se encontraron tareas para el día de hoy.</p>
        </div>
      </div>
    );
  }

  const completedTasks = reviewData.tasks.filter(t => selectedCompletedIds.includes(t.id));
  const failedTasks = reviewData.tasks.filter(t => selectedFailedIds.includes(t.id));

  const getCategoryColor = (category: string) => {
    const colors = {
      'SOC': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Content': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Personal': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Study': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">REVISIÓN DIARIA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecciona tus tareas y reflexiona sobre tu día
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date(reviewData.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{selectedCompletedIds.length}</p>
                <p className="text-xs text-muted-foreground">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{selectedFailedIds.length}</p>
                <p className="text-xs text-muted-foreground">Fallidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(reviewData.total_time_spent / 60)}h</p>
                <p className="text-xs text-muted-foreground">Tiempo total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{calculateDisciplineScore()}</p>
                <p className="text-xs text-muted-foreground">Puntuación</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selección de Tareas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Selecciona tus tareas del día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tareas para seleccionar */}
            {reviewData.tasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={task.completed ? selectedCompletedIds.includes(task.id) : selectedFailedIds.includes(task.id)}
                  onCheckedChange={() => handleTaskToggle(task.id, task.completed)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="outline" className={getCategoryColor(task.category)}>
                      {task.category}
                    </Badge>
                    {task.completed && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Completada
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Dificultad: {task.difficulty}/5</span>
                    <span>Duración: {task.estimated_duration}min</span>
                    {task.time_spent > 0 && (
                      <span>Tiempo real: {task.time_spent}min</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de selección */}
      {(completedTasks.length > 0 || failedTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Tareas Completadas ({completedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {completedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                      <span className="text-sm">{task.title}</span>
                      <span className="text-xs text-muted-foreground">{task.time_spent}min</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {failedTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Tareas No Completadas ({failedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {failedTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded">
                      <span className="text-sm">{task.title}</span>
                      <span className="text-xs text-muted-foreground">Dificultad: {task.difficulty}/5</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Formulario de Revisión */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reflexión del Día</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              ¿Qué lograste completar hoy?
            </label>
            <Textarea
              placeholder="Describe tus logros y tareas completadas..."
              value={whatCompleted}
              onChange={(e) => setWhatCompleted(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              ¿Qué no pudiste completar?
            </label>
            <Textarea
              placeholder="Menciona las tareas que quedaron pendientes..."
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              ¿Por qué no pudiste completar esas tareas?
            </label>
            <Textarea
              placeholder="Analiza las razones: falta de tiempo, energía, prioridades, etc..."
              value={whyFailed}
              onChange={(e) => setWhyFailed(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? (
              <>Guardando...</>
            ) : saved ? (
              <>✅ Guardado</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Revisión Diaria
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
