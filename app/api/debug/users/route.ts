import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = db.prepare('SELECT id, username, created_at FROM users').all();
    
    return NextResponse.json({
      users: users,
      count: users.length,
      message: `Found ${users.length} users in database`
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
