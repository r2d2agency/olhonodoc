import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeEmail } from '@/lib/auth';
import { getCompanySettings, requestCompanyDetailed, companyAction } from '@/lib/company-conferi';
import { prisma } from '@/lib/prisma';

async function knownChassiForPlate(plate: string, email: string) {
  const fromOrder = await prisma.order.findFirst({
    where: { plate, chassi: { not: null }, customer: { email: normalizeEmail(email) } },
    orderBy: { createdAt: 'desc' },
    select: { chassi: true },
  });
  if (fromOrder?.chassi) return fromOrder.chassi;
  const fromQuery = await prisma.vehicleQuery.findFirst({
    where: { normalizedPlate: plate, order: { customer: { email: normalizeEmail(email) } } },
    orderBy: { queriedAt: 'desc' },
    select: { requestParams: true },
  });
  const params = fromQuery?.requestParams as Record<string, unknown> | null;
  const chassi = typeof params?.chassi === 'string' ? params.chassi : null;
  return chassi && chassi.trim() ? chassi.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17) : null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Faça seu cadastro para consultar o veículo.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Informe uma placa válida.' }, { status: 400 });
  try {
    const config = await getCompanySettings();
    const detailed = await requestCompanyDetailed('conferi-agregados', config.environment, { usuario: config.usuario, senha: config.senha }, { placa: plate });
    const result = companyAction(detailed.data);
    const aggregates = (detailed.data.agregados || null) as Record<string, unknown> | null;
    const fromAggregates = aggregates ? (aggregates.chassi ?? aggregates.Chassi ?? aggregates.CHASSI ?? aggregates.numeroChassi ?? aggregates.NumeroChassi) : null;
    const aggChassi = typeof fromAggregates === 'string' ? fromAggregates.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17) : '';
    const knownChassi = aggChassi || await knownChassiForPlate(plate, user.email);
    return NextResponse.json({ data: { status: result.status, action: result.action, httpStatus: detailed.httpStatus, durationMs: detailed.durationMs, request: detailed.data.solicitacao || null, aggregates, hashPesquisa: detailed.data.hashPesquisa || null, knownChassi: knownChassi || null } });
  } catch (error) {
    console.error('[account-aggregates] failed', error instanceof Error ? error.message : error);
    // Mesmo com falha na Company, tenta reaproveitar chassi já conhecido.
    const fallback = await knownChassiForPlate(plate, user.email).catch(() => null);
    if (fallback) return NextResponse.json({ data: { status: 'FAILED', aggregates: null, knownChassi: fallback } });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível consultar os dados do veículo.' }, { status: 502 });
  }
}
