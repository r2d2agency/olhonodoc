import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createOfflinePayment } from '@/lib/payment-provider';
import { getPaymentConfiguration } from '@/lib/payment-provider';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== 'string' || !body.orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
  const method = body?.method === 'pix' ? 'pix' : body?.method === 'boleto' ? 'bolbradesco' : '';
  if (!method) return NextResponse.json({ error: 'Método de pagamento inválido.' }, { status: 400 });
  const config = await getPaymentConfiguration();
  const enabled = method === 'pix' ? config.mercadopago.methods.pix : config.mercadopago.methods.boleto;
  if (!enabled) return NextResponse.json({ error: 'Este método de pagamento não está disponível.' }, { status: 400 });
  const order = await prisma.order.findFirst({ where: { id: body.orderId, customer: { userId: user.id } }, select: { id: true } });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  const payerIdentification = body.payerIdentification;
  if (!payerIdentification || typeof payerIdentification.type !== 'string' || typeof payerIdentification.number !== 'string') return NextResponse.json({ error: 'Identificação do pagador obrigatória.' }, { status: 400 });
  const nameParts = (user.name || 'Cliente').trim().split(/\s+/);
  try {
    const result = await createOfflinePayment(order.id, {
      paymentMethodId: method,
      payerEmail: user.email || '',
      payerFirstName: nameParts[0] || 'Cliente',
      payerLastName: nameParts.slice(1).join(' ') || 'Olhonodoc',
      payerIdentification: { type: payerIdentification.type, number: normalizeDigits(payerIdentification.number) },
    });
    return NextResponse.json({ data: { paymentId: result.payment.id, status: result.status, qrCode: result.qrCode, qrCodeBase64: result.qrCodeBase64, ticketUrl: result.ticketUrl } });
  }
  catch (error) { const code = error instanceof Error ? error.message : ''; const status = code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 503 : code === 'ORDER_NOT_PAYABLE' ? 409 : 502; return NextResponse.json({ error: status === 503 ? 'Pagamento ainda não configurado.' : status === 409 ? 'Este pedido não pode ser pago.' : 'Não foi possível gerar o cobrança.' }, { status }); }
}
