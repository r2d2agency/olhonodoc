import { NextResponse } from 'next/server';
import { getPaymentConfiguration } from '@/lib/payment-provider';
import { providerPaymentStatus, processPaymentEvent } from '@/lib/payment-webhook';

export async function POST(request: Request) {
  const config = await getPaymentConfiguration();
  const token = request.headers.get('asaas-access-token') || request.headers.get('x-asaas-token');
  if (!config.asaas.webhookToken || !token || token !== config.asaas.webhookToken) return NextResponse.json({ error: 'Webhook inválido.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const externalId = typeof body?.payment?.id === 'string' ? body.payment.id : '';
  const eventId = typeof body?.id === 'string' ? body.id : `${body?.event || 'event'}:${externalId}`;
  if (!externalId) return NextResponse.json({ error: 'Pagamento ausente.' }, { status: 400 });
  try { const result = await providerPaymentStatus('asaas', externalId); return NextResponse.json(await processPaymentEvent('asaas', eventId, externalId, result.status, result.data)); }
  catch { return NextResponse.json({ error: 'Não foi possível processar o evento.' }, { status: 502 }); }
}
