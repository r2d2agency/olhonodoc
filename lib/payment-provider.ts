import { prisma } from '@/lib/prisma';
import { decryptSmtpPassword, encryptSmtpPassword } from '@/lib/smtp-settings';

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

export type CardPaymentInput = {
  cardToken: string;
  paymentMethodId: string;
  installments: number;
  payerEmail: string;
  payerIdentification: { type: string; number: string };
};

export async function createCardPayment(orderId: string, input: CardPaymentInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status !== 'PENDING' || order.isBonus) throw new Error('ORDER_NOT_PAYABLE');
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago') throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  if (!config.mercadopago.accessToken) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  const idempotencyKey = `order:${order.id}`;
  const amount = order.totalCents ?? order.amountCents;
  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.mercadopago.accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      transaction_amount: amount / 100,
      token: input.cardToken,
      description: `${order.product.name} - ${order.plate}`,
      installments: input.installments,
      payment_method_id: input.paymentMethodId,
      external_reference: order.id,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      payer: { email: input.payerEmail, identification: input.payerIdentification },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const rawResponse = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('PAYMENT_PROVIDER_ERROR');
  const externalId = String((rawResponse as any).id || '');
  if (!externalId) throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
  const status: NormalizedPaymentStatus = (rawResponse as any).status === 'approved' ? 'APPROVED' : (rawResponse as any).status === 'rejected' ? 'REJECTED' : (rawResponse as any).status === 'cancelled' ? 'CANCELLED' : 'PENDING';
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'mercadopago', externalId, status, amountCents: amount, idempotencyKey, rawResponse }, update: { externalId, status, rawResponse } });
  return { payment, status };
}

export type OfflinePaymentInput = {
  paymentMethodId: 'pix' | 'bolbradesco';
  payerEmail: string;
  payerFirstName: string;
  payerLastName: string;
  payerIdentification: { type: string; number: string };
};

export async function createOfflinePayment(orderId: string, input: OfflinePaymentInput) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status !== 'PENDING' || order.isBonus) throw new Error('ORDER_NOT_PAYABLE');
  const config = await getPaymentConfiguration();
  if (config.activeProvider !== 'mercadopago') throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  if (!config.mercadopago.accessToken) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  const idempotencyKey = `order:${order.id}`;
  const amount = order.totalCents ?? order.amountCents;
  const response = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.mercadopago.accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey },
    body: JSON.stringify({
      transaction_amount: amount / 100,
      description: `${order.product.name} - ${order.plate}`,
      payment_method_id: input.paymentMethodId,
      external_reference: order.id,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      payer: { email: input.payerEmail, first_name: input.payerFirstName, last_name: input.payerLastName, identification: input.payerIdentification },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const rawResponse = await response.json().catch(() => ({}));
  if (!response.ok) {
    const cause = Array.isArray((rawResponse as any).cause) ? (rawResponse as any).cause.map((item: any) => item.description || item.code).join('; ') : (rawResponse as any).message || '';
    console.error('[offline-payment] Mercado Pago rejeitou a cobrança', { httpStatus: response.status, method: input.paymentMethodId, orderId, cause: cause || 'sem detalhe' });
    throw new Error(cause ? `MP_ERROR: ${cause}` : 'PAYMENT_PROVIDER_ERROR');
  }
  const externalId = String((rawResponse as any).id || '');
  if (!externalId) throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
  const status: NormalizedPaymentStatus = (rawResponse as any).status === 'approved' ? 'APPROVED' : (rawResponse as any).status === 'rejected' ? 'REJECTED' : (rawResponse as any).status === 'cancelled' ? 'CANCELLED' : 'PENDING';
  const payment = await prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: 'mercadopago', externalId, status, amountCents: amount, idempotencyKey, rawResponse }, update: { externalId, status, rawResponse } });
  const transactionData = (rawResponse as any).point_of_interaction?.transaction_data;
  return { payment, status, qrCode: transactionData?.qr_code || '', qrCodeBase64: transactionData?.qr_code_base64 || '', ticketUrl: transactionData?.ticket_url || (rawResponse as any).transaction_details?.external_resource_url || '' };
}

export async function createPaymentCheckout(orderId: string, baseUrl: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { product: true, customer: true } });
  if (!order) throw new Error('ORDER_NOT_FOUND');
  if (order.status !== 'PENDING' || order.isBonus) throw new Error('ORDER_NOT_PAYABLE');
  const config = await getPaymentConfiguration();
  if (config.activeProvider === 'none') throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
  const idempotencyKey = `order:${order.id}`;
  const existing = await prisma.payment.findUnique({ where: { idempotencyKey } });
  if (existing?.checkoutUrl) return existing;
  const amount = order.totalCents ?? order.amountCents;
  let externalId = '';
  let checkoutUrl = '';
  let rawResponse: object = {};
  if (config.activeProvider === 'mercadopago') {
    if (!config.mercadopago.accessToken) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', { method: 'POST', headers: { Authorization: `Bearer ${config.mercadopago.accessToken}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': idempotencyKey }, body: JSON.stringify({ external_reference: order.id, items: [{ id: order.product.slug, title: order.product.name, quantity: 1, currency_id: 'BRL', unit_price: amount / 100 }], payer: order.customer?.email ? { email: order.customer.email } : undefined, back_urls: { success: `${baseUrl}/minha-conta`, pending: `${baseUrl}/minha-conta`, failure: `${baseUrl}/checkout` }, auto_return: 'approved', notification_url: `${baseUrl}/api/webhooks/mercadopago` }), signal: AbortSignal.timeout(15000) });
    rawResponse = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('PAYMENT_PROVIDER_ERROR');
    externalId = String((rawResponse as any).id || ''); checkoutUrl = String((rawResponse as any).init_point || (rawResponse as any).sandbox_init_point || '');
  } else {
    if (!config.asaas.apiKey) throw new Error('PAYMENT_PROVIDER_NOT_CONFIGURED');
    const host = config.environment === 'sandbox' ? 'https://sandbox.asaas.com' : 'https://api.asaas.com';
    const response = await fetch(`${host}/v3/paymentLinks`, { method: 'POST', headers: { access_token: config.asaas.apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ name: `${order.product.name} - ${order.plate}`, description: `Pedido ${order.id}`, value: amount / 100, billingType: 'UNDEFINED', chargeType: 'DETACHED', dueDateLimitDays: 3, externalReference: order.id, callback: { successUrl: `${baseUrl}/minha-conta` } }), signal: AbortSignal.timeout(15000) });
    rawResponse = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('PAYMENT_PROVIDER_ERROR');
    externalId = String((rawResponse as any).id || ''); checkoutUrl = String((rawResponse as any).url || '');
  }
  if (!externalId || !checkoutUrl) throw new Error('PAYMENT_PROVIDER_INVALID_RESPONSE');
  return prisma.payment.upsert({ where: { idempotencyKey }, create: { orderId, provider: config.activeProvider, externalId, status: 'PENDING', amountCents: amount, idempotencyKey, checkoutUrl, rawResponse }, update: { externalId, checkoutUrl, rawResponse } });
}
