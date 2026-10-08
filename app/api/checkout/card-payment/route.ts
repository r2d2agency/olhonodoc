import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCardPayment } from '@/lib/payment-provider';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== 'string' || !body.orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
  if (typeof body?.cardToken !== 'string' || !body.cardToken) return NextResponse.json({ error: 'cardToken obrigatório.' }, { status: 400 });
  if (typeof body?.paymentMethodId !== 'string' || !body.paymentMethodId) return NextResponse.json({ error: 'paymentMethodId obrigatório.' }, { status: 400 });
  if (typeof body?.installments !== 'number' || body.installments < 1) return NextResponse.json({ error: 'Parcelas inválidas.' }, { status: 400 });
  const order = await prisma.order.findFirst({ where: { id: body.orderId, customer: { userId: user.id } }, select: { id: true } });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  const payerIdentification = body.payerIdentification;
  if (!payerIdentification || typeof payerIdentification.type !== 'string' || typeof payerIdentification.number !== 'string') return NextResponse.json({ error: 'Identificação do pagador obrigatória.' }, { status: 400 });
  try {
    const result = await createCardPayment(order.id, {
      cardToken: body.cardToken,
      paymentMethodId: body.paymentMethodId,
      installments: body.installments,
      payerEmail: user.email || '',
      payerIdentification: { type: payerIdentification.type, number: normalizeDigits(payerIdentification.number) },
    });
    return NextResponse.json({ data: { paymentId: result.payment.id, status: result.status } });
  }
  catch (error) { const code = error instanceof Error ? error.message : ''; const status = code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 503 : code === 'ORDER_NOT_PAYABLE' ? 409 : 502; return NextResponse.json({ error: status === 503 ? 'Pagamento ainda não configurado.' : status === 409 ? 'Este pedido não pode ser pago.' : 'Não foi possível processar o pagamento.' }, { status }); }
}
