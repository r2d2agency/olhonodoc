import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Lista transações e eventos de webhook para a tela de pagamentos do admin. */
export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const status = params.get('status');
  const provider = params.get('provider');
  const limit = Math.min(Number(params.get('limit') || 100) || 100, 300);
  const payments = await prisma.payment.findMany({
    where: {
      ...(provider ? { provider } : {}),
      ...(status && status !== 'ALL' ? { status: status as any } : {}),
    },
    include: {
      order: { select: { id: true, plate: true, status: true, totalCents: true, createdAt: true } },
      events: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  const totals = await prisma.payment.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amountCents: true } });
  return NextResponse.json({
    data: {
      payments: payments.map(payment => ({
        id: payment.id,
        orderId: payment.orderId,
        plate: payment.order.plate,
        orderStatus: payment.order.status,
        provider: payment.provider,
        method: payment.method,
        installments: payment.installments,
        status: payment.status,
        amountCents: payment.amountCents,
        externalId: payment.externalId,
        checkoutUrl: payment.checkoutUrl,
        attempts: payment.attempts,
        lastSyncedAt: payment.lastSyncedAt,
        refundedAt: payment.refundedAt,
        createdAt: payment.createdAt,
        events: payment.events.map(event => ({
          id: event.id,
          externalEventId: event.externalEventId,
          eventType: event.eventType,
          status: event.status,
          error: event.error,
          createdAt: event.createdAt,
          processedAt: event.processedAt,
        })),
      })),
      totals: totals.map(row => ({ status: row.status, count: row._count._all, amountCents: row._sum.amountCents || 0 })),
    },
  });
}
