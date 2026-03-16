import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'crypto';
import prisma from './prisma';

// Simple password hashing using SHA-256 + salt
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const testHash = createHash('sha256').update(password + salt).digest('hex');
  return hash === testHash;
}

// Session token: simple base64 JSON cookie
function encodeSession(data: { userId: string; storeId: string; email: string; name: string; role: string; storeName: string }) {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

function decodeSession(token: string) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function createSession(userId: string, storeId: string, email: string, name: string, role: string, storeName: string) {
  const token = encodeSession({ userId, storeId, email, name, role, storeName });
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: false, // set true in production
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: 'lax',
  });
  return token;
}

export async function getSession(): Promise<{ userId: string; storeId: string; email: string; name: string; role: string; storeName: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Helper for API routes: require auth or return 401
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    const { NextResponse } = await import('next/server');
    return { error: true as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), session: null };
  }
  return { error: false as const, response: null, session };
}
