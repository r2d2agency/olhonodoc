import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Histórico de tentativas de pagamento da conta do cliente. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.email) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  const payments = await prisma.payment.findMany({
    where: { order: { customer: { email: normalizeEmail(user.email) } } },
    include: {
      order: {
        select: {
          id: true, plate: true, status: true, createdAt: true,
          product: { select: { name: true, slug: true } },
          totalCents: true, amountCents: true,
        },
      },
      events: { select: { externalEventId: true, eventType: true, status: true, createdAt: true, processedAt: true }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return NextResponse.json({ data: payments.map(p => ({
    id: p.id,
    provider: p.provider,
    method: p.method,
    status: p.status,
    amountCents: p.amountCents,
    installments: p.installments,
    attempts: p.attempts,
    externalId: p.externalId,
    providerOrderId: p.providerOrderId,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    lastSyncedAt: p.lastSyncedAt,
    order: p.order,
    events: p.events,
  })) });
}
