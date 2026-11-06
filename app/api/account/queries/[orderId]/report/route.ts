import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { goldReportHtml } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({
    where: { id: params.orderId, customer: { email: normalizeEmail(user.email) } },
    include: { product: true, query: true },
  });
  if (!order?.query?.report) return NextResponse.json({ error: 'Relatório ainda não disponível.' }, { status: 404 });
  const html = goldReportHtml(order.query.report as CompanyResponse, order.plate, String(order.query.companyStatus || 'COMPLETED'), order.query.providerMessage || 'Consulta concluída');
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
