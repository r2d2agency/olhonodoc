import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getCompanySettings, requestCompanyDetailed, companyAction } from '@/lib/company-conferi';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça seu cadastro para consultar o veículo.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Informe uma placa válida.' }, { status: 400 });
  try {
    const config = await getCompanySettings();
    const detailed = await requestCompanyDetailed('conferi-agregados', config.environment, { usuario: config.usuario, senha: config.senha }, { placa: plate });
    const result = companyAction(detailed.data);
    return NextResponse.json({ data: { status: result.status, action: result.action, httpStatus: detailed.httpStatus, durationMs: detailed.durationMs, request: detailed.data.solicitacao || null, aggregates: detailed.data.agregados || null, hashPesquisa: detailed.data.hashPesquisa || null } });
  } catch (error) { console.error('[account-aggregates] failed', error instanceof Error ? error.message : error); return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível consultar os dados do veículo.' }, { status: 502 }); }
}
