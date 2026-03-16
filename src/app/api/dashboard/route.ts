import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalOrders, totalRevenue, activeOrders, recentOrders] = await Promise.all([
      prisma.order.count({ where: { storeId, createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({ where: { storeId, paymentStatus: 'PAID', createdAt: { gte: startOfMonth } }, _sum: { finalAmount: true } }),
      prisma.order.count({ where: { storeId, status: { in: ['QUEUE', 'WASHING', 'IRONING'] } } }),
      prisma.order.findMany({ where: { storeId }, take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true } })
    ]);

    return NextResponse.json({
      metrics: {
        revenue: totalRevenue._sum.finalAmount || 0,
        orders: totalOrders,
        activeOrders,
      },
      recentOrders
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
