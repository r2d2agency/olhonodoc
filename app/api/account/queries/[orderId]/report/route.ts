import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderReportHtmlForProduct } from '@/lib/report-renderer';

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, customer: { email: normalizeEmail(user.email) } },
    include: { product: true, query: true },
  });
  if (!order?.query?.report) return NextResponse.json({ error: 'Relatório ainda não disponível.' }, { status: 404 });
  const html = await renderReportHtmlForProduct({ providerProduct: order.query.providerProduct, report: order.query.report, plate: order.plate, status: String(order.query.companyStatus || 'COMPLETED'), message: order.query.providerMessage || 'Consulta concluída' });
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
