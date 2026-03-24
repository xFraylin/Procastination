import { NextRequest, NextResponse } from 'next/server';
import db, { ContentIdea } from '@/lib/db';

// Get all content ideas
export async function GET() {
  try {
    const ideas = db.prepare('SELECT * FROM content_ideas ORDER BY created_at DESC').all() as ContentIdea[];
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching content ideas:', error);
    return NextResponse.json({ error: 'Failed to fetch content ideas' }, { status: 500 });
  }
}

// Create a new content idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, script, status } = body;
    
    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }
    
    const result = db.prepare(`
      INSERT INTO content_ideas (title, description, script, status)
      VALUES (?, ?, ?, ?)
    `).run(title, description || null, script || null, status || 'idea');
    
    const newIdea = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(result.lastInsertRowid) as ContentIdea;
    return NextResponse.json(newIdea, { status: 201 });
  } catch (error) {
    console.error('Error creating content idea:', error);
    return NextResponse.json({ error: 'Failed to create content idea' }, { status: 500 });
  }
}

// Update a content idea
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, script, status } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    
    const updates: string[] = [];
    const values: (string | number)[] = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (script !== undefined) {
      updates.push('script = ?');
      values.push(script);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      db.prepare(`UPDATE content_ideas SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }
    
    const updatedIdea = db.prepare('SELECT * FROM content_ideas WHERE id = ?').get(id) as ContentIdea;
    return NextResponse.json(updatedIdea);
  } catch (error) {
    console.error('Error updating content idea:', error);
    return NextResponse.json({ error: 'Failed to update content idea' }, { status: 500 });
  }
}

// Delete a content idea
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  
  try {
    db.prepare('DELETE FROM content_ideas WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content idea:', error);
    return NextResponse.json({ error: 'Failed to delete content idea' }, { status: 500 });
  }
}
