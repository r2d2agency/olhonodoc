import { prisma } from '@/lib/prisma';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getPaymentConfiguration, type NormalizedPaymentStatus } from '@/lib/payment-provider';
import { submitOrderToCompany } from '@/lib/company-query';

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function validMercadoPagoSignature(request: Request, dataId: string) {
  return getPaymentConfiguration().then(config => {
    const secret = config.mercadopago.webhookSecret;
    if (!secret) return false;
    const xSignature = request.headers.get('x-signature') || '';
    const xRequestId = request.headers.get('x-request-id') || '';
    const ts = xSignature.match(/ts=([^,]+)/)?.[1];
    const v1 = xSignature.match(/v1=([^,]+)/)?.[1];
    if (!ts || !v1) return false;
    return safeEqual(createHmac('sha256', secret).update(`id:${dataId};request-id:${xRequestId};ts:${ts};`).digest('hex'), v1);
  });
}

export async function processPaymentEvent(provider: string, externalEventId: string, externalPaymentId: string, normalizedStatus: NormalizedPaymentStatus, payload: unknown) {
  const existingEvent = await prisma.paymentEvent.findUnique({ where: { provider_externalEventId: { provider, externalEventId } } });
  if (existingEvent?.status === 'PROCESSED' || existingEvent?.status === 'IGNORED') return { duplicate: true };
  const payment = await prisma.payment.findFirst({ where: { provider, externalId: externalPaymentId } });
  if (!payment) return { missing: true };
  const event = existingEvent || await prisma.paymentEvent.create({ data: { provider, externalEventId, paymentId: payment.id, status: 'RECEIVED', payload: payload as object } });
  const orderStatus = normalizedStatus === 'APPROVED' ? 'PAID' : ['REJECTED', 'CANCELLED', 'EXPIRED', 'CHARGEBACK'].includes(normalizedStatus) ? 'CANCELLED' : undefined;
  await prisma.$transaction(async tx => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: normalizedStatus, rawResponse: payload as object } });
    if (orderStatus) await tx.order.updateMany({ where: { id: payment.orderId, status: 'PENDING' }, data: { status: orderStatus } });
    await tx.paymentEvent.update({ where: { id: event.id }, data: { status: orderStatus ? 'PROCESSED' : 'IGNORED', processedAt: new Date() } });
  });
  if (orderStatus === 'PAID') {
    try { await submitOrderToCompany(payment.orderId); } catch { /* consulta pode ser reprocessada pelo admin */ }
  }
  return { processed: true };
}

export async function providerPaymentStatus(provider: string, externalId: string) {
  const config = await getPaymentConfiguration();
  if (provider === 'mercadopago') {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(externalId)}`, { headers: { Authorization: `Bearer ${config.mercadopago.accessToken}` }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('PROVIDER_STATUS_ERROR');
    const data = await response.json();
    const status: NormalizedPaymentStatus = data.status === 'approved' ? 'APPROVED' : data.status === 'rejected' ? 'REJECTED' : data.status === 'cancelled' ? 'CANCELLED' : data.status === 'refunded' ? 'REFUNDED' : 'PENDING';
    return { status, data };
  }
  const host = config.environment === 'sandbox' ? 'https://sandbox.asaas.com' : 'https://api.asaas.com';
  const response = await fetch(`${host}/v3/payments/${encodeURIComponent(externalId)}`, { headers: { access_token: config.asaas.apiKey }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('PROVIDER_STATUS_ERROR');
  const data = await response.json();
  const status: NormalizedPaymentStatus = ['RECEIVED', 'CONFIRMED'].includes(data.status) ? 'APPROVED' : ['REFUNDED', 'REFUND_REQUESTED'].includes(data.status) ? 'REFUNDED' : ['OVERDUE', 'DELETED'].includes(data.status) ? 'CANCELLED' : 'PENDING';
  return { status, data };
}
