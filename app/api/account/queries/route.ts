import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const orders = await prisma.order.findMany({ where: { customer: { email: user.email } }, include: { product: { select: { name: true, slug: true } }, query: { select: { normalizedPlate: true, report: true, companyStatus: true, providerMessage: true, providerStatusText: true, codigoConsulta: true, hashPesquisa: true, requestSentAt: true, responseReceivedAt: true, attempts: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json({ data: orders.map((order) => ({ id: order.id, plate: order.plate, status: order.status, createdAt: order.createdAt, product: order.product, query: order.query })) });
}
