import { NextResponse } from 'next/server';
import { validMercadoPagoSignature, processPaymentEvent, providerPaymentStatus } from '@/lib/payment-webhook';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** Limite simples por IP: o webhook não deve ser usado para forjarVolume de chamadas. */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    void logger.warn('webhook.mercadopago.rate_limited', { ip });
    return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const dataId = typeof body?.data?.id === 'string' ? body.data.id : new URL(request.url).searchParams.get('data.id') || '';
  const eventType = typeof body?.type === 'string' ? body.type : undefined;
  // O id do evento precisa ser estável entre novas tentativas do mesmo evento.
  // `x-request-id` muda a cada entrega, então não serve para deduplicação.
  const eventId = typeof body?.id === 'string' && body.id ? body.id : `${eventType || 'event'}:${dataId}`;
  if (!dataId || !(await validMercadoPagoSignature(request, dataId))) {
    void logger.warn('webhook.mercadopago.rejected', { dataId, eventType, eventId, hasSignature: Boolean(request.headers.get('x-signature')) });
    return NextResponse.json({ error: 'Webhook inválido.' }, { status: 401 });
  }
  try {
    const result = await providerPaymentStatus('mercadopago', dataId);
    const outcome = await processPaymentEvent('mercadopago', eventId, [dataId, typeof body?.data?.order?.id === 'string' ? body.data.order.id : ''], result.status, result.data, eventType);
    void logger.info('webhook.mercadopago.processed', { dataId, eventType, eventId, status: result.status, outcome });
    return NextResponse.json({ ok: true, outcome });
  } catch (error) {
    void logger.error('webhook.mercadopago.failed', { dataId, eventType, eventId, message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível processar o evento.' }, { status: 502 });
  }
}
