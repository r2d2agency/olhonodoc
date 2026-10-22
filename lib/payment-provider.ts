import { prisma } from '@/lib/prisma';
import { decryptSmtpPassword, encryptSmtpPassword } from '@/lib/smtp-settings';
import { logger } from '@/lib/logger';

export type PaymentProvider = 'mercadopago' | 'asaas' | 'none';
export type PaymentEnvironment = 'sandbox' | 'production';
export type NormalizedPaymentStatus = 'PENDING' | 'APPROVED' | 'AUTHORIZED' | 'IN_PROCESS' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' | 'EXPIRED';
export type PaymentMethodId = 'card' | 'pix' | 'boleto';

const KEY = 'payment.providers';

/**
 * A API do Mercado Pago é única para produção e homologação: em sandbox o acesso usa
 * a mesma base, mas com credenciais e dados de teste. Trocar de host quebraria a
 * Orders API, que não é servida em `sandbox.mercadopago.com`. A diferença de ambiente
 * aparece apenas nos pontos de checkout retornados (`init_point` vs `sandbox_init_point`).
 */
const MP_API_HOST = 'https://api.mercadopago.com';

function mpHost(_environment: PaymentEnvironment) {
  return MP_API_HOST;
}

export type InstallmentPlan = {
  quantity: number;
  rate: number;
  amount: number;
  total: number;
  recommended: boolean;
  interestFree: boolean;
};

export type InstallmentOption = {
  quantity: number;
  label: string;
  amount: number;
  total: number;
  rate: number;
  interestFree: boolean;
  recommended: boolean;
};

function decryptSecret(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  try {
    return decryptSmtpPassword(value);
  } catch (error) {
    void logger.error('payment.secret.decrypt_failed', { message: error instanceof Error ? error.message : 'erro' });
    return '';
  }
}

/** Sem `SMTP_ENCRYPTION_KEY` não dá para cifrar; nesse caso o segredo fica legível no banco. */
function encryptSecret(value: string) {
  if (!value) return '';
  try {
    return encryptSmtpPassword(value);
  } catch (error) {
    void logger.error('payment.secret.encrypt_failed', { message: error instanceof Error ? error.message : 'erro' });
    return value;
  }
}

export async function getPaymentConfiguration() {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const value = row?.value as Record<string, any> | undefined;
  return {
    activeProvider: (value?.activeProvider || 'none') as PaymentProvider,
    environment: (value?.environment || 'sandbox') as PaymentEnvironment,
    mercadopago: {
      accessToken: decryptSecret(value?.mercadopago?.accessToken),
      publicKey: value?.mercadopago?.publicKey || '',
      webhookSecret: decryptSecret(value?.mercadopago?.webhookSecret),
      methods: {
        card: value?.mercadopago?.methods?.card !== false,
        pix: value?.mercadopago?.methods?.pix !== false,
        boleto: value?.mercadopago?.methods?.boleto !== false,
      },
    },
    asaas: {
      apiKey: decryptSecret(value?.asaas?.apiKey),
      webhookToken: decryptSecret(value?.asaas?.webhookToken),
    },
    lastTestedAt: value?.lastTestedAt || null,
  };
}

export async function savePaymentConfiguration(input: any) {
  const current = await getPaymentConfiguration();
  const value = {
    activeProvider: input.activeProvider,
    environment: input.environment,
    mercadopago: {
      accessToken: input.mercadopago?.accessToken ? encryptSecret(input.mercadopago.accessToken) : current.mercadopago.accessToken ? encryptSecret(current.mercadopago.accessToken) : '',
      publicKey: input.mercadopago?.publicKey || current.mercadopago.publicKey,
      webhookSecret: input.mercadopago?.webhookSecret ? encryptSecret(input.mercadopago.webhookSecret) : current.mercadopago.webhookSecret ? encryptSecret(current.mercadopago.webhookSecret) : '',
      methods: input.mercadopago?.methods || current.mercadopago.methods,
    },
    asaas: {
      apiKey: input.asaas?.apiKey ? encryptSecret(input.asaas.apiKey) : current.asaas.apiKey ? encryptSecret(current.asaas.apiKey) : '',
      webhookToken: input.asaas?.webhookToken ? encryptSecret(input.asaas.webhookToken) : current.asaas.webhookToken ? encryptSecret(current.asaas.webhookToken) : '',
    },
    lastTestedAt: current.lastTestedAt,
  };
  await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } });
}

/** Persiste o instante do último teste bem-sucedido de conexão. */
export async function savePaymentLastTestedAt(testedAt: string) {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  const value = (row?.value as Record<string, any> | undefined) || {};
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: { ...value, lastTestedAt: testedAt } },
    update: { value: { ...value, lastTestedAt: testedAt } },
  });
}

export async function getPublicPaymentConfiguration() {
  const config = await getPaymentConfiguration();
  return {
    activeProvider: config.activeProvider,
    environment: config.environment,
    mercadopago: {
      configured: Boolean(config.mercadopago.accessToken),
      publicKey: config.mercadopago.publicKey,
      webhookConfigured: Boolean(config.mercadopago.webhookSecret),
      methods: config.mercadopago.methods,
    },
    asaas: {
      configured: Boolean(config.asaas.apiKey),
      webhookConfigured: Boolean(config.asaas.webhookToken),
    },
    lastTestedAt: config.lastTestedAt,
  };
}

export async function getMercadoPagoPublicKey() {
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago') throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  if (!config.mercadopago.publicKey) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  return config.mercadopago.publicKey;
}

/** Verifica se o método está habilitado na configuração ativa do provedor. */
export async function isPaymentMethodEnabled(method: PaymentMethodId) {
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago') return false;
  return config.mercadopago.methods[method] === true;
}

function extractProviderCause(rawResponse: any) {
  if (Array.isArray(rawResponse?.cause)) return (rawResponse.cause as any[]).map(item => item?.description || item?.code).filter(Boolean).join('; ');
  if (typeof rawResponse?.cause === 'string' && rawResponse.cause) return rawResponse.cause;
  return rawResponse?.message || '';
}

/**
 * O Mercado Pago devolve os dados do Pix e do boleto em `point_of_interaction.transaction_data`.
 * Também aceita as variantes `transaction_details` e `payment_method` para cobrir payloads de
 * Checkout Pro, onde a estrutura vem no formato antigo.
 */
function extractQrCode(rawResponse: any) {
  const candidates = [
    rawResponse?.point_of_interaction?.transaction_data,
    rawResponse?.payment_method?.transaction_data,
    rawResponse?.transaction_details,
    rawResponse?.transaction_details?.external_resource_url ? { ticket_url: rawResponse.transaction_details.external_resource_url } : null,
    rawResponse?.ticket_url ? { ticket_url: rawResponse.ticket_url } : null,
  ].filter(Boolean) as any[];
  for (const candidate of candidates) {
    const qrCode = candidate.qr_code || candidate.qrCode || '';
    const qrCodeBase64 = candidate.qr_code_base64 || candidate.qrCodeBase64 || '';
    const ticketUrl = candidate.ticket_url || candidate.ticketUrl || candidate.external_resource_url || '';
    if (qrCode || qrCodeBase64 || ticketUrl) return { qrCode, qrCodeBase64, ticketUrl };
  }
  return { qrCode: '', qrCodeBase64: '', ticketUrl: '' };
}

/** O id do pagamento é o identificador que o webhook do Mercado Pago notifica (`data.id`). */
function extractProviderPaymentId(rawResponse: any, orderExternalId: string) {
  const transactions = rawResponse?.transactions?.payments;
  if (Array.isArray(transactions) && transactions.length > 0 && typeof transactions[0]?.id === 'string' && transactions[0].id) {
    return transactions[0].id;
  }
  if (typeof rawResponse?.payment?.id === 'string' && rawResponse.payment.id) return rawResponse.payment.id;
  if (typeof rawResponse?.id === 'string' && rawResponse.id) return rawResponse.id;
  return orderExternalId;
}

/**
 * Normaliza o status do provedor. Centralizado aqui para que criação de pagamento e
 * processamento de webhook nunca voltem a divergir.
 */
export function normalizeProviderStatus(raw: any): NormalizedPaymentStatus {
  const status = String(raw?.status || '').toLowerCase();
  if (status === 'processed' || status === 'accredited' || status === 'approved' || status === 'confirmed') return 'APPROVED';
  if (status === 'authorized') return 'AUTHORIZED';
  if (status === 'in_process' || status === 'pending' || status === 'authorized_pending') return 'IN_PROCESS';
  if (status === 'rejected' || status === 'failed' || status === 'error') return 'REJECTED';
  if (status === 'cancelled') return 'CANCELLED';
  if (status === 'refunded' || status === 'refund_requested' || status === 'charged_back_refunded') return 'REFUNDED';
  if (status === 'charged_back') return 'CHARGEBACK';
  if (status === 'expired') return 'EXPIRED';
  return 'PENDING';
}

export type CardPaymentInput = {
  cardToken: string;
  paymentMethodId: string;
  installments: number;
  payerEmail: string;
  payerIdentification: { type: string; number: string };
  notificationUrl?: string;
};

export async function createCardPayment(orderId: string, input: CardPaymentInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) { void logger.error('payment.card.order_not_found', { orderId }); throw new Error('ORDER_NOT_FOUND'); }
  if (order.status !== 'PENDING' || order.isBonus) { void logger.error('payment.card.order_not_payable', { orderId, status: order.status, isBonus: order.isBonus }); throw new Error('ORDER_NOT_PAYABLE'); }
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago' || !config.mercadopago.accessToken) { void logger.error('payment.card.provider_not_configured', { orderId, activeProvider: config.activeProvider, hasAccessToken: Boolean(config.mercadopago.accessToken) }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
  if (!config.mercadopago.methods.card) { void logger.error('payment.card.method_disabled', { orderId }); throw new Error('PAYMENT_METHOD_DISABLED'); }
  // A chave inclui o método para que cartão, Pix e boleto gerem transações
  // distintas do mesmo pedido, sem sobrescrever uma a outra.
  const idempotencyKey = `order:${order.id}:card`;
  const amount = order.totalCents ?? order.amountCents;
  if (!Number.isFinite(amount) || amount <= 0) { void logger.error('payment.card.invalid_amount', { orderId, amount }); throw new Error('ORDER_INVALID_AMOUNT'); }
  const absoluteAmount = (amount / 100).toFixed(2);
  let response: Response;
  try {
    response = await fetch(`${mpHost(config.environment)}/v1/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.mercadopago.accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        type: 'online',
        processing_mode: 'automatic',
        total_amount: absoluteAmount,
        external_reference: order.id,
        transactions: {
          payments: [{
            amount: absoluteAmount,
            payment_method: {
              id: input.paymentMethodId,
              type: 'credit_card',
              token: input.cardToken,
              installments: input.installments,
            },
          }],
        },
        payer: { email: input.payerEmail, identification: input.payerIdentification },
        // A Orders API não aceita notification_url no topo do payload; o campo correto é config.online.callback_url.
        ...(input.notificationUrl ? { config: { online: { callback_url: input.notificationUrl } } } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (fetchError) {
    const name = fetchError instanceof Error ? fetchError.name : '';
    const message = fetchError instanceof Error ? fetchError.message : '';
    void logger.error('payment.card.network_error', { name, message: message.slice(0, 200), method: input.paymentMethodId, orderId });
    throw new Error(name === 'TimeoutError' || /timeout|abort/i.test(message) ? 'MP_TIMEOUT' : 'MP_UNREACHABLE');
  }
  const rawResponse = await response.json().catch(() => ({}));
  if (!response.ok) {
    const cause = extractProviderCause(rawResponse);
    void logger.error('payment.card.provider_rejected', { httpStatus: response.status, method: input.paymentMethodId, orderId, cause: cause || 'sem detalhe' });
    throw new Error(cause ? `MP_ERROR: ${cause}` : 'PAYMENT_PROVIDER_ERROR');
  }
  const orderExternalId = String((rawResponse as any).id || '');
  if (!orderExternalId) { void logger.error('payment.card.missing_external_id', { orderId, httpStatus: response.status }); throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  const paymentRaw = (rawResponse as any).transactions?.payments?.[0];
  const status = normalizeProviderStatus(paymentRaw);
  const externalId = extractProviderPaymentId(rawResponse, orderExternalId);
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'mercadopago', externalId, providerOrderId: orderExternalId, method: input.paymentMethodId, installments: input.installments, status, amountCents: amount, idempotencyKey, rawResponse }, update: { externalId, providerOrderId: orderExternalId, method: input.paymentMethodId, installments: input.installments, status, rawResponse } });
  void logger.info('payment.card.created', { orderId, method: input.paymentMethodId, installments: input.installments, amountCents: amount, providerOrderId: orderExternalId, providerPaymentId: externalId, status, sendWebhook: Boolean(input.notificationUrl) });
  return { payment, status };
}

export type OfflinePaymentInput = {
  paymentMethodId: 'pix' | 'bolbradesco';
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  payerIdentification: { type: string; number: string };
  notificationUrl?: string;
};

export async function createOfflinePayment(orderId: string, input: OfflinePaymentInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) { void logger.error('payment.offline.order_not_found', { orderId }); throw new Error('ORDER_NOT_FOUND'); }
  if (order.status !== 'PENDING' || order.isBonus) { void logger.error('payment.offline.order_not_payable', { orderId, status: order.status, isBonus: order.isBonus }); throw new Error('ORDER_NOT_PAYABLE'); }
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago' || !config.mercadopago.accessToken) { void logger.error('payment.offline.provider_not_configured', { orderId, activeProvider: config.activeProvider, hasAccessToken: Boolean(config.mercadopago.accessToken) }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
  const enabled = input.paymentMethodId === 'pix' ? config.mercadopago.methods.pix : config.mercadopago.methods.boleto;
  if (!enabled) { void logger.error('payment.offline.method_disabled', { orderId, method: input.paymentMethodId }); throw new Error('PAYMENT_METHOD_DISABLED'); }
  // Igual ao cartão: a chave carrega o método para que Pix e boleto gerem
  // transações distintas do mesmo pedido.
  const idempotencyKey = `order:${order.id}:${input.paymentMethodId}`;
  const amount = order.totalCents ?? order.amountCents;
  if (!Number.isFinite(amount) || amount <= 0) { void logger.error('payment.offline.invalid_amount', { orderId, amount }); throw new Error('ORDER_INVALID_AMOUNT'); }
  const absoluteAmount = (amount / 100).toFixed(2);
  const isPix = input.paymentMethodId === 'pix';
  let response: Response;
  try {
    response = await fetch(`${mpHost(config.environment)}/v1/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.mercadopago.accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
      body: JSON.stringify({
        type: 'online',
        processing_mode: 'automatic',
        total_amount: absoluteAmount,
        external_reference: order.id,
        transactions: {
          payments: [{
            amount: absoluteAmount,
            payment_method: {
              id: input.paymentMethodId,
              type: isPix ? 'bank_transfer' : 'ticket',
            },
          }],
        },
        payer: { email: input.payerEmail, first_name: input.payerFirstName, last_name: input.payerLastName, identification: input.payerIdentification },
        // A Orders API não aceita notification_url no topo do payload; o campo correto é config.online.callback_url.
        ...(input.notificationUrl ? { config: { online: { callback_url: input.notificationUrl } } } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch (fetchError) {
    const name = fetchError instanceof Error ? fetchError.name : '';
    const message = fetchError instanceof Error ? fetchError.message : '';
    if (name === 'TimeoutError' || /timeout|abort/i.test(message)) {
      void logger.error('payment.offline.timeout', { orderId, method: input.paymentMethodId });
      throw new Error('MP_TIMEOUT');
    }
    void logger.error('payment.offline.network_error', { name, message: message.slice(0, 200), method: input.paymentMethodId, orderId });
    throw new Error('MP_UNREACHABLE');
  }
  const rawResponse = await response.json().catch(() => ({}));
  if (!response.ok) {
    const cause = extractProviderCause(rawResponse);
    void logger.error('payment.offline.provider_rejected', { httpStatus: response.status, method: input.paymentMethodId, orderId, cause: cause || 'sem detalhe' });
    throw new Error(cause ? `MP_ERROR: ${cause}` : 'PAYMENT_PROVIDER_ERROR');
  }
  const orderExternalId = String((rawResponse as any).id || '');
  if (!orderExternalId) { void logger.error('payment.offline.missing_external_id', { orderId, method: input.paymentMethodId, httpStatus: response.status }); throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  const paymentRaw = (rawResponse as any).transactions?.payments?.[0];
  const status = normalizeProviderStatus(paymentRaw);
  const externalId = extractProviderPaymentId(rawResponse, orderExternalId);
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'mercadopago', externalId, providerOrderId: orderExternalId, method: input.paymentMethodId, status, amountCents: amount, idempotencyKey, rawResponse }, update: { externalId, providerOrderId: orderExternalId, method: input.paymentMethodId, status, rawResponse } });
  void logger.info('payment.offline.created', { orderId, method: input.paymentMethodId, providerOrderId: orderExternalId, providerPaymentId: externalId, status, sendWebhook: Boolean(input.notificationUrl) });
  // A Orders API nem sempre devolve o QR Code do Pix ou o link do boleto no corpo da order.
  // Quando falta, o dado vem no recurso de pagamento correspondente.
  let offlineDetails = extractQrCode(rawResponse);
  if (!offlineDetails.qrCode && !offlineDetails.qrCodeBase64 && !offlineDetails.ticketUrl) {
    offlineDetails = await fetchOfflinePaymentDetails(config.environment, config.mercadopago.accessToken, externalId, orderExternalId);
  }
  return { payment, status, ...offlineDetails };
}

/** Busca o QR Code do Pix / o link do boleto no recurso de pagamento do Mercado Pago. */
async function fetchOfflinePaymentDetails(environment: PaymentEnvironment, accessToken: string, paymentId: string, providerOrderId: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  try {
    const paymentResponse = await fetch(`${mpHost(environment)}/v1/payments/${encodeURIComponent(paymentId)}`, { headers, signal: AbortSignal.timeout(10000) });
    if (paymentResponse.ok) {
      const data = await paymentResponse.json();
      const details = extractQrCode(data);
      if (details.qrCode || details.qrCodeBase64 || details.ticketUrl) return details;
    }
  } catch (error) {
    void logger.warn('payment.offline.details_fetch_failed', { paymentId, message: error instanceof Error ? error.message : 'erro' });
  }
  try {
    const orderResponse = await fetch(`${mpHost(environment)}/v1/orders/${encodeURIComponent(providerOrderId)}`, { headers, signal: AbortSignal.timeout(10000) });
    if (orderResponse.ok) {
      const data = await orderResponse.json();
      const details = extractQrCode(data);
      if (details.qrCode || details.qrCodeBase64 || details.ticketUrl) return details;
    }
  } catch (error) {
    void logger.warn('payment.offline.order_details_fetch_failed', { providerOrderId, message: error instanceof Error ? error.message : 'erro' });
  }
  void logger.warn('payment.offline.no_qr_or_ticket', { paymentId, providerOrderId });
  return { qrCode: '', qrCodeBase64: '', ticketUrl: '' };
}

/**
 * Cria um checkout hospedado no provedor (redirecionamento do cliente).
 *
 * Só o Asaas usa esse fluxo: o Mercado Pago é integrado no navegador via
 * tokenização do cartão e confirmação direta na API, sem checkout hospedado.
 */
export async function createPaymentCheckout(orderId: string, baseUrl: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) { void logger.error('payment.checkout.order_not_found', { orderId }); throw new Error('ORDER_NOT_FOUND'); }
  if (order.status !== 'PENDING' || order.isBonus) { void logger.error('payment.checkout.order_not_payable', { orderId, status: order.status, isBonus: order.isBonus }); throw new Error('ORDER_NOT_PAYABLE'); }
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'asaas') { void logger.error('payment.checkout.provider_not_configured', { orderId, activeProvider: config.activeProvider }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
  // Chave distinta da do pagamento direto (cartão/Pix), para não colidir com a
  // transação registrada por createCardPayment/createOfflinePayment.
  const idempotencyKey = `order:${order.id}:checkout`;
  const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
  if (existing?.checkoutUrl) { void logger.info('payment.checkout.reused', { orderId, paymentId: existing.id }); return existing; }
  const amount = order.totalCents ?? order.amountCents;
  if (!Number.isFinite(amount) || amount <= 0) { void logger.error('payment.checkout.invalid_amount', { orderId, amount }); throw new Error('ORDER_INVALID_AMOUNT'); }
  if (!config.asaas.apiKey) { void logger.error('payment.checkout.provider_not_configured', { orderId, activeProvider: config.activeProvider }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
  const host = config.environment === 'sandbox' ? 'https://sandbox.asaas.com' : 'https://api.asaas.com';
  let response: Response;
  try {
    response = await fetch(`${host}/v3/paymentLinks`, { method: 'POST', headers: { access_token: config.asaas.apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ name: `${order.product.name} - ${order.plate}`, description: `Pedido ${order.id}`, value: Number((amount / 100).toFixed(2)), billingType: 'UNDEFINED', chargeType: 'DETACHED', dueDateLimitDays: 3, externalReference: order.id, callback: { successUrl: `${baseUrl}/minha-conta` } }), signal: AbortSignal.timeout(15000) });
  } catch (fetchError) {
    const name = fetchError instanceof Error ? fetchError.name : '';
    const message = fetchError instanceof Error ? fetchError.message : '';
    void logger.error('payment.checkout.network_error', { orderId, provider: 'asaas', name, message: message.slice(0, 200) });
    throw new Error('ASAAS_UNREACHABLE');
  }
  const rawResponse = await response.json().catch(() => ({}));
  if (!response.ok) { const cause = extractProviderCause(rawResponse); void logger.error('payment.checkout.provider_rejected', { orderId, provider: 'asaas', httpStatus: response.status, cause: cause || 'sem detalhe' }); throw new Error(cause ? `ASAAS_ERROR: ${cause}` : 'PAYMENT_PROVIDER_ERROR'); }
  const externalId = String((rawResponse as any).id || '');
  const checkoutUrl = String((rawResponse as any).url || '');
  if (!externalId || !checkoutUrl) { void logger.error('payment.checkout.missing_checkout_url', { orderId, hasExternalId: Boolean(externalId), hasCheckoutUrl: Boolean(checkoutUrl) }); throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'asaas', externalId, status: 'PENDING', amountCents: amount, idempotencyKey, checkoutUrl, rawResponse }, update: { externalId, checkoutUrl, rawResponse } });
  void logger.info('payment.checkout.created', { orderId, provider: 'asaas', amountCents: amount, paymentId: payment.id });
  return payment;
}

/**
 * Consulta os planos de parcelamento do cartão no Mercado Pago, incluindo taxa de juros,
 * valor da parcela e total financiado.
 *
 * A resposta oficial traz `payment_type_id`, `payment_method_id`, `installments[]` com
 * `quantity`, `rate`, `amount` e `total`, além de `recommended` apontando a parcela sugerida.
 */
export async function getMercadoPagoInstallments(amountCents: number, paymentMethodId?: string): Promise<InstallmentPlan[]> {
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago' || !config.mercadopago.accessToken) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  const amount = (amountCents / 100).toFixed(2);
  const url = new URL(`${mpHost(config.environment)}/v1/payment_methods`);
  url.searchParams.set('payment_type_id', 'credit_card');
  url.searchParams.set('amount', amount);
  url.searchParams.set('installments', '1');
  if (paymentMethodId) url.searchParams.set('payment_method_id', paymentMethodId);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${config.mercadopago.accessToken}` }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    void logger.error('payment.installments.provider_rejected', { httpStatus: response.status, amount });
    throw new Error('PAYMENT_PROVIDER_ERROR');
  }
  const data = await response.json().catch(() => ({}));
  const results = Array.isArray(data?.results) ? data.results : [];
  const plans: InstallmentPlan[] = [];
  for (const method of results) {
    const installments = Array.isArray(method?.installments) ? method.installments : [];
    for (const installment of installments) {
      const quantity = Number(installment?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) continue;
      plans.push({
        quantity,
        rate: Number(installment?.rate || 0),
        amount: Number(installment?.amount || 0),
        total: Number(installment?.total || 0),
        recommended: installment?.recommended === true || method?.recommended === true,
        interestFree: Number(installment?.rate || 0) === 0,
      });
    }
  }
  if (!plans.length) void logger.warn('payment.installments.empty', { amount });
  return plans;
}

/** Normaliza os planos do provedor para o formato consumido pelo checkout. */
export function buildInstallmentOptions(plans: InstallmentPlan[]): InstallmentOption[] {
  const seen = new Map<number, InstallmentOption>();
  for (const plan of plans) {
    const value = plan.amount || 0;
    const total = plan.total || 0;
    const existing = seen.get(plan.quantity);
    const option: InstallmentOption = {
      quantity: plan.quantity,
      label: `${plan.quantity}x de ${value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}${plan.interestFree ? ' sem juros' : ''}`,
      amount: value,
      total,
      rate: plan.rate,
      interestFree: plan.interestFree,
      recommended: plan.recommended,
    };
    if (!existing || (option.interestFree && !existing.interestFree)) seen.set(plan.quantity, option);
  }
  const options = [...seen.values()].sort((left, right) => left.quantity - right.quantity);
  const recommended = options.find(option => option.recommended) || options.find(option => option.interestFree) || options[0];
  if (recommended) recommended.recommended = true;
  return options;
}
