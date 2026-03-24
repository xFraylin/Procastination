import jwt from 'jsonwebtoken';
import { AuthUser } from './jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function verifyTokenForMiddleware(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    return { id: decoded.userId, username: decoded.username };
  } catch (error) {
    console.log('JWT verification error:', error);
    return null;
  }
}
