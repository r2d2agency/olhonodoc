import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getPaymentConfiguration } from '@/lib/payment-provider';
import { providerPaymentStatus, processPaymentEvent } from '@/lib/payment-webhook';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

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

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
  const config = await getPaymentConfiguration();
  const token = request.headers.get('asaas-access-token') || request.headers.get('x-asaas-token');
  if (!config.asaas.webhookToken || !token || !safeEqual(token, config.asaas.webhookToken)) {
    void logger.warn('webhook.asaas.rejected', { hasToken: Boolean(token), hasConfiguredToken: Boolean(config.asaas.webhookToken) });
    return NextResponse.json({ error: 'Webhook inválido.' }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const externalId = typeof body?.payment?.id === 'string' ? body.payment.id : '';
  const eventId = typeof body?.id === 'string' ? body.id : `${body?.event || 'event'}:${externalId}`;
  if (!externalId) return NextResponse.json({ error: 'Pagamento ausente.' }, { status: 400 });
  // O webhook do Asaas referencia o *pagamento* gerado a partir do payment link.
  // A base local guarda o id do link, o id do pedido (externalReference) e a chave
  // de idempotência, então todos entram na busca do pagamento correspondente.
  const candidates = [
    externalId,
    typeof body?.payment?.externalReference === 'string' ? body.payment.externalReference : '',
    typeof body?.paymentLink?.id === 'string' ? body.paymentLink.id : '',
  ].filter(Boolean);
  try {
    const result = await providerPaymentStatus('asaas', externalId);
    // A cobrança gerada pelo payment link carrega a externalReference (id do pedido).
    const externalReference = typeof (result.data as any)?.externalReference === 'string' ? (result.data as any).externalReference : '';
    if (externalReference) candidates.push(externalReference);
    const outcome = await processPaymentEvent('asaas', eventId, candidates, result.status, result.data, typeof body?.event === 'string' ? body.event : undefined);
    void logger.info('webhook.asaas.processed', { externalId, eventId, status: result.status, outcome });
    return NextResponse.json(outcome);
  } catch (error) {
    void logger.error('webhook.asaas.failed', { externalId, eventId, message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível processar o evento.' }, { status: 502 });
  }
}
