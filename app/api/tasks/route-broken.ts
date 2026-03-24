import { NextRequest, NextResponse } from 'next/server';
import db, { Task } from '@/lib/db';

// Get tasks for a specific date
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  try {
    const tasks = db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY created_at ASC').all(date) as Task[];
    return NextResponse.json(tasks);
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
    
    // Check if user already has 5 tasks for this date
    const existingTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE date = ?').get(date) as { count: number };
    if (existingTasks.count >= 5) {
      return NextResponse.json({ error: 'Maximum 5 tasks per day allowed' }, { status: 400 });
    }
    
    const result = db.prepare(`
      INSERT INTO tasks (title, category, difficulty, estimated_duration, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, category, difficulty, estimated_duration, date);
    
    const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// Update task (complete/update time)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, completed, time_spent } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
    }
    
    if (completed !== undefined) {
      db.prepare(`
        UPDATE tasks 
        SET completed = ?, completed_at = ?
        WHERE id = ?
      `).run(completed ? 1 : 0, completed ? new Date().toISOString() : null, id);
    }
    
    if (time_spent !== undefined) {
      db.prepare('UPDATE tasks SET time_spent = ? WHERE id = ?').run(time_spent, id);
    }
    
    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }
  
  try {
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
