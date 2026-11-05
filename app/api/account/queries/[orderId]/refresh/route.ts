import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { refreshQueryFromCompany } from '@/lib/company-query';

/**
 * Botão "Atualizar status" da área do cliente: reconsulta a Company
 * (re-fetch por codigo_consulta) e promove para análise técnica após 15 min.
 */
export async function POST(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, customer: { email: normalizeEmail(user.email) } },
    select: { id: true },
  });
  if (!order) return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  try {
    const query = await refreshQueryFromCompany(order.id);
    return NextResponse.json({ data: { companyStatus: query.companyStatus, responseReceivedAt: query.responseReceivedAt } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível atualizar.' }, { status: 502 });
  }
}
