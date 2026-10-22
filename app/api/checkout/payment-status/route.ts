import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processPaymentEvent, providerPaymentStatus } from '@/lib/payment-webhook';
import { logger, logRequest } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Consulta o status real de um pagamento no provedor. Serve ao botão "Já paguei",
 * que até agora apenas redirecionava o cliente sem confirmar nada.
 */
const GET = logRequest('checkout.payment-status', async (request: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const orderId = new URL(request.url).searchParams.get('orderId');
    if (!orderId) return NextResponse.json({ error: 'orderId obrigatório.' }, { status: 400 });
    const order = await prisma.order.findFirst({ where: { id: orderId, customer: { userId: user.id } }, select: { id: true, status: true } });
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    if (order.status === 'PAID' || order.status === 'COMPLETED') return NextResponse.json({ data: { status: 'APPROVED', orderStatus: order.status } });

    // Um pedido pode ter mais de uma tentativa (cartão, Pix, boleto). Preferimos a
    // transação ainda em aberto; só caímos na mais recente quando todas já têm desfecho.
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, provider: true, externalId: true, status: true, createdAt: true },
    });
    const payment = payments.find(item => ['PENDING', 'IN_PROCESS', 'AUTHORIZED'].includes(item.status)) || payments[0];
    if (!payment) return NextResponse.json({ error: 'Ainda não há pagamento para este pedido.' }, { status: 404 });
    if (!payment.externalId) return NextResponse.json({ data: { status: 'PENDING', orderStatus: order.status } });

    const providerResult = await providerPaymentStatus(payment.provider, payment.externalId);
    const eventId = `status-check:${payment.id}:${providerResult.status}:${payment.externalId}`;
    const outcome = await processPaymentEvent(payment.provider, eventId, payment.externalId, providerResult.status, providerResult.data, 'status_check');
    const updated = await prisma.order.findUnique({ where: { id: order.id }, select: { status: true } });
    void logger.info('checkout.payment_status.checked', { orderId: order.id, status: providerResult.status, orderStatus: updated?.status, outcome });
    return NextResponse.json({ data: { status: providerResult.status, orderStatus: updated?.status } });
  } catch (error) {
    void logger.error('checkout.payment_status.failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível consultar o status do pagamento.' }, { status: 502 });
  }
});

export { GET };
