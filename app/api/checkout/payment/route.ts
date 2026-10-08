import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createPaymentCheckout, getMercadoPagoPublicKey } from '@/lib/payment-provider';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.orderId !== 'string' || !body.orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
  const order = await (await import('@/lib/prisma')).prisma.order.findFirst({ where: { id: body.orderId, customer: { userId: user.id } }, select: { id: true } });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  try {
    const config = await (await import('@/lib/payment-provider')).getPaymentConfiguration();
    if (config.activeProvider === 'mercadopago') {
      const publicKey = await getMercadoPagoPublicKey();
      return NextResponse.json({ data: { provider: 'mercadopago', publicKey } });
    }
    const payment = await createPaymentCheckout(order.id, new URL(request.url).origin);
    return NextResponse.json({ data: { provider: 'asaas', paymentId: payment.id, checkoutUrl: payment.checkoutUrl } });
  }
  catch (error) { const code = error instanceof Error ? error.message : ''; const status = code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' ? 503 : code === 'ORDER_NOT_PAYABLE' ? 409 : 502; return NextResponse.json({ error: status === 503 ? 'Pagamento ainda não configurado.' : status === 409 ? 'Este pedido não pode ser pago.' : 'Não foi possível criar o pagamento.' }, { status }); }
}
