import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCardPayment, getPaymentConfiguration, getMercadoPagoInstallments } from '@/lib/payment-provider';
import { logger, logRequest } from '@/lib/logger';
import { sendPaymentChargeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const POST = logRequest('checkout.card-payment', async (request: Request) => {
  void logger.info('payment.card.received', { hasAuth: Boolean(request.headers.get('cookie')) });
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (typeof body?.orderId !== 'string' || !body.orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
    if (typeof body?.cardToken !== 'string' || !body.cardToken) return NextResponse.json({ error: 'cardToken obrigatório.' }, { status: 400 });
    if (typeof body?.paymentMethodId !== 'string' || !body.paymentMethodId) return NextResponse.json({ error: 'paymentMethodId obrigatório.' }, { status: 400 });
    if (typeof body?.installments !== 'number' || !Number.isInteger(body.installments) || body.installments < 1) return NextResponse.json({ error: 'Parcelas inválidas.' }, { status: 400 });
    const order = await prisma.order.findFirst({ where: { id: body.orderId, customer: { userId: user.id } }, select: { id: true, plate: true, totalCents: true, amountCents: true, subtotalCents: true, discountCents: true, coupon: { select: { code: true } }, product: { select: { name: true } } } });
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    const payerIdentification = body.payerIdentification;
    if (!payerIdentification || typeof payerIdentification.type !== 'string' || typeof payerIdentification.number !== 'string') return NextResponse.json({ error: 'Identificação do pagador obrigatória.' }, { status: 400 });
    // O e-mail identifica o pagador junto ao provedor: sem ele a cobrança é
    // recusada. A tela manda o e-mail do perfil; a conta é a reserva.
    const payerEmail = (typeof body.payerEmail === 'string' && body.payerEmail.trim() ? body.payerEmail.trim() : (user.email || '').trim());
    if (!payerEmail) return NextResponse.json({ error: 'Não foi possível identificar seu e-mail. Recarregue a página e entre novamente com sua conta.' }, { status: 400 });

    // O método precisa estar habilitado no painel; o toggle do admin vale no servidor.
    const config = await getPaymentConfiguration();
    if (!config.mercadopago.methods.card) {
      void logger.warn('payment.card.method_disabled', { orderId: order.id });
      return NextResponse.json({ error: 'Este método de pagamento não está disponível.' }, { status: 400 });
    }

    // Revalida o plano de parcelamento escolhido contra a oferta real do provedor.
    const amountCents = await prisma.order.findUnique({ where: { id: order.id }, select: { totalCents: true, amountCents: true } }).then(row => row?.totalCents ?? row?.amountCents ?? 0);
    try {
      const plans = await getMercadoPagoInstallments(amountCents, body.paymentMethodId);
      const chosen = plans.find(plan => plan.quantity === body.installments);
      if (!chosen) {
        void logger.warn('payment.card.installment_not_offered', { orderId: order.id, installments: body.installments });
        return NextResponse.json({ error: 'Esta quantidade de parcelas não está disponível. Escolha outra opção.' }, { status: 400 });
      }
    } catch (error) {
      // Se o provedor não conseguir listar os planos, segue com a quantidade pedida:
      // o Mercado Pago ainda valida a parcelagem no momento da cobrança.
      void logger.warn('payment.card.installment_check_unavailable', { orderId: order.id, message: error instanceof Error ? error.message : 'erro' });
    }

    void logger.info('payment.card.validated', { orderId: order.id, method: body.paymentMethodId, installments: body.installments });
    const result = await createCardPayment(order.id, {
      cardToken: body.cardToken,
      paymentMethodId: body.paymentMethodId,
      installments: body.installments,
      payerEmail,
      payerIdentification: { type: payerIdentification.type, number: normalizeDigits(payerIdentification.number) },
      notificationUrl: `${new URL(request.url).origin}/api/webhooks/mercadopago`,
    });
    void logger.info('payment.card.success', { orderId: order.id, paymentId: result.payment.id, status: result.status });
    // A cobrança aprovada vai por e-mail para o mesmo endereço enviado ao
    // provedor. Falha no e-mail não invalida o pagamento: o cliente continua
    // vendo a confirmação na tela.
    if (['APPROVED', 'AUTHORIZED', 'IN_PROCESS'].includes(result.status)) {
      try {
        await sendPaymentChargeEmail(payerEmail, {
          orderId: order.id,
          plate: order.plate,
          productName: order.product?.name || 'Consulta veicular',
          amountCents: order.totalCents ?? order.amountCents ?? 0,
          subtotalCents: order.subtotalCents ?? undefined,
          discountCents: order.discountCents || undefined,
          couponCode: order.coupon?.code,
          method: 'card',
        });
        void logger.info('payment.card.email_sent', { orderId: order.id, status: result.status });
      } catch (emailError) {
        void logger.error('payment.card.email_failed', { orderId: order.id, message: emailError instanceof Error ? emailError.message : 'erro' });
      }
    }
    return NextResponse.json({ data: { paymentId: result.payment.id, status: result.status, payerEmail } });
  }
  catch (error) {
    const code = error instanceof Error ? error.message : '';
    const stack = error instanceof Error ? (error.stack || '').slice(0, 300) : '';
    void logger.error('payment.card.route_failed', { code, stack });
    if (code.startsWith('MP_ERROR: ')) return NextResponse.json({ error: `O Mercado Pago recusou o pagamento: ${code.slice(9)}` }, { status: 502 });
    if (code === 'MP_TIMEOUT') return NextResponse.json({ error: 'O Mercado Pago demorou demais para responder. Tente novamente.' }, { status: 504 });
    if (code === 'MP_UNREACHABLE') return NextResponse.json({ error: 'Não foi possível conectar ao Mercado Pago. Verifique a rede do servidor.' }, { status: 502 });
    const status = code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 503
      : code === 'PAYMENT_METHOD_DISABLED' ? 400
      : code === 'ORDER_NOT_PAYABLE' ? 409
      : code === 'ORDER_INVALID_AMOUNT' ? 409
      : code === 'PAYER_EMAIL_REQUIRED' ? 400
      : 502;
    const message = status === 503 ? 'Pagamento ainda não configurado.'
      : status === 400 ? (code === 'PAYER_EMAIL_REQUIRED' ? 'Não foi possível identificar o pagador. Entre novamente com sua conta.' : 'Este método de pagamento não está disponível.')
      : status === 409 ? 'Este pedido não pode ser pago.'
      : 'Não foi possível processar o pagamento.';
    return NextResponse.json({ error: message }, { status });
  }
});

export { POST };
