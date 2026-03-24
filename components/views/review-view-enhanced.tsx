'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, TrendingUp, Calendar, Save } from 'lucide-react';

interface DailyReviewData {
  date: string;
  total_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  total_time_spent: number;
  tasks: Array<{
    id: number;
    title: string;
    category: string;
    difficulty: number;
    estimated_duration: number;
    completed: boolean;
    time_spent: number;
    completed_at: string | null;
  }>;
  daily_log: {
    id: number;
    what_completed: string | null;
    what_failed: string | null;
    why_failed: string | null;
    discipline_score: number;
  } | null;
}

export function ReviewViewEnhanced() {
  const { currentUserId } = useAppStore();
  const [reviewData, setReviewData] = useState<DailyReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
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
      const response = await fetch(`/api/daily-reviews?userId=${currentUserId}&date=${today}`);
      const result = await response.json();
      
      if (result.success) {
        setReviewData(result.data);
        
        // Cargar datos existentes si hay
        if (result.data.daily_log) {
          setWhatCompleted(result.data.daily_log.what_completed || '');
          setWhatFailed(result.data.daily_log.what_failed || '');
          setWhyFailed(result.data.daily_log.why_failed || '');
        }
      }
    } catch (error) {
      console.error('Error cargando datos de revisión:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDisciplineScore = () => {
    if (!reviewData) return 0;
    
    const completionRate = reviewData.total_tasks > 0 
      ? (reviewData.completed_tasks / reviewData.total_tasks) * 100 
      : 0;
    
    // Base score por completion rate
    let score = Math.round(completionRate * 0.5);
    
    // Bonus por tiempo dedicado
    if (reviewData.total_time_spent > 0) {
      score += Math.min(20, Math.round(reviewData.total_time_spent / 30)); // 20 puntos max por tiempo
    }
    
    // Bonus por completar tareas
    score += reviewData.completed_tasks * 5;
    
    // Penalización por tareas fallidas
    score -= reviewData.failed_tasks * 3;
    
    return Math.max(0, Math.min(100, score));
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
          totalTasks: reviewData.total_tasks,
          completedTasks: reviewData.completed_tasks,
          failedTasks: reviewData.failed_tasks,
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

  const completedTasks = reviewData.tasks.filter(t => t.completed);
  const failedTasks = reviewData.tasks.filter(t => !t.completed);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">REVISIÓN DIARIA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análisis de tu productividad del día
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
                <p className="text-2xl font-bold">{reviewData.completed_tasks}</p>
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
                <p className="text-2xl font-bold">{reviewData.failed_tasks}</p>
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

      {/* Tareas Completadas */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Tareas Completadas ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {task.time_spent}min
                      </span>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tareas Fallidas */}
      {failedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Tareas No Completadas ({failedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {failedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Dificultad: {task.difficulty}/5
                      </span>
                    </div>
                  </div>
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
