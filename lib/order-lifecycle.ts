import { prisma } from '@/lib/prisma';

/**
 * Move o pedido de PAID para COMPLETED. A consulta só é considerada entregue
 * quando o provedor (Company) responde com o relatório final.
 * Transições a partir de outros estados são ignoradas.
 */
export async function completeOrder(orderId: string) {
  return prisma.order.updateMany({ where: { id: orderId, status: 'PAID' }, data: { status: 'COMPLETED' } });
}
