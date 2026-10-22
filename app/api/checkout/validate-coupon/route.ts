import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CouponError, normalizeCouponCode, resolveCoupon } from '@/lib/coupons';
import { activePriceCents } from '@/lib/pricing';

/**
 * Valida um cupom contra o produto.
 *
 * Mantido por compatibilidade: o checkout usa /api/checkout/coupon, que
 * calcula o subtotal no servidor a partir do slug do produto.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => null);
    const code = normalizeCouponCode(String(body?.code ?? ''));
    if (!code) return NextResponse.json({ error: 'Código e subtotal válidos são obrigatórios.' }, { status: 400 });
    const productSlug = typeof body?.productSlug === 'string' ? body.productSlug : '';
    const product = productSlug ? await prisma.product.findUnique({ where: { slug: productSlug } }) : null;
    const productId = typeof body?.productId === 'string' ? body.productId : product?.id;
    const subtotalCents = product ? activePriceCents(product) : Number(body?.subtotalCents);
    if (!Number.isInteger(subtotalCents) || subtotalCents < 0) return NextResponse.json({ error: 'Código e subtotal válidos são obrigatórios.' }, { status: 400 });
    const customer = user?.email ? await prisma.customer.findUnique({ where: { email: user.email }, select: { id: true, cpf: true } }) : null;
    const resolution = await resolveCoupon({
      code,
      subtotalCents,
      productId,
      customerId: customer?.id ?? (typeof body?.customerId === 'string' ? body.customerId : undefined),
      email: (typeof body?.email === 'string' ? body.email : user?.email) || undefined,
      cpf: (typeof body?.cpf === 'string' ? body.cpf : customer?.cpf) || undefined,
    });
    return NextResponse.json({ data: { code: resolution.code, discountType: resolution.discountType, value: resolution.value, discountCents: resolution.discountCents, totalCents: resolution.totalCents } });
  } catch (error) {
    if (error instanceof CouponError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('Checkout coupon validation failed', error);
    return NextResponse.json({ error: 'Não foi possível validar o cupom.' }, { status: 500 });
  }
}
