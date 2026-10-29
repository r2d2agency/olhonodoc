import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import type { CompanyResponse } from '@/lib/company-conferi';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const query = await prisma.vehicleQuery.findUnique({ where: { id: params.id }, select: { id: true, report: true, normalizedPlate: true, companyStatus: true, providerMessage: true } });
  if (!query) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  if (!query.report || query.companyStatus !== 'COMPLETED') return NextResponse.json({ error: 'Laudo ainda não disponível.' }, { status: 409 });
  try {
    const pdf = Buffer.from(await renderGoldPdf(query.report as unknown as CompanyResponse, query.normalizedPlate, 'COMPLETED', query.providerMessage || ''));
    const hash = reportHash(pdf);
    await prisma.vehicleQuery.update({ where: { id: query.id }, data: { reportPdf: pdf, reportPdfHash: hash, reportPdfGeneratedAt: new Date() } });
    return NextResponse.json({ ok: true, message: 'PDF gerado e disponibilizado para o cliente.' });
  } catch (error) {
    console.error('Admin PDF generate failed', error);
    return NextResponse.json({ error: 'Não foi possível gerar o PDF.' }, { status: 500 });
  }
}