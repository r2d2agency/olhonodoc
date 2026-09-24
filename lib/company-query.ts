import { prisma } from '@/lib/prisma';
import { CompanyQueryStatus } from '@prisma/client';
import { companyAction, getCompanySettings, requestCompanyDetailed, type CompanyProduct } from '@/lib/company-conferi';

const supported = new Set<CompanyProduct>(['conferi-agregados', 'conferi-auto-pericia-gold', 'conferi-bin', 'conferi-estadual', 'conferi-crlv', 'conferi-gravame']);

export async function submitOrderToCompany(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  const providerProduct = order.product.providerProduct;
  if (!providerProduct || !supported.has(providerProduct as CompanyProduct)) throw new Error('PRODUCT_NOT_INTEGRATED');
  const normalizedPlate = order.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const existing = await prisma.vehicleQuery.findUnique({ where: { orderId } });
  if (existing?.companyStatus === CompanyQueryStatus.COMPLETED || existing?.companyStatus === CompanyQueryStatus.PROCESSING) return existing;
  const config = await getCompanySettings();
  const requestParams = { placa: normalizedPlate, ...(providerProduct === 'conferi-auto-pericia-gold' ? { produto: providerProduct } : {}) };
  const query = existing || await prisma.vehicleQuery.create({ data: { orderId, normalizedPlate, requestParams, provider: 'company-conferi', providerProduct, environment: config.environment, companyStatus: CompanyQueryStatus.SUBMITTED, requestSentAt: new Date() } });
  try {
    const detailed = await requestCompanyDetailed(providerProduct as CompanyProduct, config.environment, { usuario: config.usuario, senha: config.senha }, { placa: normalizedPlate, ...(providerProduct === 'conferi-auto-pericia-gold' ? { produto: providerProduct } : {}) });
    const result = companyAction(detailed.data);
    return prisma.vehicleQuery.update({ where: { id: query.id }, data: { provider: 'company-conferi', providerProduct, environment: config.environment, companyStatus: result.status as CompanyQueryStatus, providerAction: result.action, providerMessage: detailed.data.solicitacao?.mensagem, providerStatusText: detailed.data.solicitacao?.status, codigoConsulta: detailed.data.solicitacao?.codigoConsulta, hashPesquisa: detailed.data.hashPesquisa, report: detailed.data as object, requestSentAt: query.requestSentAt || new Date(), responseReceivedAt: new Date(), attempts: { increment: 1 } } });
  } catch (error) {
    return prisma.vehicleQuery.update({ where: { id: query.id }, data: { companyStatus: CompanyQueryStatus.FAILED, lastError: error instanceof Error ? error.message : 'Falha na Company.', attempts: { increment: 1 }, requestSentAt: query.requestSentAt || new Date() } });
  }
}
