import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({ where: { id: params.orderId, customer: { userId: user.id, email: user.email } }, include: { product: { select: { name: true } }, query: true } });
  if (!order) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  if (order.status !== 'PAID' && order.status !== 'COMPLETED') return NextResponse.json({ error: 'O pagamento ainda não foi confirmado.' }, { status: 409 });
  if (!order.query?.report) return NextResponse.json({ error: 'O laudo ainda está sendo processado.' }, { status: 409 });
  return new NextResponse(JSON.stringify({ orderId: order.id, product: order.product.name, plate: order.plate, generatedAt: order.query.responseReceivedAt, status: order.query.companyStatus, report: order.query.report }, null, 2), { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': `attachment; filename="laudo-${order.plate}.json"`, 'Cache-Control': 'private, no-store' } });
}
