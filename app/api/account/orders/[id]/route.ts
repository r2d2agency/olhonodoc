import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncRedemptionCount } from '@/lib/coupons';
import { logger, logRequest } from '@/lib/logger';

/**
 * Exclui um pedido PENDING do cliente (e pagamentos/redemption vinculados por
 * cascade). Pedidos pagos ou concluídos nunca podem ser apagados: são o
 * histórico fiscal da conta.
 */
const DELETE = logRequest('account.orders.cancel', async (request: Request, { params }: { params: { id: string } }) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const order = await prisma.order.findFirst({
      where: { id: params.id, customer: { userId: user.id } },
      select: { id: true, status: true, couponId: true },
    });
    if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
    if (order.status !== 'PENDING') return NextResponse.json({ error: 'Só pedidos pendentes podem ser excluídos.' }, { status: 409 });
    const couponId = order.couponId;
    await prisma.order.delete({ where: { id: order.id } });
    // O cascade remove redemption/pagamentos; o contador do cupom precisa ser
    // recalculado porque o pedido excluído segurava um resgate ativo.
    if (couponId) await syncRedemptionCount(prisma, couponId).catch(() => undefined);
    void logger.info('account.orders.cancelled', { orderId: order.id });
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    void logger.error('account.orders.cancel_failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível excluir o pedido.' }, { status: 500 });
  }
});

export { DELETE };
