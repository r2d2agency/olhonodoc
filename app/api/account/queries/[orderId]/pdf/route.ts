import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export async function GET(_request: Request, { params }: { params: { orderId: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 401 });
  const order = await prisma.order.findFirst({ where: { id: params.orderId, customer: { userId: user.id } }, select: { plate: true, query: { select: { id: true, report: true, reportPdf: true, reportPdfHash: true, normalizedPlate: true, companyStatus: true, providerMessage: true } } } });
  if (!order) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  // Fallback sob demanda: consultas concluídas antes da correção não têm o
  // PDF persistido. Gera na hora a partir do JSON já armazenado e persiste.
  let pdf: Buffer | null = order.query?.reportPdf ? Buffer.from(order.query.reportPdf) : null;
  let hash = order.query?.reportPdfHash ?? null;
  if (!pdf && order.query?.report && order.query.companyStatus === 'COMPLETED') {
    try {
      pdf = Buffer.from(await renderGoldPdf(order.query.report as unknown as CompanyResponse, order.query.normalizedPlate, 'COMPLETED', order.query.providerMessage || ''));
      hash = reportHash(pdf);
      await prisma.vehicleQuery.update({ where: { id: order.query.id }, data: { reportPdf: pdf, reportPdfHash: hash, reportPdfGeneratedAt: new Date() } });
    } catch (error) { console.error('Customer PDF: falha ao gerar sob demanda', error); }
  }
  if (!pdf) return NextResponse.json({ error: order.query?.companyStatus === 'PROCESSING' ? 'O laudo está sendo processado.' : 'Laudo ainda não disponível.' }, { status: 409 });
  return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="laudo-pericia-${order.plate}.pdf"`, 'Cache-Control': 'private, no-store', ETag: hash || '' } });
}
