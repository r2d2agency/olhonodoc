import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const [pending, cancelled, recentQueries] = await Promise.all([
      prisma.order.findMany({ where: { status: OrderStatus.PENDING }, include: { product: { select: { name: true } }, customer: { select: { name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.order.findMany({ where: { status: OrderStatus.CANCELLED }, include: { product: { select: { name: true } }, customer: { select: { name: true, email: true } } }, orderBy: { updatedAt: 'desc' }, take: 100 }),
      prisma.vehicleQuery.count(),
    ]);
    return NextResponse.json({ data: { pending, cancelled, stats: { pendingOrders: pending.length, cancelledOrders: cancelled.length, totalQueries: recentQueries } } });
  } catch (error) { console.error('Admin recovery failed', error); return NextResponse.json({ error: 'Não foi possível carregar recuperação.' }, { status: 500 }); }
}
