import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { storeName, email, password, name } = body;

    if (!storeName || !email || !password || !name) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    // Create Store + Admin User
    const store = await prisma.store.create({
      data: {
        name: storeName,
        plan: 'STARTER',
        users: {
          create: {
            email,
            password: hashPassword(password),
            name,
            role: 'ADMIN',
          }
        }
      },
      include: { users: true }
    });

    const user = store.users[0];

    // Create default services for the new store
    await prisma.service.createMany({
      data: [
        { name: 'Cuci Kiloan Reguler', price: 7000, unit: 'KG', storeId: store.id },
        { name: 'Cuci Kiloan Express', price: 12000, unit: 'KG', isExpress: true, storeId: store.id },
        { name: 'Cuci Satuan (Jaket/Jas)', price: 25000, unit: 'PCS', storeId: store.id },
        { name: 'Cuci Karpet', price: 15000, unit: 'METER', storeId: store.id },
        { name: 'Cuci Selimut/Bedcover', price: 30000, unit: 'PCS', storeId: store.id },
        { name: 'Setrika Saja', price: 5000, unit: 'KG', storeId: store.id },
      ]
    });

    // Create session
    await createSession(user.id, store.id, user.email, user.name, user.role, store.name);

    return NextResponse.json({ success: true, storeName: store.name }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Gagal mendaftar: ' + error.message }, { status: 500 });
  }
}
