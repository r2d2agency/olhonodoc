import { prisma } from '@/lib/prisma';
import { processPaymentEvent, providerPaymentStatus } from '@/lib/payment-webhook';
import { logger } from '@/lib/logger';

/** Pagamentos que ainda não têm desfecho e podem ser reconciliados com o provedor. */
const PENDING_STATUSES = ['PENDING', 'IN_PROCESS', 'AUTHORIZED'];

/**
 * Reconcilia pagamentos pendentes consultando o provedor.
 *
 * Usado como rede de segurança para quando o webhook não chega (falha de rede do
 * Mercado Pago, evento perdido, bloqueio temporário do endpoint). Cada reconciliação
 * gera um evento com id estável para não duplicar trabalho.
 */
export async function reconcilePendingPayments(options: { limit?: number } = {}) {
  const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
  const payments = await prisma.payment.findMany({
    where: { status: { in: PENDING_STATUSES as any }, externalId: { not: null } },
    include: { order: { select: { id: true, status: true } } },
    orderBy: { updatedAt: 'asc' },
    take: limit,
  });
  let checked = 0;
  let updated = 0;
  let failed = 0;
  for (const payment of payments) {
    if (!payment.externalId) continue;
    checked += 1;
    try {
      const result = await providerPaymentStatus(payment.provider, payment.externalId);
      if (result.status === 'PENDING' || result.status === 'IN_PROCESS' || result.status === 'AUTHORIZED') {
        await prisma.payment.update({ where: { id: payment.id }, data: { attempts: { increment: 1 }, lastSyncedAt: new Date() } });
        continue;
      }
      const eventId = `reconcile:${payment.id}:${result.status}:${payment.externalId}`;
      const outcome = await processPaymentEvent(payment.provider, eventId, payment.externalId, result.status, result.data, 'reconciliation');
      if (outcome?.processed) updated += 1;
    } catch (error) {
      failed += 1;
      void logger.warn('payment.reconcile.failed', { paymentId: payment.id, externalId: payment.externalId, message: error instanceof Error ? error.message : 'erro' });
    }
  }
  void logger.info('payment.reconcile.finished', { checked, updated, failed, total: payments.length });
  return { checked, updated, failed, total: payments.length };
}
