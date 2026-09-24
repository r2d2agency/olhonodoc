import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { getCompanySettings, requestCompanyDetailed, companyAction, CompanyTransportError, type CompanyProduct } from '@/lib/company-conferi';
import { prisma } from '@/lib/prisma';

const products: CompanyProduct[] = ['conferi-agregados', 'conferi-auto-pericia-gold', 'conferi-bin', 'conferi-estadual', 'conferi-crlv', 'conferi-gravame'];

export async function POST(request: Request) {
  try {
    const user = await requireSuperadmin();
    if (!user) return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    const body = await request.json().catch(() => null);
  const product = typeof body?.product === 'string' ? body.product : '';
  const plate = typeof body?.plate === 'string' ? body.plate : undefined;
  const chassi = typeof body?.chassi === 'string' ? body.chassi : undefined;
  if (!products.includes(product as CompanyProduct)) return NextResponse.json({ error: 'Produto Company inválido.' }, { status: 400 });
  if (!plate && !chassi) return NextResponse.json({ error: 'Informe placa ou chassi.' }, { status: 400 });
  try {
    const config = await getCompanySettings();
    const detailed = await requestCompanyDetailed(product as CompanyProduct, config.environment, { usuario: config.usuario, senha: config.senha }, { placa: plate, chassi });
    const result = companyAction(detailed.data);
    return NextResponse.json({ data: { product, environment: config.environment, action: result.action, status: result.status, httpStatus: detailed.httpStatus, contentType: detailed.contentType, durationMs: detailed.durationMs, endpoint: detailed.endpoint, request: detailed.data.solicitacao || null, hashPesquisa: detailed.data.hashPesquisa || null, response: detailed.data } });
  } catch (error) {
    console.error('[company-test] failed', error instanceof Error ? error.message : error);
    if (error instanceof CompanyTransportError) return NextResponse.json({ error: error.message, diagnostic: error.diagnostic }, { status: 200 });
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível testar a Company.' }, { status: 200 });
    }
  } catch (error) {
    console.error('[company-test] route failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Falha interna ao preparar o teste da Company.' }, { status: 500 });
  }
}
