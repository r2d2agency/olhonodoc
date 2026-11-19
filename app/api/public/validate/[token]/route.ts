import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Validação pública de consulta: recebe o token (hashPesquisa) e devolve só dados básicos. */
export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const token = decodeURIComponent(params.token || '');
    if (!token || token.length < 8) return NextResponse.json({ valid: false, error: 'Token inválido.' }, { status: 400 });
    const query = await prisma.vehicleQuery.findFirst({
      where: { hashPesquisa: token },
      select: {
        normalizedPlate: true, queriedAt: true, companyStatus: true,
        providerProduct: true, codigoConsulta: true, responseReceivedAt: true,
        reportPdfGeneratedAt: true, reportPdfHash: true,
        order: { select: { product: { select: { name: true } }, status: true } },
      },
      orderBy: { queriedAt: 'desc' },
    });
    if (!query) return NextResponse.json({ valid: false, error: 'Consulta não encontrada.' }, { status: 404 });
    return NextResponse.json({
      valid: true,
      placa: query.normalizedPlate,
      realizadaEm: query.queriedAt,
      status: query.companyStatus,
      produto: query.order?.product?.name || 'Auto Perícia Gold',
      codigoConsulta: query.codigoConsulta,
      pdfHash: query.reportPdfHash ? query.reportPdfHash.slice(0, 16) : null,
      origem: 'Olho no Doc',
    });
  } catch {
    return NextResponse.json({ valid: false, error: 'Não foi possível validar.' }, { status: 500 });
  }
}
