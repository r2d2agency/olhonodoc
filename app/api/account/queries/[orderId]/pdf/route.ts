import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({ where: { id: params.orderId, customer: { userId: user.id } }, select: { plate: true, query: { select: { reportPdf: true, reportPdfHash: true, companyStatus: true } } } });
  if (!order) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  if (!order.query?.reportPdf) return NextResponse.json({ error: order.query?.companyStatus === 'PROCESSING' ? 'O laudo está sendo processado.' : 'Laudo ainda não disponível.' }, { status: 409 });
  return new NextResponse(order.query.reportPdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="laudo-pericia-${order.plate}.pdf"`, 'Cache-Control': 'private, no-store', ETag: order.query.reportPdfHash || '' } });
}
