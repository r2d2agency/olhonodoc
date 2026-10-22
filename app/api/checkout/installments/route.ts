import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildInstallmentOptions, getMercadoPagoInstallments, getPaymentConfiguration } from '@/lib/payment-provider';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Lista os planos de parcelamento do cartão para o valor de um pedido.
 * Retorna a taxa de juros de cada plano para que o checkout só rotule "sem juros"
 * quando a taxa vier efetivamente zerada do provedor.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const orderId = new URL(request.url).searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
    const order = await prisma.order.findFirst({ where: { id: orderId, customer: { userId: user.id } }, select: { id: true, totalCents: true, amountCents: true } });
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    const amountCents = order.totalCents ?? order.amountCents ?? 0;
    if (!Number.isFinite(amountCents) || amountCents <= 0) return NextResponse.json({ error: 'Pedido sem valor válido.' }, { status: 409 });

    const config = await getPaymentConfiguration();
    if (!config.mercadopago.methods.card) return NextResponse.json({ error: 'Este método de pagamento não está disponível.' }, { status: 400 });

    const methodId = new URL(request.url).searchParams.get('paymentMethodId') || undefined;
    try {
      const plans = await getMercadoPagoInstallments(amountCents, methodId);
      const options = buildInstallmentOptions(plans);
      if (!options.length) return NextResponse.json({ error: 'Nenhuma opção de parcelamento disponível.', installments: [] }, { status: 404 });
      return NextResponse.json({ amountCents, installments: options });
    } catch (error) {
      // Sem acesso à oferta de parcelamento, o checkout continua com a opção de 1x sem juros.
      void logger.warn('checkout.installments.unavailable', { orderId: order.id, message: error instanceof Error ? error.message : 'erro' });
      const options = buildInstallmentOptions([{ quantity: 1, rate: 0, amount: amountCents / 100, total: amountCents / 100, recommended: true, interestFree: true }]);
      return NextResponse.json({ amountCents, installments: options, fallback: true });
    }
  } catch (error) {
    void logger.error('checkout.installments.failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível carregar as parcelas.' }, { status: 500 });
  }
}
