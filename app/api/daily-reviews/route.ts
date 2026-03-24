import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { DailyLog } from '@/lib/db';

// GET - Obtener revisiones diarias de un usuario
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    console.log('🔍 Daily Reviews API - userId:', userId, 'date:', date);

    // Obtener TODAS las tareas del usuario (exactamente como /api/tasks)
    const allTasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(parseInt(userId)) as any[];
    
    console.log('📊 Todas las tareas del usuario:', allTasks.length);
    console.log('📅 Fecha que se busca:', date);
    console.log('📋 Fechas de las tareas:', allTasks.map(t => ({id: t.id, title: t.title, date: t.date})));

    // Filtrar por fecha en JavaScript (exactamente como /api/tasks)
    const tasks = allTasks.filter((task: any) => task.date === date);
    
    console.log('📊 Tareas filtradas por fecha:', tasks.length, 'tareas');

    // Obtener daily log si existe
    let dailyLog: any = null;
    const logQuery = `SELECT * FROM daily_logs WHERE user_id = ? AND date = ?`;
    const logResult = db.prepare(logQuery).get(parseInt(userId), date) as any;
    
    if (logResult) {
      dailyLog = {
        ...logResult,
        completed_task_ids: logResult.completed_task_ids ? JSON.parse(logResult.completed_task_ids) : [],
        failed_task_ids: logResult.failed_task_ids ? JSON.parse(logResult.failed_task_ids) : []
      };
    }

    // Calcular estadísticas
    const completedTasks = tasks.filter((t: any) => t.completed === 1);
    const failedTasks = tasks.filter((t: any) => t.completed === 0);
    const totalTimeSpent = tasks.reduce((acc: number, t: any) => acc + t.time_spent, 0);

    const reviewData = {
      date: date,
      total_tasks: tasks.length,
      completed_tasks: completedTasks.length,
      failed_tasks: failedTasks.length,
      total_time_spent: totalTimeSpent,
      tasks: tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        difficulty: t.difficulty,
        estimated_duration: t.estimated_duration,
        completed: t.completed === 1,
        time_spent: t.time_spent,
        completed_at: t.completed_at
      })),
      daily_log: dailyLog
    };

    console.log('✅ ReviewData preparado:', {
      total_tasks: reviewData.total_tasks,
      tasks_count: reviewData.tasks.length,
      first_task: reviewData.tasks[0]?.title
    });

    return NextResponse.json({ 
      success: true, 
      data: reviewData
    });

  } catch (error) {
    console.error('❌ Error obteniendo revisiones diarias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// POST - Crear o actualizar una revisión diaria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      date,
      completedTaskIds,
      failedTaskIds,
      whatCompleted,
      whatFailed,
      whyFailed,
      disciplineScore
    } = body;

    if (!userId || !date) {
      return NextResponse.json({ error: 'userId y date son requeridos' }, { status: 400 });
    }

    // Verificar si ya existe un daily log
    const existingLog = db.prepare(`
      SELECT id FROM daily_logs WHERE user_id = ? AND date = ?
    `).get(parseInt(userId), date) as any;

    let log;
    
    if (existingLog) {
      // Actualizar log existente
      log = db.prepare(`
        UPDATE daily_logs SET
          tasks_completed = ?,
          tasks_failed = ?,
          what_completed = ?,
          what_failed = ?,
          why_failed = ?,
          discipline_score = ?,
          completed_task_ids = ?,
          failed_task_ids = ?
        WHERE user_id = ? AND date = ?
      `).run(
        completedTaskIds?.length || 0,
        failedTaskIds?.length || 0,
        whatCompleted, whatFailed, whyFailed, disciplineScore,
        JSON.stringify(completedTaskIds || []),
        JSON.stringify(failedTaskIds || []),
        parseInt(userId), date
      );
    } else {
      // Crear nuevo log
      log = db.prepare(`
        INSERT INTO daily_logs (
          user_id, date, tasks_completed, tasks_failed,
          what_completed, what_failed, why_failed, discipline_score,
          completed_task_ids, failed_task_ids
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        parseInt(userId), date, 
        completedTaskIds?.length || 0,
        failedTaskIds?.length || 0,
        whatCompleted, whatFailed, whyFailed, disciplineScore,
        JSON.stringify(completedTaskIds || []),
        JSON.stringify(failedTaskIds || [])
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: existingLog?.id || log.lastInsertRowid,
        message: existingLog ? 'Revisión actualizada' : 'Revisión creada'
      }
    });

  } catch (error) {
    console.error('Error guardando revisión diaria:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// DELETE - Eliminar una revisión diaria
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId || !date) {
      return NextResponse.json({ error: 'userId y date son requeridos' }, { status: 400 });
    }

    const result = db.prepare(`
      DELETE FROM daily_logs WHERE user_id = ? AND date = ?
    `).run(parseInt(userId), date);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Revisión no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Revisión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error eliminando revisión diaria:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
