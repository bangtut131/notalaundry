import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'SUPERADMIN') {
    return { error: true, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { error: false, session };
}

// GET all stores
export async function GET() {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.response;

  try {
    const stores = await prisma.store.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, orders: true, customers: true } },
        users: { where: { role: 'ADMIN' }, select: { name: true, email: true }, take: 1 }
      }
    });

    const result = stores.map(s => ({
      id: s.id,
      name: s.name,
      plan: s.plan,
      isActive: s.isActive,
      createdAt: s.createdAt,
      planStart: s.planStart,
      owner: s.users[0] || null,
      _count: s._count,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH update store plan or status
export async function PATCH(req: Request) {
  const auth = await requireSuperAdmin();
  if (auth.error) return auth.response;

  try {
    const body = await req.json();
    const { storeId, plan, isActive } = body;

    if (!storeId) return NextResponse.json({ error: 'storeId required' }, { status: 400 });

    const updateData: any = {};
    if (plan !== undefined) {
      updateData.plan = plan;
      updateData.planStart = new Date();
    }
    if (isActive !== undefined) updateData.isActive = isActive;

    const store = await prisma.store.update({
      where: { id: storeId },
      data: updateData
    });

    return NextResponse.json(store);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
