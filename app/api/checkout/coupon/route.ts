import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CouponError, normalizeCouponCode, resolveCoupon } from '@/lib/coupons';
import { activePriceCents } from '@/lib/pricing';
import { logger, logRequest } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * Aplica o cupom no checkout.
 *
 * O subtotal é calculado aqui, no servidor, a partir do preço do produto:
 * o navegador nunca informa o valor final. O desconto devolvido aqui é só
 * uma prévia — o prepare recalcula tudo antes de criar o pedido.
 */
const POST = logRequest('checkout.coupon', async (request: Request) => {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
    const body = await request.json().catch(() => null);
    const code = normalizeCouponCode(String(body?.code ?? ''));
    const productSlug = typeof body?.productSlug === 'string' ? body.productSlug : '';
    if (!code) return NextResponse.json({ error: 'Informe o código do cupom.' }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { slug: productSlug, status: 'ACTIVE' } });
    if (!product) return NextResponse.json({ error: 'Produto indisponível.' }, { status: 404 });
    const subtotalCents = activePriceCents(product);
    const customer = user.email ? await prisma.customer.findUnique({ where: { email: user.email }, select: { id: true, cpf: true } }) : null;
    const resolution = await resolveCoupon({ code, subtotalCents, productId: product.id, customerId: customer?.id, email: user.email || undefined, cpf: customer?.cpf || undefined });
    void logger.info('checkout.coupon.applied', { code: resolution.code, productId: product.id, subtotalCents, discountCents: resolution.discountCents, totalCents: resolution.totalCents });
    return NextResponse.json({ data: { code: resolution.code, discountType: resolution.discountType, value: resolution.value, subtotalCents, discountCents: resolution.discountCents, totalCents: resolution.totalCents } });
  } catch (error) {
    if (error instanceof CouponError) {
      void logger.warn('checkout.coupon.rejected', { message: error.message, status: error.status });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    void logger.error('checkout.coupon.failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível validar o cupom.' }, { status: 500 });
  }
});

export { POST };
