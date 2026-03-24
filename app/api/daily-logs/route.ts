import { NextRequest, NextResponse } from 'next/server';
import db, { DailyLog, Task } from '@/lib/db';

// Get daily log for a specific date
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  try {
    const log = db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(date) as DailyLog | undefined;
    return NextResponse.json(log || null);
  } catch (error) {
    console.error('Error fetching daily log:', error);
    return NextResponse.json({ error: 'Failed to fetch daily log' }, { status: 500 });
  }
}

// Create or update daily log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, what_completed, what_failed, why_failed, notes } = body;
    
    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }
    
    // Get task stats for the day
    const tasks = db.prepare('SELECT * FROM tasks WHERE date = ?').all(date) as Task[];
    const tasksCompleted = tasks.filter(t => t.completed === 1).length;
    const tasksFailed = tasks.filter(t => t.completed === 0).length;
    const totalTimeSpent = tasks.reduce((acc, t) => acc + t.time_spent, 0);
    
    // Calculate discipline score
    // Base: 50, +10 for each completed task, -15 for each failed task
    const previousLog = db.prepare(`
      SELECT discipline_score FROM daily_logs 
      WHERE date < ? 
      ORDER BY date DESC 
      LIMIT 1
    `).get(date) as { discipline_score: number } | undefined;
    
    const baseScore = previousLog?.discipline_score || 50;
    const scoreChange = (tasksCompleted * 10) - (tasksFailed * 15);
    const newScore = Math.max(0, Math.min(100, baseScore + scoreChange));
    
    // Upsert daily log
    db.prepare(`
      INSERT INTO daily_logs (date, tasks_completed, tasks_failed, total_time_spent, what_completed, what_failed, why_failed, notes, discipline_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET 
        tasks_completed = ?,
        tasks_failed = ?,
        total_time_spent = ?,
        what_completed = ?,
        what_failed = ?,
        why_failed = ?,
        notes = ?,
        discipline_score = ?
    `).run(
      date, tasksCompleted, tasksFailed, totalTimeSpent, what_completed, what_failed, why_failed, notes, newScore,
      tasksCompleted, tasksFailed, totalTimeSpent, what_completed, what_failed, why_failed, notes, newScore
    );
    
    const updatedLog = db.prepare('SELECT * FROM daily_logs WHERE date = ?').get(date) as DailyLog;
    return NextResponse.json(updatedLog);
  } catch (error) {
    console.error('Error saving daily log:', error);
    return NextResponse.json({ error: 'Failed to save daily log' }, { status: 500 });
  }
}
