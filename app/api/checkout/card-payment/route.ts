import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCardPayment } from '@/lib/payment-provider';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  void logger.info('payment.card.received', { hasAuth: Boolean(request.headers.get('cookie')) });
  try {
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
    void logger.info('payment.card.validated', { orderId: order.id, method: body.paymentMethodId, installments: body.installments });
    const result = await createCardPayment(order.id, {
      cardToken: body.cardToken,
      paymentMethodId: body.paymentMethodId,
      installments: body.installments,
      payerEmail: user.email || '',
      payerIdentification: { type: payerIdentification.type, number: normalizeDigits(payerIdentification.number) },
      notificationUrl: `${new URL(request.url).origin}/api/webhooks/mercadopago`,
    });
    void logger.info('payment.card.success', { orderId: order.id, paymentId: result.payment.id, status: result.status });
    return NextResponse.json({ data: { paymentId: result.payment.id, status: result.status } });
  }
  catch (error) {
    const code = error instanceof Error ? error.message : '';
    const stack = error instanceof Error ? (error.stack || '').slice(0, 300) : '';
    void logger.error('payment.card.route_failed', { code, stack });
    if (code.startsWith('MP_ERROR: ')) return NextResponse.json({ error: code.slice(9) }, { status: 502 });
    if (code === 'MP_TIMEOUT') return NextResponse.json({ error: 'O Mercado Pago demorou demais para responder. Tente novamente.' }, { status: 504 });
    if (code === 'MP_UNREACHABLE') return NextResponse.json({ error: 'Não foi possível conectar ao Mercado Pago. Verifique a rede do servidor.' }, { status: 502 });
    const status = code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 503 : code === 'ORDER_NOT_PAYABLE' ? 409 : code === 'ORDER_INVALID_AMOUNT' ? 409 : 502;
    return NextResponse.json({ error: status === 503 ? 'Pagamento ainda não configurado.' : status === 409 ? 'Este pedido não pode ser pago.' : 'Não foi possível processar o pagamento.' }, { status });
  }
}
