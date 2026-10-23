import { prisma } from '@/lib/prisma';
import { CompanyQueryStatus } from '@prisma/client';
import { companyAction, getCompanySettings, requestCompanyDetailed, type CompanyProduct, CompanyTransportError } from '@/lib/company-conferi';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import { completeOrder } from '@/lib/order-lifecycle';

const supported = new Set<CompanyProduct>(['conferi-agregados', 'conferi-auto-pericia-gold', 'conferi-bin', 'conferi-estadual', 'conferi-crlv', 'conferi-gravame']);
export const MAX_ATTEMPTS = 3;

function retryable(error: unknown) {
  if (!(error instanceof CompanyTransportError)) return false;
  return ['NETWORK', 'PROVIDER_5XX', 'INVALID_RESPONSE'].includes(error.diagnostic.kind);
}

export async function submitOrderToCompany(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status !== 'PAID' && !order.isBonus) throw new Error('ORDER_NOT_PAID');
  const providerProduct = order.product.providerProduct;
  if (!providerProduct || !supported.has(providerProduct as CompanyProduct)) throw new Error('PRODUCT_NOT_INTEGRATED');
  const normalizedPlate = order.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const existing = await prisma.vehicleQuery.findUnique({ where: { orderId } });
  if (existing?.companyStatus === CompanyQueryStatus.COMPLETED || existing?.companyStatus === CompanyQueryStatus.PROCESSING) return existing;
  if ((existing?.attempts || 0) >= MAX_ATTEMPTS) throw new Error('RETRY_LIMIT_REACHED');
  const config = await getCompanySettings();
  const requestParams = { placa: normalizedPlate, ...(providerProduct === 'conferi-auto-pericia-gold' ? { produto: providerProduct } : {}) };
  const query = existing || await prisma.vehicleQuery.create({ data: { orderId, normalizedPlate, requestParams, provider: 'company-conferi', providerProduct, environment: config.environment, companyStatus: CompanyQueryStatus.SUBMITTED, requestSentAt: new Date() } });
  try {
    const detailed = await requestCompanyDetailed(providerProduct as CompanyProduct, config.environment, { usuario: config.usuario, senha: config.senha }, requestParams, order.product.providerEndpointKey);
    const result = companyAction(detailed.data);
    let pdf: Buffer | null = null;
    try { pdf = await renderGoldPdf(detailed.data, normalizedPlate, result.status, detailed.data.solicitacao?.mensagem || ''); }
    catch (error) { console.error('Company sync: falha ao gerar PDF', error); }
    const updated = await prisma.vehicleQuery.update({ where: { id: query.id }, data: { provider: 'company-conferi', providerProduct, environment: config.environment, companyStatus: result.status as CompanyQueryStatus, providerAction: result.action, providerMessage: detailed.data.solicitacao?.mensagem, providerStatusText: detailed.data.solicitacao?.status, codigoConsulta: detailed.data.solicitacao?.codigoConsulta == null ? null : String(detailed.data.solicitacao.codigoConsulta), hashPesquisa: detailed.data.hashPesquisa, report: detailed.data as object, requestSentAt: query.requestSentAt || new Date(), responseReceivedAt: new Date(), attempts: { increment: 1 }, lastError: null, ...(pdf ? { reportPdf: pdf, reportPdfHash: reportHash(pdf), reportPdfGeneratedAt: new Date() } : {}) } });
    if (result.status === 'COMPLETED') await completeOrder(orderId);
    return updated;
  } catch (error) {
    const attempts = query.attempts + 1;
    const canRetry = retryable(error) && attempts < MAX_ATTEMPTS;
    return prisma.vehicleQuery.update({ where: { id: query.id }, data: { companyStatus: canRetry ? CompanyQueryStatus.SUBMITTED : CompanyQueryStatus.FAILED, lastError: error instanceof Error ? error.message : 'Falha na Company.', attempts, requestSentAt: query.requestSentAt || new Date() } });
  }
}
