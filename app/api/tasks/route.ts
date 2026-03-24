import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// Get tasks for a specific date
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const userId = 1; // TODO: Get from JWT token
  
  try {
    const tasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId);
    const filteredTasks = tasks.filter((task: any) => task.date === date);
    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, category, difficulty, estimated_duration, date } = body;
    
    if (!title || !category || !difficulty || !estimated_duration || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const userId = 1; // TODO: Get from JWT token
    
    // Check if user already has 5 tasks for this date
    const existingTasks = db.prepare('SELECT * FROM tasks WHERE user_id = ?').all(userId);
    const tasksForDate = existingTasks.filter((task: any) => task.date === date);
    
    if (tasksForDate.length >= 5) {
      return NextResponse.json({ error: 'Maximum 5 tasks per day allowed' }, { status: 400 });
    }
    
    const task = db.prepare(`
      INSERT INTO tasks (user_id, title, category, difficulty, estimated_duration, date, completed, completed_at, time_spent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, title, category, difficulty, estimated_duration, date, 0, null, 0, new Date().toISOString());
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
