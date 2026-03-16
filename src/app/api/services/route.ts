import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const services = await prisma.service.findMany({
      where: { storeId },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const body = await req.json();
    const { name, description, price, unit, isExpress } = body;
    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Nama dan harga wajib diisi' }, { status: 400 });
    }
    const service = await prisma.service.create({
      data: { name, description: description || null, price: parseFloat(price), unit: unit || 'KG', isExpress: isExpress || false, storeId }
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menambah layanan' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const body = await req.json();
    const { id, name, description, price, unit, isExpress } = body;
    if (!id || !name || price === undefined) {
      return NextResponse.json({ error: 'ID, nama, dan harga wajib diisi' }, { status: 400 });
    }
    // Ensure service belongs to this store
    const existing = await prisma.service.findFirst({ where: { id, storeId } });
    if (!existing) return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });

    const service = await prisma.service.update({
      where: { id },
      data: { name, description: description || null, price: parseFloat(price), unit: unit || 'KG', isExpress: isExpress || false }
    });
    return NextResponse.json(service);
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengubah layanan' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });

    const existing = await prisma.service.findFirst({ where: { id, storeId } });
    if (!existing) return NextResponse.json({ error: 'Layanan tidak ditemukan' }, { status: 404 });

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menghapus layanan' }, { status: 500 });
  }
}
