import { prisma } from '@/lib/prisma';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getPaymentConfiguration, normalizeProviderStatus, type NormalizedPaymentStatus } from '@/lib/payment-provider';
import { submitOrderToCompany } from '@/lib/company-query';
import { logger } from '@/lib/logger';

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function validMercadoPagoSignature(request: Request, dataId: string) {
  const config = await getPaymentConfiguration();
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || config.mercadopago.webhookSecret;
  if (!secret) { void logger.error('webhook.mercadopago.no_secret', { dataId }); return false; }
  const xSignature = request.headers.get('x-signature') || '';
  const xRequestId = request.headers.get('x-request-id') || '';
  const ts = xSignature.match(/ts=([^,]+)/)?.[1];
  const v1 = xSignature.match(/v1=([^,]+)/)?.[1];
  if (!ts || !v1) { void logger.error('webhook.mercadopago.malformed_signature', { dataId, hasTs: Boolean(ts), hasV1: Boolean(v1) }); return false; }
  const expected = createHmac('sha256', secret).update(`id:${dataId};request-id:${xRequestId};ts:${ts};`).digest('hex');
  const valid = safeEqual(expected, v1);
  if (!valid) void logger.error('webhook.mercadopago.invalid_signature', { dataId, ts });
  return valid;
}

/**
 * O Mercado Pago notifica o webhook com `data.id` do recurso notificado. Dependendo do tipo
 * de evento isso pode ser o id da order (payment_created) ou o id do payment (payment_approved).
 * A base local guarda os dois, então a busca cobre ambos antes de desistir.
 *
 * O Asaas, por sua vez, notifica com o id do *pagamento* gerado a partir do payment link,
 * que é diferente do id do link salvo localmente. Por isso a busca também considera a
 * `externalReference` (o id do pedido) e a chave de idempotência `order:<id>`.
 */
async function findPayment(provider: string, externalIds: string[]) {
  const candidates = Array.from(new Set(externalIds.filter(Boolean)));
  for (const externalId of candidates) {
    const byExternal = await prisma.payment.findFirst({ where: { provider, externalId } });
    if (byExternal) return byExternal;
    const byProviderOrder = await prisma.payment.findFirst({ where: { provider, providerOrderId: externalId } });
    if (byProviderOrder) return byProviderOrder;
    // As chaves de idempotência carregam o método (cartão, Pix, boleto, checkout),
    // então tentamos os sufixos conhecidos. A forma antiga, sem sufixo, continua
    // válida para registros criados antes da separação.
    const byIdempotency = await prisma.payment.findFirst({
      where: { provider, idempotencyKey: { in: [`order:${externalId}`, `order:${externalId}:card`, `order:${externalId}:checkout`, `order:${externalId}:pix`, `order:${externalId}:bolbradesco`] } },
      orderBy: { createdAt: 'desc' },
    });
    if (byIdempotency) return byIdempotency;
  }
  return null;
}

/**
 * Ordem canônica dos status. Um pagamento não pode regredir de um estado terminal
 * (aprovado, estornado, diobado) para um estado pendente; apenas permite o desfecho
 * de um estado aprovado para estorno/diabo.
 */
const STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  IN_PROCESS: 1,
  AUTHORIZED: 2,
  APPROVED: 3,
  REJECTED: 3,
  CANCELLED: 3,
  EXPIRED: 3,
  REFUNDED: 4,
  CHARGEBACK: 5,
};

function canApplyStatus(current: string, next: NormalizedPaymentStatus) {
  const currentRank = STATUS_RANK[current] ?? 0;
  const nextRank = STATUS_RANK[next] ?? 0;
  if (nextRank > currentRank) return true;
  if (nextRank === currentRank) return next !== 'PENDING';
  // Só é permitido regredir de APPROVED para CANCELLED/REJECTED explicitamente.
  if (current === 'APPROVED' && ['CANCELLED', 'REJECTED'].includes(next)) return true;
  return false;
}

/**
 * Status do pedido derivado do status do pagamento.
 *
 * Estorno e diabo (`REFUNDED`/`CHARGEBACK`) têm tratamento próprio: o pedido já
 * estava pago, então precisa ser revertido mesmo que não esteja mais pendente.
 */
export function orderStatusForPayment(status: NormalizedPaymentStatus): 'PAID' | 'CANCELLED' | 'REFUNDED' | undefined {
  if (status === 'APPROVED') return 'PAID';
  if (status === 'REFUNDED' || status === 'CHARGEBACK') return 'REFUNDED';
  if (['REJECTED', 'CANCELLED', 'EXPIRED'].includes(status)) return 'CANCELLED';
  return undefined;
}

export async function processPaymentEvent(provider: string, externalEventId: string, externalPaymentIds: string | string[], normalizedStatus: NormalizedPaymentStatus, payload: unknown, eventType?: string) {
  const existingEvent = await prisma.paymentEvent.findUnique({ where: { provider_externalEventId: { provider, externalEventId } } });
  if (existingEvent?.status === 'PROCESSED' || existingEvent?.status === 'IGNORED') return { duplicate: true };
  const ids = Array.isArray(externalPaymentIds) ? externalPaymentIds : [externalPaymentIds];
  const payment = await findPayment(provider, ids);
  if (!payment) { void logger.warn('webhook.payment.not_found', { provider, externalPaymentIds: ids, externalEventId }); return { missing: true }; }
  let event = existingEvent;
  if (!event) {
    try {
      event = await prisma.paymentEvent.create({ data: { provider, externalEventId, paymentId: payment.id, status: 'RECEIVED', payload: payload as object, eventType } });
    } catch (error: any) {
      // Corrida entre duas entregas do mesmo evento: a outra já criou o registro.
      if (error?.code === 'P2002') {
        event = await prisma.paymentEvent.findUnique({ where: { provider_externalEventId: { provider, externalEventId } } });
        if (!event) throw error;
        if (event.status === 'PROCESSED' || event.status === 'IGNORED') return { duplicate: true };
      } else {
        throw error;
      }
    }
  }
  const orderStatus = orderStatusForPayment(normalizedStatus);
  const applied = canApplyStatus(payment.status, normalizedStatus);
  if (!applied) {
    void logger.warn('webhook.payment.status_regression_ignored', { provider, externalPaymentIds: ids, current: payment.status, incoming: normalizedStatus, eventType });
    await prisma.paymentEvent.update({ where: { id: event.id }, data: { status: 'IGNORED', processedAt: new Date(), error: `regressão: ${payment.status} -> ${normalizedStatus}` } });
    return { ignored: true };
  }
  await prisma.$transaction(async tx => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: normalizedStatus,
        rawResponse: payload as object,
        attempts: { increment: 1 },
        lastSyncedAt: new Date(),
        ...(normalizedStatus === 'REFUNDED' ? { refundedAt: new Date() } : {}),
      },
    });
    if (orderStatus === 'REFUNDED') {
      // Estorno/diabo reverte o pedido mesmo já pago: o valor devolvido invalida
      // a entrega, então o pedido volta para cancelado.
      await tx.order.updateMany({ where: { id: payment.orderId, status: { in: ['PENDING', 'PAID'] } }, data: { status: 'CANCELLED' } });
    } else if (orderStatus) {
      // Só mexe no pedido enquanto ele estiver pendente; pedidos já pagos/encerrados não são rebaixados.
      if (orderStatus === 'PAID') {
        await tx.order.updateMany({ where: { id: payment.orderId, status: 'PENDING' }, data: { status: 'PAID' } });
      } else {
        await tx.order.updateMany({ where: { id: payment.orderId, status: 'PENDING' }, data: { status: 'CANCELLED' } });
      }
    }
    await tx.paymentEvent.update({ where: { id: event.id }, data: { status: orderStatus ? 'PROCESSED' : 'IGNORED', processedAt: new Date(), error: null } });
  });
  if (orderStatus === 'PAID') {
    try { await submitOrderToCompany(payment.orderId); } catch { /* consulta pode ser reprocessada pelo admin */ }
  }
  return { processed: true, orderStatus };
}

export async function providerPaymentStatus(provider: string, externalId: string) {
  const config = await getPaymentConfiguration();
  if (provider === 'mercadopago') {
    if (!config.mercadopago.accessToken) throw new Error('PROVIDER_STATUS_ERROR');
    const headers = { Authorization: `Bearer ${config.mercadopago.accessToken}` };
    let response = await fetch(`https://api.mercadopago.com/v1/orders/${encodeURIComponent(externalId)}`, { headers, signal: AbortSignal.timeout(10000) });
    if (response.ok) {
      const data = await response.json();
      const paymentStatus = data.transactions?.payments?.[0];
      return { status: normalizeProviderStatus(paymentStatus), data };
    }
    // O webhook pode notificar com o id do payment em vez do id da order; o endpoint de orders responde 404 nesse caso.
    const fallback = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(externalId)}`, { headers, signal: AbortSignal.timeout(10000) });
    if (!fallback.ok) {
      void logger.error('webhook.mercadopago.status_lookup_failed', { externalId, ordersStatus: response.status, paymentsStatus: fallback.status });
      throw new Error('PROVIDER_STATUS_ERROR');
    }
    const paymentData = await fallback.json();
    void logger.info('webhook.mercadopago.status_from_payment', { externalId, providerStatus: paymentData.status });
    return { status: normalizeProviderStatus(paymentData), data: paymentData };
  }
  const host = config.environment === 'sandbox' ? 'https://sandbox.asaas.com' : 'https://api.asaas.com';
  const headers = { access_token: config.asaas.apiKey };
  let response = await fetch(`${host}/v3/payments/${encodeURIComponent(externalId)}`, { headers, signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    // O id salvo localmente é o do payment link; o Asaas responde 404 ao consultar
    // /v3/payments com esse id. Buscamos o link para descobrir o pagamento gerado.
    const link = await fetch(`${host}/v3/paymentLinks/${encodeURIComponent(externalId)}`, { headers, signal: AbortSignal.timeout(10000) });
    if (!link.ok) throw new Error('PROVIDER_STATUS_ERROR');
    const linkData = await link.json().catch(() => ({}));
    const paymentId = typeof linkData?.paymentId === 'string' ? linkData.paymentId : '';
    if (!paymentId) throw new Error('PROVIDER_STATUS_ERROR');
    response = await fetch(`${host}/v3/payments/${encodeURIComponent(paymentId)}`, { headers, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('PROVIDER_STATUS_ERROR');
  }
  const data = await response.json();
  // No Asaas, RECEIVED significa "recebido, aguardando confirmação"; só CONFIRMED
  // representa pagamento liquidado. Tratar RECEIVED como aprovado liberava o pedido cedo.
  const status: NormalizedPaymentStatus = data.status === 'CONFIRMED' ? 'APPROVED' : data.status === 'RECEIVED' ? 'IN_PROCESS' : ['REFUNDED', 'REFUND_REQUESTED'].includes(data.status) ? 'REFUNDED' : ['OVERDUE', 'DELETED'].includes(data.status) ? 'CANCELLED' : 'PENDING';
  return { status, data };
}
