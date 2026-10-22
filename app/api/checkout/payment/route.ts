import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createPaymentCheckout, getMercadoPagoPublicKey, getPaymentConfiguration } from '@/lib/payment-provider';
import { logger } from '@/lib/logger';
import { sendPaymentChargeEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const body = await request.json().catch(() => null);
    if (typeof body?.orderId !== 'string' || !body.orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
    const order = await (await import('@/lib/prisma')).prisma.order.findFirst({ where: { id: body.orderId, customer: { userId: user.id } }, select: { id: true } });
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    const config = await getPaymentConfiguration();
    void logger.info('payment.checkout.received', { orderId: order.id, activeProvider: config.activeProvider });
    if (config.activeProvider === 'mercadopago') {
      const publicKey = await getMercadoPagoPublicKey();
      return NextResponse.json({ data: { provider: 'mercadopago', publicKey, methods: config.mercadopago.methods } });
    }
    const payment = await createPaymentCheckout(order.id, new URL(request.url).origin);
    void logger.info('payment.checkout.success', { orderId: order.id, paymentId: payment.id, provider: payment.provider });
    // O link de pagamento vai por e-mail para o mesmo endereço da conta, para
    // o cliente não ficar dependente do navegador aberto.
    if (user.email) {
      try {
        const full = await (await import('@/lib/prisma')).prisma.order.findUnique({ where: { id: order.id }, select: { plate: true, totalCents: true, amountCents: true, product: { select: { name: true } } } });
        await sendPaymentChargeEmail(user.email, {
          orderId: order.id,
          plate: full?.plate || '',
          productName: full?.product?.name || 'Consulta veicular',
          amountCents: full?.totalCents ?? full?.amountCents ?? 0,
          method: 'link',
          ticketUrl: payment.checkoutUrl || undefined,
        });
        void logger.info('payment.checkout.email_sent', { orderId: order.id });
      } catch (emailError) {
        void logger.error('payment.checkout.email_failed', { orderId: order.id, message: emailError instanceof Error ? emailError.message : 'erro' });
      }
    }
    return NextResponse.json({ data: { provider: 'asaas', paymentId: payment.id, checkoutUrl: payment.checkoutUrl, payerEmail: user.email || '' } });
  }
  catch (error) {
    const code = error instanceof Error ? error.message : '';
    const stack = error instanceof Error ? (error.stack || '').slice(0, 300) : '';
    void logger.error('payment.checkout.route_failed', { code, stack });
    if (code.startsWith('MP_ERROR: ')) return NextResponse.json({ error: code.slice(9) }, { status: 502 });
    const status = code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 503 : code === 'ORDER_NOT_PAYABLE' ? 409 : code === 'ORDER_INVALID_AMOUNT' ? 409 : 502;
    return NextResponse.json({ error: status === 503 ? 'Pagamento ainda não configurado.' : status === 409 ? 'Este pedido não pode ser pago.' : 'Não foi possível criar o pagamento.' }, { status });
  }
}
