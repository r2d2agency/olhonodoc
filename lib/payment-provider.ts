import { prisma } from '@/lib/prisma';
import { decryptSmtpPassword, encryptSmtpPassword } from '@/lib/smtp-settings';

export type PaymentProvider = 'mercadopago' | 'asaas' | 'none';
export type PaymentEnvironment = 'sandbox' | 'production';
export type NormalizedPaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED' | 'CHARGEBACK' | 'EXPIRED';
const KEY = 'payment.providers';

export async function getPaymentConfiguration() { const row = await prisma.setting.findUnique({ where: { key: KEY } }); const value = row?.value as Record<string, any> | undefined; return { activeProvider: (value?.activeProvider || 'none') as PaymentProvider, environment: (value?.environment || 'sandbox') as PaymentEnvironment, mercadopago: { accessToken: value?.mercadopago?.accessToken ? decryptSmtpPassword(value.mercadopago.accessToken) : '', publicKey: value?.mercadopago?.publicKey || '', webhookSecret: value?.mercadopago?.webhookSecret ? decryptSmtpPassword(value.mercadopago.webhookSecret) : '' }, asaas: { apiKey: value?.asaas?.apiKey ? decryptSmtpPassword(value.asaas.apiKey) : '', webhookToken: value?.asaas?.webhookToken ? decryptSmtpPassword(value.asaas.webhookToken) : '' }, lastTestedAt: value?.lastTestedAt || null }; }
export async function savePaymentConfiguration(input: any) { const current = await getPaymentConfiguration(); const value = { activeProvider: input.activeProvider, environment: input.environment, mercadopago: { accessToken: input.mercadopago.accessToken ? encryptSmtpPassword(input.mercadopago.accessToken) : current.mercadopago.accessToken ? encryptSmtpPassword(current.mercadopago.accessToken) : '', publicKey: input.mercadopago.publicKey || current.mercadopago.publicKey, webhookSecret: input.mercadopago.webhookSecret ? encryptSmtpPassword(input.mercadopago.webhookSecret) : current.mercadopago.webhookSecret ? encryptSmtpPassword(current.mercadopago.webhookSecret) : '' }, asaas: { apiKey: input.asaas.apiKey ? encryptSmtpPassword(input.asaas.apiKey) : current.asaas.apiKey ? encryptSmtpPassword(current.asaas.apiKey) : '', webhookToken: input.asaas.webhookToken ? encryptSmtpPassword(input.asaas.webhookToken) : current.asaas.webhookToken ? encryptSmtpPassword(current.asaas.webhookToken) : '' }, lastTestedAt: current.lastTestedAt }; await prisma.setting.upsert({ where: { key: KEY }, create: { key: KEY, value }, update: { value } }); }
export async function getPublicPaymentConfiguration() { const config = await getPaymentConfiguration(); return { activeProvider: config.activeProvider, environment: config.environment, mercadopago: { configured: Boolean(config.mercadopago.accessToken), publicKey: config.mercadopago.publicKey, webhookConfigured: Boolean(config.mercadopago.webhookSecret) }, asaas: { configured: Boolean(config.asaas.apiKey), webhookConfigured: Boolean(config.asaas.webhookToken) }, lastTestedAt: config.lastTestedAt }; }

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
