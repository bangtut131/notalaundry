import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const id = params.id;
    const body = await req.json();
    const { status, paymentStatus } = body;

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { service: true } } }
    });

    if (!currentOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    if (status === 'READY' && currentOrder.status !== 'READY') {
      updateData.completedDate = new Date();
    }
    if (status === 'COMPLETED' && currentOrder.status !== 'COMPLETED') {
        updateData.pickedUpDate = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData
    });

    // AUTO-BILLING TRIGGER: If status changed to READY, blast WA Tagihan
    if (status === 'READY' && currentOrder.status !== 'READY') {
      try {
        const waMessage = `*PEMBERITAHUAN LAUNDRY SELESAI* 🫧
Hai kak *${currentOrder.customer.name}*,
Cucian Anda dengan No Resi *${currentOrder.orderNumber}* sudah SELESAI dan siap diambil! 🥳

*Total Tagihan:* Rp ${currentOrder.finalAmount.toLocaleString('id-ID')}
*Status Pembayaran:* ${paymentStatus === 'PAID' || currentOrder.paymentStatus === 'PAID' ? 'LUNAS ✅' : 'BELUM BAYAR ❌'}

Terima kasih, ditunggu kedatangannya!`;

        fetch(new URL('/api/waha/send', req.url).toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            to: currentOrder.customer.phone,
            message: waMessage
            })
        }).catch(e => console.error("Err Triggering WAHA Background:", e));
      } catch (err) {
          console.error(err)
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
