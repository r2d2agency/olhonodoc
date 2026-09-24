import { NextResponse } from 'next/server';
import { requireSuperadmin } from '@/lib/auth';
import { getCompanySettings, requestCompany, companyAction, type CompanyProduct } from '@/lib/company-conferi';
import { prisma } from '@/lib/prisma';

const products: CompanyProduct[] = ['conferi-agregados', 'conferi-auto-pericia-gold', 'conferi-bin', 'conferi-estadual', 'conferi-crlv', 'conferi-gravame'];

export async function POST(request: Request) {
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
    const response = await requestCompany(product as CompanyProduct, config.environment, { usuario: config.usuario, senha: config.senha }, { placa: plate, chassi });
    const result = companyAction(response);
    return NextResponse.json({ data: { product, environment: config.environment, action: result.action, status: result.status, request: response.solicitacao || null, hashPesquisa: response.hashPesquisa || null, response } });
  } catch (error) {
    console.error('[company-test] failed', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível testar a Company.' }, { status: 502 });
  }
}
