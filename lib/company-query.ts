import { prisma } from '@/lib/prisma';
import { CompanyQueryStatus } from '@prisma/client';
import { companyAction, getCompanySettings, requestCompany, requestCompanyDetailed, type CompanyProduct, CompanyTransportError } from '@/lib/company-conferi';
import { renderGoldPdf, reportHash } from '@/lib/gold-report';
import { renderGravamePdf, gravameReportHash } from '@/lib/gravame-report';
import { completeOrder } from '@/lib/order-lifecycle';
import { sendQueryCompleted, sendQueryInAnalysis, sendQueryProcessing } from '@/lib/email';

const supported = new Set<CompanyProduct>(['conferi-agregados', 'conferi-auto-veiculo', 'conferi-auto-pericia-gold', 'conferi-bin', 'conferi-estadual', 'conferi-crlv', 'conferi-gravame']);
export const MAX_ATTEMPTS = 3;
/** Após esse tempo em PROCESSING, a consulta vai para a Mesa de Análise Técnica. */
export const ANALYSIS_THRESHOLD_MS = 15 * 60 * 1000;

async function renderReportPdf(providerProduct: string, data: unknown, plate: string, status: string, message: string, customerName?: string): Promise<{ pdf: Buffer; hash: string } | null> {
  try {
    if (providerProduct === 'conferi-gravame') {
      const pdf = Buffer.from(await renderGravamePdf(data, plate, customerName));
      return { pdf, hash: gravameReportHash(pdf) };
    }
    const pdf = Buffer.from(await renderGoldPdf(data as any, plate, status, message));
    return { pdf, hash: reportHash(pdf) };
  } catch (error) {
    console.error(`[company-query] falha ao gerar PDF (${providerProduct}):`, error);
    return null;
  }
}

function retryable(error: unknown) {
  if (!(error instanceof CompanyTransportError)) return false;
  return ['NETWORK', 'PROVIDER_5XX', 'INVALID_RESPONSE'].includes(error.diagnostic.kind);
}

async function notifySafely(send: () => Promise<void>, context: string) {
  try { await send(); }
  catch (error) { console.error(`[company-query] ${context}:`, error instanceof Error ? error.message : error); }
}

async function loadNotifyTarget(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: { select: { name: true } }, customer: { select: { email: true, name: true } } },
  });
  if (!order?.customer?.email) return null;
  return { email: order.customer.email, name: order.customer.name || 'Cliente', plate: order.plate, productName: order.product.name };
}

function reportUrlFor(orderId: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || '').replace(/\/$/, '');
  return base ? `${base}/minha-conta?pedido=${orderId}` : '/minha-conta';
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
  const requestParams: Record<string, string> = { placa: normalizedPlate, ...(providerProduct === 'conferi-auto-pericia-gold' || providerProduct === 'conferi-auto-veiculo' ? { produto: providerProduct } : {}) };
  const orderChassi = typeof (order as { chassi?: unknown }).chassi === 'string' ? String((order as { chassi?: unknown }).chassi).toUpperCase() : '';
  if (providerProduct === 'conferi-gravame' && orderChassi) requestParams.chassi = orderChassi;
  const query = existing || await prisma.vehicleQuery.create({ data: { orderId, normalizedPlate, requestParams, provider: 'company-conferi', providerProduct, environment: config.environment, companyStatus: CompanyQueryStatus.SUBMITTED, requestSentAt: new Date() } });
  try {
    const detailed = await requestCompanyDetailed(providerProduct as CompanyProduct, config.environment, { usuario: config.usuario, senha: config.senha }, requestParams, order.product.providerEndpointKey);
    const result = companyAction(detailed.data);
    const notifyTarget = await loadNotifyTarget(orderId);
    const rendered = await renderReportPdf(providerProduct, detailed.data, normalizedPlate, result.status, detailed.data.solicitacao?.mensagem || '', notifyTarget?.name);
    const pdf = rendered?.pdf || null;
    console.log('[company-query] RESPOSTA COMPLETA:', JSON.stringify(detailed.data));
    const updated = await prisma.vehicleQuery.update({ where: { id: query.id }, data: { provider: 'company-conferi', providerProduct, environment: config.environment, companyStatus: result.status as CompanyQueryStatus, providerAction: result.action, providerMessage: detailed.data.solicitacao?.mensagem, providerStatusText: detailed.data.solicitacao?.status, codigoConsulta: detailed.data.solicitacao?.codigoConsulta == null ? null : String(detailed.data.solicitacao.codigoConsulta), hashPesquisa: detailed.data.hashPesquisa, report: detailed.data as object, requestSentAt: query.requestSentAt || new Date(), responseReceivedAt: new Date(), attempts: { increment: 1 }, lastError: null, ...(rendered ? { reportPdf: rendered.pdf, reportPdfHash: rendered.hash, reportPdfGeneratedAt: new Date() } : {}) } });
    if (result.status === 'COMPLETED') {
      await completeOrder(orderId);
      const target = await loadNotifyTarget(orderId);
      if (target) {
        const fresh = await prisma.vehicleQuery.findUnique({ where: { id: query.id }, select: { completedNotifiedAt: true } });
        if (!fresh?.completedNotifiedAt) {
          await notifySafely(() => sendQueryCompleted(target.email, target.name, target.plate, target.productName, reportUrlFor(orderId)), 'e-mail de conclusão');
          await prisma.vehicleQuery.update({ where: { id: query.id }, data: { completedNotifiedAt: new Date() } }).catch(() => undefined);
        }
      }
    }
    if (result.status === 'PROCESSING') {
      const target = await loadNotifyTarget(orderId);
      if (target) await notifySafely(() => sendQueryProcessing(target.email, target.name, target.plate, target.productName), 'e-mail de processamento');
    }
    return updated;
  } catch (error) {
    const attempts = query.attempts + 1;
    const canRetry = retryable(error) && attempts < MAX_ATTEMPTS;
    return prisma.vehicleQuery.update({ where: { id: query.id }, data: { companyStatus: canRetry ? CompanyQueryStatus.SUBMITTED : CompanyQueryStatus.FAILED, lastError: error instanceof Error ? error.message : 'Falha na Company.', attempts, requestSentAt: query.requestSentAt || new Date() } });
  }
}

/**
 * Reconsulta a Company usando o codigo_consulta salvo e promove para
 * IN_ANALYSIS quando o processamento passar de 15 minutos.
 * Chamado pelo botão "Atualizar status" da área do cliente e pelo admin.
 * Retorna a query atualizada.
 */
export async function refreshQueryFromCompany(orderId: string) {
  const existing = await prisma.vehicleQuery.findUnique({ where: { orderId }, include: { order: { include: { product: true } } } });
  if (!existing) throw new Error('QUERY_NOT_FOUND');
  if (existing.companyStatus === 'COMPLETED' || existing.companyStatus === 'NOT_FOUND') return existing;
  const sentAt = existing.requestSentAt?.getTime() || existing.queriedAt.getTime();
  const elapsed = Date.now() - sentAt;

  // Passou de 15 min e continua pendente: Mesa de Análise Técnica.
  if (elapsed >= ANALYSIS_THRESHOLD_MS && existing.companyStatus !== 'IN_ANALYSIS') {
    const updated = await prisma.vehicleQuery.update({ where: { id: existing.id }, data: { companyStatus: CompanyQueryStatus.IN_ANALYSIS } });
    if (!existing.analysisNotifiedAt) {
      const target = await loadNotifyTarget(orderId);
      if (target) {
        await notifySafely(() => sendQueryInAnalysis(target.email, target.name, target.plate, existing.order.product.name), 'e-mail de análise técnica');
        await prisma.vehicleQuery.update({ where: { id: existing.id }, data: { analysisNotifiedAt: new Date() } }).catch(() => undefined);
      }
    }
    // Ainda tenta o re-fetch abaixo: a Company pode ter concluído.
    try { return await refetchByCodigo(existing); }
    catch { return updated; }
  }

  if (!existing.codigoConsulta || !existing.providerProduct) return existing;
  return refetchByCodigo(existing);
}

async function refetchByCodigo(existing: { id: string; orderId: string; normalizedPlate: string; providerProduct: string | null; codigoConsulta: string | null; requestParams: unknown; requestSentAt: Date | null; responseReceivedAt: Date | null; companyStatus: CompanyQueryStatus | null; attempts: number }) {
  const config = await getCompanySettings();
  const order = await prisma.order.findUnique({ where: { id: existing.orderId }, include: { product: true } });
  const savedParams = existing.requestParams && typeof existing.requestParams === 'object'
    ? existing.requestParams as Record<string, string>
    : { placa: existing.normalizedPlate };
  try {
    const response = await requestCompany(existing.providerProduct as CompanyProduct, config.environment, { usuario: config.usuario, senha: config.senha }, { ...savedParams, codigo_consulta: existing.codigoConsulta || '' }, order?.product?.providerEndpointKey);
    const result = companyAction(response);
    const notifyTarget = await loadNotifyTarget(existing.orderId);
    const rendered = await renderReportPdf(existing.providerProduct || '', response, existing.normalizedPlate, result.status, response.solicitacao?.mensagem || '', notifyTarget?.name);
console.log('[company-query] RESPOSTA COMPLETA (refresh):', JSON.stringify(response));
    const updated = await prisma.vehicleQuery.update({ where: { id: existing.id }, data: { companyStatus: result.status as CompanyQueryStatus, providerAction: result.action, providerMessage: response.solicitacao?.mensagem, providerStatusText: response.solicitacao?.status, hashPesquisa: response.hashPesquisa, report: response as object, responseReceivedAt: new Date(), attempts: { increment: 1 }, lastError: null, ...(rendered ? { reportPdf: rendered.pdf, reportPdfHash: rendered.hash, reportPdfGeneratedAt: new Date() } : {}) } });
    if (result.status === 'COMPLETED') {
      await completeOrder(existing.orderId);
      const target = await loadNotifyTarget(existing.orderId);
      if (target) {
        const fresh = await prisma.vehicleQuery.findUnique({ where: { id: existing.id }, select: { completedNotifiedAt: true } });
        if (!fresh?.completedNotifiedAt) {
          await notifySafely(() => sendQueryCompleted(target.email, target.name, target.plate, target.productName, reportUrlFor(existing.orderId)), 'e-mail de conclusão');
          await prisma.vehicleQuery.update({ where: { id: existing.id }, data: { completedNotifiedAt: new Date() } }).catch(() => undefined);
        }
      }
    }
    return updated;
  } catch (error) {
    await prisma.vehicleQuery.update({ where: { id: existing.id }, data: { lastError: error instanceof Error ? error.message : 'Falha no re-fetch', attempts: { increment: 1 } } }).catch(() => undefined);
    return existing;
  }
}
