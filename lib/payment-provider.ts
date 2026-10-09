import { prisma } from '@/lib/prisma';
import { decryptSmtpPassword, encryptSmtpPassword } from '@/lib/smtp-settings';
import { logger } from '@/lib/logger';

export type PaymentProvider = 'mercadopago' | 'asaas' | 'none';
export type PaymentEnvironment = 'sandbox' | 'production';
export type NormalizedPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' | 'EXPIRED';
const KEY = 'payment.providers';

export async function getPaymentConfiguration() { const row = await prisma.setting.findUnique({ where: { key: KEY } }); const value = row?.value as Record<string, any> | undefined; return { activeProvider: (value?.activeProvider || 'none') as PaymentProvider, environment: (value?.environment || 'sandbox') as PaymentEnvironment, mercadopago: { accessToken: value?.mercadopago?.accessToken ? decryptSmtpPassword(value.mercadopago.accessToken) : '', publicKey: value?.mercadopago?.publicKey || '', webhookSecret: value?.mercadopago?.webhookSecret ? decryptSmtpPassword(value.mercadopago.webhookSecret) : '', methods: { card: value?.mercadopago?.methods?.card !== false, pix: value?.mercadopago?.methods?.pix !== false, boleto: value?.mercadopago?.methods?.boleto !== false } }, asaas: { apiKey: value?.asaas?.apiKey ? decryptSmtpPassword(value.asaas.apiKey) : '', webhookToken: value?.asaas?.webhookToken ? decryptSmtpPassword(value.asaas.webhookToken) : '' }, lastTestedAt: value?.lastTestedAt || null }; }
export async function savePaymentConfiguration(input: any) { const current = await getPaymentConfiguration(); const value = { activeProvider: input.activeProvider, environment: input.environment, mercadopago: { accessToken: input.mercadopago.accessToken ? encryptSmtpPassword(input.mercadopago.accessToken) : current.mercadopago.accessToken ? encryptSmtpPassword(current.mercadopago.accessToken) : '', publicKey: input.mercadopago.publicKey || current.mercadopago.publicKey, webhookSecret: input.mercadopago.webhookSecret ? encryptSmtpPassword(input.mercadopago.webhookSecret) : current.mercadopago.webhookSecret ? encryptSmtpPassword(current.mercadopago.webhookSecret) : '', methods: input.mercadopago.methods || current.mercadopago.methods }, asaas: { apiKey: input.asaas.apiKey ? encryptSmtpPassword(input.asaas.apiKey) : current.asaas.apiKey ? encryptSmtpPassword(current.asaas.apiKey) : '', webhookToken: input.asaas.webhookToken ? encryptSmtpPassword(input.asaas.webhookToken) : current.asaas.webhookToken ? encryptSmtpPassword(current.asaas.webhookToken) : '' }, lastTestedAt: current.lastTestedAt }; await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } }); }
export async function getPublicPaymentConfiguration() { const config = await getPaymentConfiguration(); return { activeProvider: config.activeProvider, environment: config.environment, mercadopago: { configured: Boolean(config.mercadopago.accessToken), publicKey: config.mercadopago.publicKey, webhookConfigured: Boolean(config.mercadopago.webhookSecret), methods: config.mercadopago.methods }, asaas: { configured: Boolean(config.asaas.apiKey), webhookConfigured: Boolean(config.asaas.webhookToken) }, lastTestedAt: config.lastTestedAt }; }

export async function getMercadoPagoPublicKey() {
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago') throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  if (!config.mercadopago.publicKey) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  return config.mercadopago.publicKey;
}

function extractProviderCause(rawResponse: any) {
  if (Array.isArray(rawResponse?.cause)) return (rawResponse.cause as any[]).map(item => item?.description || item?.code).filter(Boolean).join('; ');
  if (typeof rawResponse?.cause === 'string' && rawResponse.cause) return rawResponse.cause;
  return rawResponse?.message || '';
}

function extractQrCode(rawResponse: any) {
  const transactionData = rawResponse?.point_of_interaction?.transaction_data;
  return {
    qrCode: transactionData?.qr_code || '',
    qrCodeBase64: transactionData?.qr_code_base64 || '',
    ticketUrl: transactionData?.ticket_url || rawResponse?.transaction_details?.external_resource_url || '',
  };
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
  const idempotencyKey = `order:${order.id}`;
  const amount = order.totalCents ?? order.amountCents;
  if (!Number.isFinite(amount) || amount <= 0) { void logger.error('payment.card.invalid_amount', { orderId, amount }); throw new Error('ORDER_INVALID_AMOUNT'); }
  const absoluteAmount = (amount / 100).toFixed(2);
  let response: Response;
  try {
    response = await fetch('https://api.mercadopago.com/v1/orders', {
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
  const externalId = String((rawResponse as any).id || '');
  if (!externalId) { void logger.error('payment.card.missing_external_id', { orderId, httpStatus: response.status }); throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  const paymentStatus = (rawResponse as any).transactions?.payments?.[0];
  const status: NormalizedPaymentStatus = paymentStatus?.status === 'processed' || paymentStatus?.status === 'accredited' ? 'APPROVED' : paymentStatus?.status === 'rejected' ? 'REJECTED' : paymentStatus?.status === 'cancelled' ? 'CANCELLED' : 'PENDING';
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'mercadopago', externalId, status, amountCents: amount, idempotencyKey, rawResponse }, update: { externalId, status, rawResponse } });
  void logger.info('payment.card.created', { orderId, method: input.paymentMethodId, installments: input.installments, amountCents: amount, providerPaymentId: externalId, status, sendWebhook: Boolean(input.notificationUrl) });
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
  const idempotencyKey = `order:${order.id}`;
  const amount = order.totalCents ?? order.amountCents;
  if (!Number.isFinite(amount) || amount <= 0) { void logger.error('payment.offline.invalid_amount', { orderId, amount }); throw new Error('ORDER_INVALID_AMOUNT'); }
  const absoluteAmount = (amount / 100).toFixed(2);
  const isPix = input.paymentMethodId === 'pix';
  let response: Response;
  try {
    response = await fetch('https://api.mercadopago.com/v1/orders', {
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
  const externalId = String((rawResponse as any).id || '');
  if (!externalId) { void logger.error('payment.offline.missing_external_id', { orderId, method: input.paymentMethodId, httpStatus: response.status }); throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  const paymentStatus = (rawResponse as any).transactions?.payments?.[0];
  const status: NormalizedPaymentStatus = paymentStatus?.status === 'processed' || paymentStatus?.status === 'accredited' ? 'APPROVED' : paymentStatus?.status === 'rejected' ? 'REJECTED' : paymentStatus?.status === 'cancelled' ? 'CANCELLED' : 'PENDING';
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'mercadopago', externalId, status, amountCents: amount, idempotencyKey, rawResponse }, update: { externalId, status, rawResponse } });
  void logger.info('payment.offline.created', { orderId, method: input.paymentMethodId, providerPaymentId: externalId, status, amountCents: amount, sendWebhook: Boolean(input.notificationUrl) });
  return { payment, status, ...extractQrCode(rawResponse) };
}

export async function createPaymentCheckout(orderId: string, baseUrl: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) { void logger.error('payment.checkout.order_not_found', { orderId }); throw new Error('ORDER_NOT_FOUND'); }
  if (order.status !== 'PENDING' || order.isBonus) { void logger.error('payment.checkout.order_not_payable', { orderId, status: order.status, isBonus: order.isBonus }); throw new Error('ORDER_NOT_PAYABLE'); }
  const config = await getPaymentConfiguration();
  if (config.activeProvider === 'none') { void logger.error('payment.checkout.provider_not_configured', { orderId }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
  const idempotencyKey = `order:${order.id}`;
  const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
  if (existing?.checkoutUrl) { void logger.info('payment.checkout.reused', { orderId, paymentId: existing.id }); return existing; }
  const amount = order.totalCents ?? order.amountCents;
  if (!Number.isFinite(amount) || amount <= 0) { void logger.error('payment.checkout.invalid_amount', { orderId, amount }); throw new Error('ORDER_INVALID_AMOUNT'); }
  let externalId = '';
  let checkoutUrl = '';
  let rawResponse: object = {};
  if (config.activeProvider === 'mercadopago') {
    if (!config.mercadopago.accessToken) { void logger.error('payment.checkout.provider_not_configured', { orderId, activeProvider: config.activeProvider }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
    let response: Response;
    try {
      response = await fetch('https://api.mercadopago.com/checkout/preferences', { method: 'POST', headers: { Authorization: `Bearer ${config.mercadopago.accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey }, body: JSON.stringify({ external_reference: order.id, items: [{ id: order.product.slug, title: order.product.name, quantity: 1, currency_id: 'BRL', unit_price: amount / 100 }], payer: order.customer?.email ? { email: order.customer.email } : undefined, back_urls: { success: `${baseUrl}/minha-conta`, pending: `${baseUrl}/minha-conta`, failure: `${baseUrl}/checkout` }, auto_return: 'approved', notification_url: `${baseUrl}/api/webhooks/mercadopago` }), signal: AbortSignal.timeout(15000) });
    } catch (fetchError) {
      const name = fetchError instanceof Error ? fetchError.name : '';
      const message = fetchError instanceof Error ? fetchError.message : '';
      void logger.error('payment.checkout.network_error', { orderId, provider: 'mercadopago', name, message: message.slice(0, 200) });
      throw new Error(name === 'TimeoutError' || /timeout|abort/i.test(message) ? 'MP_TIMEOUT' : 'MP_UNREACHABLE');
    }
    rawResponse = await response.json().catch(() => ({}));
    if (!response.ok) { const cause = extractProviderCause(rawResponse); void logger.error('payment.checkout.provider_rejected', { orderId, provider: 'mercadopago', httpStatus: response.status, cause: cause || 'sem detalhe' }); throw new Error(cause ? `MP_ERROR: ${cause}` : 'PAYMENT_PROVIDER_ERROR'); }
    externalId = String((rawResponse as any).id || ''); checkoutUrl = String((rawResponse as any).init_point || (rawResponse as any).sandbox_init_point || '');
  } else {
    if (!config.asaas.apiKey) { void logger.error('payment.checkout.provider_not_configured', { orderId, activeProvider: config.activeProvider }); throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED'); }
    const host = config.environment === 'sandbox' ? 'https://sandbox.asaas.com' : 'https://api.asaas.com';
    let response: Response;
    try {
      response = await fetch(`${host}/v3/paymentLinks`, { method: 'POST', headers: { access_token: config.asaas.apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ name: `${order.product.name} - ${order.plate}`, description: `Pedido ${order.id}`, value: amount / 100, billingType: 'UNDEFINED', chargeType: 'DETACHED', dueDateLimitDays: 3, externalReference: order.id, callback: { successUrl: `${baseUrl}/minha-conta` } }), signal: AbortSignal.timeout(15000) });
    } catch (fetchError) {
      const name = fetchError instanceof Error ? fetchError.name : '';
      const message = fetchError instanceof Error ? fetchError.message : '';
      void logger.error('payment.checkout.network_error', { orderId, provider: 'asaas', name, message: message.slice(0, 200) });
      throw new Error('MP_UNREACHABLE');
    }
    rawResponse = await response.json().catch(() => ({}));
    if (!response.ok) { const cause = extractProviderCause(rawResponse); void logger.error('payment.checkout.provider_rejected', { orderId, provider: 'asaas', httpStatus: response.status, cause: cause || 'sem detalhe' }); throw new Error(cause ? `MP_ERROR: ${cause}` : 'PAYMENT_PROVIDER_ERROR'); }
    externalId = String((rawResponse as any).id || ''); checkoutUrl = String((rawResponse as any).url || '');
  }
  if (!externalId || !checkoutUrl) { void logger.error('payment.checkout.missing_checkout_url', { orderId, hasExternalId: Boolean(externalId), hasCheckoutUrl: Boolean(checkoutUrl) }); throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE'); }
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: config.activeProvider, externalId, status: 'PENDING', amountCents: amount, idempotencyKey, checkoutUrl, rawResponse }, update: { externalId, checkoutUrl, rawResponse } });
  void logger.info('payment.checkout.created', { orderId, provider: config.activeProvider, amountCents: amount, paymentId: payment.id });
  return payment;
}
