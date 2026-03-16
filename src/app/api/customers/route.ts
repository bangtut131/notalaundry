import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const customers = await prisma.customer.findMany({
      where: { storeId },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const body = await req.json();
    const { name, phone, address } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: 'Nama dan nomor WA wajib diisi' }, { status: 400 });
    }
    const customer = await prisma.customer.create({
      data: { name, phone, address: address || null, storeId }
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Nomor WA sudah terdaftar di toko ini' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menambah pelanggan' }, { status: 500 });
  }
}
