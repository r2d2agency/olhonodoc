import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const query = await prisma.vehicleQuery.findUnique({ where: { id: params.id }, select: { id: true, report: true, reportPdf: true, reportPdfHash: true, normalizedPlate: true, companyStatus: true, providerMessage: true } });
  if (!query) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  let pdf: Buffer | null = query.reportPdf ? Buffer.from(query.reportPdf) : null;
  let hash = query.reportPdfHash ?? null;
  if (!pdf && query.report && query.companyStatus === 'COMPLETED') {
    try {
      pdf = Buffer.from(await renderGoldPdf(query.report as unknown as CompanyResponse, query.normalizedPlate, 'COMPLETED', query.providerMessage || ''));
      hash = reportHash(pdf);
      await prisma.vehicleQuery.update({ where: { id: query.id }, data: { reportPdf: pdf, reportPdfHash: hash, reportPdfGeneratedAt: new Date() } });
    } catch (error) { console.error('Admin PDF: falha ao gerar sob demanda', error); }
  }
  if (!pdf) return NextResponse.json({ error: query.companyStatus === 'PROCESSING' ? 'O laudo está sendo processado.' : 'Laudo ainda não disponível.' }, { status: 409 });
  return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="laudo-${query.normalizedPlate}.pdf"`, 'Cache-Control': 'private, no-store', ETag: hash || '' } });
}
