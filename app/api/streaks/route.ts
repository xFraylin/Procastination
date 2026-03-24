import { NextRequest, NextResponse } from 'next/server';
import db, { Streak, Task } from '@/lib/db';

// Get current streak data
export async function GET() {
  try {
    const streak = db.prepare('SELECT * FROM streaks WHERE id = 1').get() as Streak;
    return NextResponse.json(streak);
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
  }
}

// Update streak (call this when completing all daily tasks)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date } = body;
    
    if (!date) {
      return NextResponse.json({ error: 'Date required' }, { status: 400 });
    }
    
    // Check if all tasks for the date are completed
    const tasks = db.prepare('SELECT * FROM tasks WHERE date = ?').all(date) as Task[];
    const allCompleted = tasks.length > 0 && tasks.every(t => t.completed === 1);
    
    const currentStreak = db.prepare('SELECT * FROM streaks WHERE id = 1').get() as Streak;
    
    if (allCompleted) {
      // Calculate new streak
      const lastDate = currentStreak.last_completed_date;
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let newStreak = currentStreak.current_streak;
      
      if (!lastDate || lastDate === yesterdayStr) {
        // Continuing streak or starting new one
        newStreak = lastDate === yesterdayStr ? currentStreak.current_streak + 1 : 1;
      } else if (lastDate === date) {
        // Already counted today
        newStreak = currentStreak.current_streak;
      } else {
        // Streak broken, start fresh
        newStreak = 1;
      }
      
      const newLongest = Math.max(newStreak, currentStreak.longest_streak);
      
      db.prepare(`
        UPDATE streaks 
        SET current_streak = ?, longest_streak = ?, last_completed_date = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).run(newStreak, newLongest, date);
      
      const updatedStreak = db.prepare('SELECT * FROM streaks WHERE id = 1').get() as Streak;
      return NextResponse.json(updatedStreak);
    } else {
      // Check if streak needs to be reset (missed a day)
      const today = new Date().toISOString().split('T')[0];
      const lastDate = currentStreak.last_completed_date;
      
      if (lastDate) {
        const daysDiff = Math.floor((new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 1) {
          // Streak broken
          db.prepare(`
            UPDATE streaks 
            SET current_streak = 0, updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
          `).run();
        }
      }
      
      const updatedStreak = db.prepare('SELECT * FROM streaks WHERE id = 1').get() as Streak;
      return NextResponse.json(updatedStreak);
    }
  } catch (error) {
    console.error('Error updating streak:', error);
    return NextResponse.json({ error: 'Failed to update streak' }, { status: 500 });
  }
}
