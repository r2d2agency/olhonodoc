import { NextResponse } from 'next/server';
import { validMercadoPagoSignature, providerPaymentStatus, processPaymentEvent } from '@/lib/payment-webhook';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const dataId = typeof body?.data?.id === 'string' ? body.data.id : new URL(request.url).searchParams.get('data.id') || '';
  const eventId = request.headers.get('x-request-id') || `${body?.id || dataId}`;
  if (!dataId || !(await validMercadoPagoSignature(request, dataId))) return NextResponse.json({ error: 'Webhook inválido.' }, { status: 401 });
  try { const result = await providerPaymentStatus('mercadopago', dataId); return NextResponse.json(await processPaymentEvent('mercadopago', eventId, dataId, result.status, result.data)); }
  catch { return NextResponse.json({ error: 'Não foi possível processar o evento.' }, { status: 502 }); }
}
