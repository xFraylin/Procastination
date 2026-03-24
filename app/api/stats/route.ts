import { NextRequest, NextResponse } from 'next/server';
import db, { Task, DailyLog } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'week'; // week or month
  
  try {
    const today = new Date();
    let startDate: Date;
    
    if (period === 'week') {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 30);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    
    // Get all tasks in the period
    const tasks = db.prepare(`
      SELECT * FROM tasks 
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `).all(startDateStr, endDateStr) as Task[];
    
    // Get daily logs
    const logs = db.prepare(`
      SELECT * FROM daily_logs 
      WHERE date >= ? AND date <= ?
      ORDER BY date ASC
    `).all(startDateStr, endDateStr) as DailyLog[];
    
    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed === 1).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalTimeSpent = tasks.reduce((acc, t) => acc + t.time_spent, 0);
    
    // Group by date for chart data
    const dateMap = new Map<string, { completed: number; total: number; timeSpent: number }>();
    
    tasks.forEach(task => {
      const existing = dateMap.get(task.date) || { completed: 0, total: 0, timeSpent: 0 };
      dateMap.set(task.date, {
        completed: existing.completed + (task.completed ? 1 : 0),
        total: existing.total + 1,
        timeSpent: existing.timeSpent + task.time_spent
      });
    });
    
    const chartData = Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      completed: data.completed,
      total: data.total,
      timeSpent: Math.round(data.timeSpent / 60), // Convert to minutes
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
    }));
    
    // Category breakdown
    const categoryStats: Record<string, { completed: number; total: number }> = {
      SOC: { completed: 0, total: 0 },
      Content: { completed: 0, total: 0 },
      Personal: { completed: 0, total: 0 },
      Study: { completed: 0, total: 0 }
    };
    
    tasks.forEach(task => {
      categoryStats[task.category].total++;
      if (task.completed) categoryStats[task.category].completed++;
    });
    
    // Get discipline score from latest log
    const latestLog = logs[logs.length - 1];
    const disciplineScore = latestLog?.discipline_score || 50;
    
    return NextResponse.json({
      totalTasks,
      completedTasks,
      completionRate,
      totalTimeSpent,
      chartData,
      categoryStats,
      disciplineScore,
      period
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
