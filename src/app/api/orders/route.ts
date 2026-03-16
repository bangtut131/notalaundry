import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId, userId } = auth.session!;

  try {
    const body = await req.json();
    const { customerId, items, paymentStatus, totalAmount, discount, notes } = body;

    if (!customerId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 });
    }

    const finalAmount = totalAmount - (discount || 0);

    const date = new Date();
    const dateStr = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const count = await prisma.order.count({
      where: { storeId, createdAt: { gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()) } }
    });
    const orderNumber = `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        userId,
        storeId,
        totalAmount,
        discount: discount || 0,
        finalAmount,
        paymentStatus: paymentStatus || 'UNPAID',
        notes,
        items: {
          create: items.map((item: any) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        customer: true,
        items: { include: { service: true } }
      }
    });

    // Auto-billing WA (fire and forget)
    try {
      const waMessage = `*NOTA LAUNDRY PRO* 🫧\nHai kak *${newOrder.customer.name}*,\nTerima kasih!\n\n*No Resi:* ${newOrder.orderNumber}\n*Layanan:* ${newOrder.items.map((i: any) => i.service.name).join(', ')}\n*Total:* Rp ${finalAmount.toLocaleString('id-ID')}\n*Status:* ${paymentStatus === 'PAID' ? 'LUNAS ✅' : 'BELUM BAYAR ❌'}`;

      fetch(new URL('/api/waha/send', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: newOrder.customer.phone, message: waMessage })
      }).catch(e => console.error("WAHA err:", e));
    } catch (e) {}

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.response;
  const { storeId } = auth.session!;

  try {
    const orders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        items: { include: { service: true } }
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
