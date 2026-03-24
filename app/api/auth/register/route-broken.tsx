import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';
import { getCookieConfig } from '@/lib/cookies';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Create user (this will now throw error if user exists)
    // Crear usuario usando la base de datos en memoria
    const { db } = require('@/lib/db');
    const user = db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, password);
      
      // Generate token
      const token = generateToken({ id: user.id, username: user.username });
      
      // Set HTTP-only cookie
      const response = NextResponse.json({ 
        success: true, 
        user: { id: user.id, username: user.username }
      });
      
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: false, // Desactivar secure para desarrollo en red local
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
        domain: undefined // No especificar dominio para que funcione en localhost e IP
      });
      
      return response;
    } catch (error) {
      if (error instanceof Error && error.message === 'Username already exists') {
        return NextResponse.json(
          { error: 'El usuario ya existe' },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
