import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';
import { submitOrderToCompany } from '@/lib/company-query';

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const status = new URL(request.url).searchParams.get('status');
    const orders = await prisma.order.findMany({ where: status && Object.values(OrderStatus).includes(status as OrderStatus) ? { status: status as OrderStatus } : undefined, include: { product: { select: { name: true, slug: true } }, customer: { select: { name: true, email: true } }, coupon: { select: { code: true } }, query: { select: { normalizedPlate: true, queriedAt: true } } }, orderBy: { createdAt: 'desc' }, take: 200 });
    return NextResponse.json({ data: orders });
  } catch (error) { console.error('Admin order list failed', error); return NextResponse.json({ error: 'Não foi possível carregar os pedidos.' }, { status: 500 }); }
}

export async function PATCH(request: Request) {
  const user = await requireSuperadmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const body = await request.json();
    if (typeof body.id !== 'string' || !Object.values(OrderStatus).includes(body.status as OrderStatus)) return NextResponse.json({ error: 'Pedido e status válidos são obrigatórios.' }, { status: 400 });
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: body.id }, include: { redemption: true } });
      if (!existing) throw new Error('NOT_FOUND');
      if (existing.status === 'PAID' && body.status !== 'COMPLETED') throw new Error('INVALID_TRANSITION');
      const updated = await tx.order.update({ where: { id: body.id }, data: { status: body.status } });
      if (body.status === 'CANCELLED' && existing.redemption && !existing.redemption.reversedAt) {
        await tx.couponRedemption.update({ where: { id: existing.redemption.id }, data: { reversedAt: new Date() } });
        await tx.coupon.update({ where: { id: existing.redemption.couponId }, data: { redemptionCount: { decrement: 1 } } });
      }
      return updated;
    });
    return NextResponse.json({ data: order });
  } catch (error) { if (error instanceof Error && error.message === 'NOT_FOUND') return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 }); if (error instanceof Error && error.message === 'INVALID_TRANSITION') return NextResponse.json({ error: 'Transição de status não permitida.' }, { status: 409 }); console.error('Admin order update failed', error); return NextResponse.json({ error: 'Não foi possível atualizar o pedido.' }, { status: 400 }); }
}
