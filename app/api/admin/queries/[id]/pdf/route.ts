import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  const query = await prisma.vehicleQuery.findUnique({ where: { id: params.id }, select: { reportPdf: true, reportPdfHash: true, reportPdfGeneratedAt: true, normalizedPlate: true, companyStatus: true } });
  if (!query) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  if (!query.reportPdf) return NextResponse.json({ error: query.companyStatus === 'PROCESSING' ? 'O laudo está sendo processado.' : 'Laudo ainda não disponível.' }, { status: 409 });
  return new NextResponse(query.reportPdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="laudo-${query.normalizedPlate}.pdf"`, 'Cache-Control': 'private, no-store', ETag: query.reportPdfHash || '' } });
}
