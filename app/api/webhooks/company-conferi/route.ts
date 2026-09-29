import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import { getCompanySettings, requestCompany, companyAction, validWebhookToken, type CompanyProduct } from '@/lib/company-conferi';

async function processWebhook(codigo: string, request: Request) {
  if (!codigo) return NextResponse.json({ error: 'codigo_consulta obrigatório.' }, { status: 400 });
  let configured;
  try { configured = await getCompanySettings(); } catch { return NextResponse.json({ error: 'Webhook não configurado.' }, { status: 503 }); }
  const providedToken = new URL(request.url).searchParams.get('token') || request.headers.get('x-company-webhook-token');
  if (!validWebhookToken(providedToken, configured.webhookToken)) return NextResponse.json({ error: 'Webhook não autorizado.' }, { status: 401 });
  const query = await prisma.vehicleQuery.findFirst({ where: { codigoConsulta: codigo }, orderBy: { queriedAt: 'desc' }, include: { order: true } });
  if (query?.order.status !== 'PAID' && !query?.order.isBonus) return NextResponse.json({ error: 'Consulta ainda não liberada.' }, { status: 409 });
  if (!query) return NextResponse.json({ error: 'Consulta não encontrada.' }, { status: 404 });
  if (query.companyStatus === 'COMPLETED' || query.companyStatus === 'NOT_FOUND') return NextResponse.json({ ok: true, duplicate: true });
  if (!query.providerProduct) return NextResponse.json({ error: 'Produto ausente.' }, { status: 503 });
  try {
    const savedParams = query.requestParams && typeof query.requestParams === 'object' ? query.requestParams as Record<string, string> : { placa: query.normalizedPlate };
    const response = await requestCompany(query.providerProduct as CompanyProduct, configured.environment, { usuario: configured.usuario, senha: configured.senha }, { ...savedParams, codigo_consulta: codigo });
    const result = companyAction(response);
    const pdf = query.providerProduct === 'conferi-auto-pericia-gold' ? await renderGoldPdf(response, query.normalizedPlate, result.status, response.solicitacao?.mensagem || '') : null;
    await prisma.vehicleQuery.update({ where: { id: query.id }, data: { report: response as object, companyStatus: result.status, providerAction: result.action, providerMessage: response.solicitacao?.mensagem, providerStatusText: response.solicitacao?.status, hashPesquisa: response.hashPesquisa, responseReceivedAt: new Date(), attempts: { increment: 1 }, ...(pdf ? { reportPdf: pdf, reportPdfHash: reportHash(pdf), reportPdfGeneratedAt: new Date() } : {}) } });
    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) { await prisma.vehicleQuery.update({ where: { id: query.id }, data: { lastError: error instanceof Error ? error.message : 'Falha no re-fetch', attempts: { increment: 1 } } }); return NextResponse.json({ error: 'Re-fetch agendado para nova tentativa.' }, { status: 503 }); }
}

export async function GET(request: Request) { const url = new URL(request.url); return processWebhook(url.searchParams.get('codigo_consulta') || url.searchParams.get('codigoConsulta') || '', request); }
export async function POST(request: Request) { const body = await request.json().catch(() => null); return processWebhook(typeof body?.codigo_consulta === 'string' ? body.codigo_consulta : typeof body?.codigoConsulta === 'string' ? body.codigoConsulta : '', request); }
