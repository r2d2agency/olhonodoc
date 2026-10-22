import { NextResponse } from 'next/server';
import { getCurrentUser, normalizeDigits } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CouponError, normalizeCouponCode, releaseStaleRedemptions, resolveCoupon, syncRedemptionCount } from '@/lib/coupons';
import { activePriceCents } from '@/lib/pricing';
import { logger, logRequest } from '@/lib/logger';

function validCpfCnpj(value: string) {
  const digits = normalizeDigits(value);
  if (digits.length === 11) {
    if (/^(\d)\1{10}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
    let d1 = (sum * 10) % 11 % 10;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
    let d2 = (sum * 10) % 11 % 10;
    return Number(digits[9]) === d1 && Number(digits[10]) === d2;
  }
  if (digits.length === 14) {
    if (/^(\d)\1{13}$/.test(digits)) return false;
    const calc = (length: number) => { const weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; let sum = 0; for (let i = 0; i < length; i++) sum += Number(digits[i]) * weights[i]; const remainder = sum % 11; return remainder < 2 ? 0 : 11 - remainder; };
    return Number(digits[12]) === calc(12) && Number(digits[13]) === calc(13);
  }
  return false;
}

const POST = logRequest('checkout.prepare', async (request: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER' || !user.email) return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const body = await request.json().catch(() => null);
    const productSlug = typeof body?.productSlug === 'string' ? body.productSlug : '';
    const plate = typeof body?.plate === 'string' ? body.plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() : '';
    const address = body?.address;
    const cpf = typeof body?.cpf === 'string' ? normalizeDigits(body.cpf) : '';
    const phone = typeof body?.phone === 'string' ? normalizeDigits(body.phone) : '';
    const couponCode = normalizeCouponCode(typeof body?.couponCode === 'string' ? body.couponCode : '');
    if (!validCpfCnpj(cpf)) return NextResponse.json({ error: 'Informe um CPF ou CNPJ válido.' }, { status: 400 });
    if (!/^\d{10,13}$/.test(phone)) return NextResponse.json({ error: 'Informe um WhatsApp válido.' }, { status: 400 });
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate) && !/^[A-Z]{3}[0-9]{4}$/.test(plate)) return NextResponse.json({ error: 'Placa inválida.' }, { status: 400 });
    if (!address || typeof address !== 'object' || !String(address.postalCode || '').replace(/\D/g, '').match(/^\d{8}$/) || !String(address.street || '').trim() || !String(address.number || '').trim() || !String(address.neighborhood || '').trim() || !String(address.city || '').trim() || !/^[A-Z]{2}$/.test(String(address.state || '').toUpperCase())) return NextResponse.json({ error: 'Preencha o endereço completo.' }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { slug: productSlug, status: 'ACTIVE' } });
    if (!product) return NextResponse.json({ error: 'Produto indisponível.' }, { status: 404 });
    const customer = await prisma.customer.upsert({ where: { email: user.email }, update: { name: user.name || undefined, phone, cpf, postalCode: String(address.postalCode).replace(/\D/g, ''), street: String(address.street).trim(), number: String(address.number).trim(), complement: String(address.complement || '').trim() || null, neighborhood: String(address.neighborhood).trim(), city: String(address.city).trim(), state: String(address.state).toUpperCase() }, create: { email: user.email, name: user.name, postalCode: String(address.postalCode).replace(/\D/g, ''), street: String(address.street).trim(), number: String(address.number).trim(), complement: String(address.complement || '').trim() || null, neighborhood: String(address.neighborhood).trim(), city: String(address.city).trim(), state: String(address.state).toUpperCase() } });

    // O subtotal vem do preço do produto no servidor; o cupom só pode
    // reduzir esse valor, nunca aumentá-lo.
    const subtotalCents = activePriceCents(product);
    let discountCents = 0;
    let couponId: string | null = null;
    let appliedCode = '';
    if (couponCode) {
      try {
        const resolution = await resolveCoupon({ code: couponCode, subtotalCents, productId: product.id, customerId: customer.id, email: user.email, cpf });
        discountCents = resolution.discountCents;
        couponId = resolution.couponId;
        appliedCode = resolution.code;
      } catch (error) {
        if (error instanceof CouponError) {
          void logger.warn('checkout.prepare.coupon_rejected', { code: couponCode, message: error.message });
          return NextResponse.json({ error: error.message }, { status: error.status });
        }
        throw error;
      }
    }
    const totalCents = subtotalCents - discountCents;

    // Resgates de pedidos que ninguém retomou não devem segurar o cupom.
    const released = await releaseStaleRedemptions().catch(() => 0);
    if (released) void logger.info('checkout.prepare.stale_redemptions_released', { count: released });

    const existing = await prisma.order.findFirst({ where: { customerId: customer.id, plate, productId: product.id, status: 'PENDING', createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) } }, orderBy: { createdAt: 'desc' } });
    const order = await prisma.$transaction(async (tx) => {
      // O pedido pendente é reaproveitado; se o cupom mudou, os valores são
      // recalculados e o resgate anterior é estornado.
      const current = existing || await tx.order.create({ data: { plate, productId: product.id, customerId: customer.id, amountCents: totalCents, subtotalCents, discountCents, totalCents, couponId, status: 'PENDING' } });
      if (existing) await tx.order.update({ where: { id: existing.id }, data: { amountCents: totalCents, subtotalCents, discountCents, totalCents, couponId } });
      // Há um resgate por pedido (orderId é único): ele é reaproveitado e
      // reativado quando o cliente troca o cupom.
      const redemption = await tx.couponRedemption.findUnique({ where: { orderId: current.id } });
      const previousCouponId = redemption && redemption.couponId !== couponId ? redemption.couponId : null;
      if (couponId) {
        if (redemption) {
          await tx.couponRedemption.update({ where: { id: redemption.id }, data: { couponId, code: appliedCode, discountCents, customerId: customer.id, reversedAt: null } });
        } else {
          await tx.couponRedemption.create({ data: { couponId, orderId: current.id, customerId: customer.id, code: appliedCode, discountCents } });
        }
      } else if (redemption && !redemption.reversedAt) {
        // O cliente removeu o cupom: o resgate é estornado.
        await tx.couponRedemption.update({ where: { id: redemption.id }, data: { reversedAt: new Date() } });
        await syncRedemptionCount(tx, redemption.couponId);
      }
      if (previousCouponId) await syncRedemptionCount(tx, previousCouponId);
      if (couponId) await syncRedemptionCount(tx, couponId);
      return current;
    });
    void logger.info('checkout.prepare.success', { orderId: order.id, productId: product.id, subtotalCents, discountCents, totalCents, couponCode: appliedCode || null, reused: Boolean(existing) });
    return NextResponse.json({ data: { orderId: order.id, status: order.status, product: product.name, subtotalCents, discountCents, totalCents, couponCode: appliedCode || null } }, { status: existing ? 200 : 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    void logger.error('checkout.prepare.failed', { message, stack: error instanceof Error ? (error.stack || '').slice(0, 300) : '' });
    if (message === 'COUPON_REJECTED') return NextResponse.json({ error: 'Cupom inválido para este pedido.' }, { status: 400 });
    return NextResponse.json({ error: 'Não foi possível preparar o checkout.' }, { status: 500 });
  }
});

export { POST };
