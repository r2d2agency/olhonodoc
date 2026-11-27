import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/** Exclui um lead/cliente e todos os seus dados vinculados. */
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const current = await requireSuperadmin();
  if (!current) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  if (current.id === params.id) return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 });

  const customer = await prisma.customer.findFirst({
    where: { OR: [{ id: params.id }, { userId: params.id }] },
    select: { id: true, userId: true, name: true, email: true },
  });
  if (!customer) return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });

  // Busca pedidos para limpar PDFs e relações em cascata manual onde necessário.
  const orderIds = await prisma.order.findMany({ where: { customerId: customer.id }, select: { id: true } }).then(rows => rows.map(r => r.id));

  await prisma.$transaction(async (tx) => {
    if (orderIds.length) {
      await tx.couponRedemption.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.paymentEvent.deleteMany({ where: { payment: { orderId: { in: orderIds } } } });
      await tx.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.vehicleQuery.deleteMany({ where: { orderId: { in: orderIds } } });
      await tx.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    await tx.couponAssignment.deleteMany({ where: { customerId: customer.id } });
    await tx.customer.delete({ where: { id: customer.id } });
    if (customer.userId) {
      await tx.session.deleteMany({ where: { userId: customer.userId } });
      await tx.authCode.deleteMany({ where: { userId: customer.userId } });
      await tx.user.deleteMany({ where: { id: customer.userId, role: 'CUSTOMER' } });
    }
  });

  return NextResponse.json({ ok: true });
}
