import { NextResponse } from 'next/server';
import { validMercadoPagoSignature, providerPaymentStatus, processPaymentEvent } from '@/lib/payment-webhook';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const dataId = typeof body?.data?.id === 'string' ? body.data.id : new URL(request.url).searchParams.get('data.id') || '';
  const eventId = request.headers.get('x-request-id') || `${body?.id || dataId}`;
  if (!dataId || !(await validMercadoPagoSignature(request, dataId))) { void logger.error('webhook.mercadopago.rejected_401', { dataId }); return NextResponse.json({ error: 'Webhook inválido.' }, { status: 401 }); }
  try { const result = await providerPaymentStatus('mercadopago', dataId); const outcome = await processPaymentEvent('mercadopago', eventId, dataId, result.status, result.data); void logger.info('webhook.mercadopago.processed', { dataId, status: result.status, outcome: JSON.stringify(outcome).slice(0, 120) }); return NextResponse.json(outcome); }
  catch (error) { void logger.error('webhook.mercadopago.failed', { dataId, message: error instanceof Error ? error.message.slice(0, 120) : 'desconhecido' }); return NextResponse.json({ error: 'Não foi possível processar o evento.' }, { status: 502 }); }
}
