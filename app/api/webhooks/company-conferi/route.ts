import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCompanySettings, validWebhookToken, requestCompany, companyAction, type CompanyProduct } from '@/lib/company-conferi';

export async function POST(request: Request) {
  let configured;
  try { configured = await getCompanySettings(); } catch { return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 }); }
  if (!validWebhookToken(request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('x-company-webhook-token'), configured.webhookToken)) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const codigo = typeof body?.codigo_consulta === 'string' ? body.codigo_consulta : typeof body?.codigoConsulta === 'string' ? body.codigoConsulta : '';
  if (!codigo) return NextResponse.json({ error: 'codigo_consulta obrigatório.' }, { status: 400 });
  const query = await prisma.vehicleQuery.findFirst({ where: { codigoConsulta: codigo }, orderBy: { queriedAt: 'desc' } });
  if (!query) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  if (query.companyStatus === 'COMPLETED' || query.companyStatus === 'NOT_FOUND') return NextResponse.json({ ok: true, duplicate: true });
  if (!query.providerProduct) return NextResponse.json({ error: 'Produto ausente.' }, { status: 503 });
  try {
    const response = await requestCompany(query.providerProduct as CompanyProduct, configured.environment, { usuario: configured.usuario, senha: configured.senha }, { placa: query.normalizedPlate, codigo_consulta: codigo });
    const result = companyAction(response);
    await prisma.vehicleQuery.update({ where: { id: query.id }, data: { report: response as object, companyStatus: result.status, providerAction: result.action, providerMessage: response.solicitacao?.mensagem, providerStatusText: response.solicitacao?.status, hashPesquisa: response.hashPesquisa, responseReceivedAt: new Date(), attempts: { increment: 1 } } });
    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) { await prisma.vehicleQuery.update({ where: { id: query.id }, data: { lastError: error instanceof Error ? error.message : 'Falha no re-fetch', attempts: { increment: 1 } } }); return NextResponse.json({ error: 'Re-fetch agendado para nova tentativa.' }, { status: 503 }); }
}
