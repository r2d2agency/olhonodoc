import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDiscount, isCouponActive, normalizeCouponCode, normalizeCpf, normalizeEmail, validateCouponInput } from '@/lib/coupons';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const code = normalizeCouponCode(String(body?.code ?? ''));
    const subtotalCents = Number(body?.subtotalCents);
    const productId = typeof body?.productId === 'string' ? body.productId : undefined;
    const email = body?.email ? normalizeEmail(String(body.email)) : undefined;
    const cpf = body?.cpf ? normalizeCpf(String(body.cpf)) : undefined;
    const customerId = typeof body?.customerId === 'string' ? body.customerId : undefined;
    if (!code || !Number.isInteger(subtotalCents) || subtotalCents < 0) return NextResponse.json({ error: 'Código e subtotal válidos são obrigatórios.' }, { status: 400 });
    const coupon = await prisma.coupon.findUnique({ where: { code }, include: { assignments: true } });
    if (!coupon) return NextResponse.json({ error: 'Cupom não encontrado.' }, { status: 404 });
    if (!isCouponActive(coupon)) return NextResponse.json({ error: 'Cupom expirado ou inativo.' }, { status: 400 });
    if (coupon.productId && coupon.productId !== productId) return NextResponse.json({ error: 'Cupom não válido para este produto.' }, { status: 400 });
    if (coupon.minOrderCents != null && subtotalCents < coupon.minOrderCents) return NextResponse.json({ error: 'Pedido abaixo do valor mínimo para este cupom.' }, { status: 400 });
    if (coupon.maxRedemptions != null && coupon.redemptionCount >= coupon.maxRedemptions) return NextResponse.json({ error: 'Limite total de utilizações atingido.' }, { status: 400 });
    if (coupon.assignments.length) {
      const allowed = coupon.assignments.some((assignment) => (assignment.targetType === 'EMAIL' && email && assignment.targetValue === email) || (assignment.targetType === 'CPF' && cpf && assignment.targetValue === cpf) || (assignment.targetType === 'CUSTOMER' && customerId && assignment.targetValue === customerId));
      if (!allowed) return NextResponse.json({ error: 'Cupom não disponível para este cliente.' }, { status: 403 });
      if (coupon.perCustomerLimit != null && (customerId || email || cpf)) {
        const redemptions = await prisma.couponRedemption.count({ where: { couponId: coupon.id, customerId: customerId || undefined } });
        if (redemptions >= coupon.perCustomerLimit) return NextResponse.json({ error: 'Limite de utilizações por cliente atingido.' }, { status: 400 });
      }
    }
    validateCouponInput({ code, discountType: coupon.discountType, value: coupon.value, subtotalCents });
    const discountCents = calculateDiscount(coupon.discountType, coupon.value, subtotalCents, coupon.maxDiscountCents);
    return NextResponse.json({ data: { code: coupon.code, discountType: coupon.discountType, value: coupon.value, discountCents, totalCents: subtotalCents - discountCents } });
  } catch (error) { console.error('Checkout coupon validation failed', error); return NextResponse.json({ error: 'Não foi possível validar o cupom.' }, { status: 500 }); }
}
