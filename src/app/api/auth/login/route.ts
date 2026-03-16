import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { store: true }
    });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    await createSession(
      user.id, 
      user.storeId || '', 
      user.email, 
      user.name, 
      user.role, 
      user.store?.name || 'Super Admin'
    );

    return NextResponse.json({ success: true, storeName: user.store?.name || 'Admin Panel' });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Gagal login' }, { status: 500 });
  }
}
