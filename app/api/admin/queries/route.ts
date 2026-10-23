import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
  try {
    const params = new URL(request.url).searchParams;
    const plate = params.get('plate')?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const product = params.get('product');
    const status = params.get('status');
    const environment = params.get('environment');
    const sent = params.get('sent');
    const received = params.get('received');
    const code = params.get('codigoConsulta');
    const where = { ...(plate ? { normalizedPlate: plate } : {}), ...(product ? { providerProduct: product } : {}), ...(status ? { companyStatus: status as any } : {}), ...(environment ? { environment } : {}), ...(sent === 'true' ? { requestSentAt: { not: null } } : sent === 'false' ? { requestSentAt: null } : {}), ...(received === 'true' ? { responseReceivedAt: { not: null } } : received === 'false' ? { responseReceivedAt: null } : {}), ...(code ? { codigoConsulta: code } : {}) };
    // O PDF fica de fora da listagem: ele é baixado sob demanda por
    // /api/admin/queries/[id]/pdf e serializar os bytes aqui engordaria a
    // resposta sem necessidade.
    const queries = await prisma.vehicleQuery.findMany({
      where,
      select: {
        id: true,
        normalizedPlate: true,
        queriedAt: true,
        provider: true,
        providerProduct: true,
        environment: true,
        companyStatus: true,
        providerAction: true,
        providerMessage: true,
        providerStatusText: true,
        codigoConsulta: true,
        hashPesquisa: true,
        requestSentAt: true,
        responseReceivedAt: true,
        attempts: true,
        lastError: true,
        report: true,
        reportPdfGeneratedAt: true,
        order: { select: { id: true, plate: true, status: true, isBonus: true, createdAt: true, product: { select: { name: true } }, customer: { select: { name: true, email: true } } } },
      },
      orderBy: { queriedAt: 'desc' },
      take: 200,
    });
    return NextResponse.json({ data: queries });
  } catch (error) { console.error('Admin query list failed', error); return NextResponse.json({ error: 'Não foi possível carregar as consultas.' }, { status: 500 }); }
}
