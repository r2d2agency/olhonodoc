import { NextResponse } from 'next/server';
import { CouponDiscountType, CouponStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin, requireSuperadmin } from '@/lib/auth';
import { normalizeCouponCode } from '@/lib/coupons';
import { logger, logRequest } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const GET = logRequest('admin.coupons.list', async () => {
  try {
    await requireAdmin();
    const coupons = await prisma.coupon.findMany({ include: { product: { select: { id: true, name: true } }, assignments: true, _count: { select: { redemptions: true } } }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data: coupons });
  } catch (error) {
    void logger.error('admin.coupons.list_failed', { message: error instanceof Error ? error.message : 'erro' });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021') return NextResponse.json({ error: 'Banco de dados desatualizado: execute prisma db push no ambiente de produção.' }, { status: 503 });
    return NextResponse.json({ error: 'Não foi possível carregar os cupons' }, { status: 500 });
  }
});

const POST = logRequest('admin.coupons.create', async (request: Request) => {
  try {
    await requireSuperadmin();
    const body = await request.json().catch(() => null);
    const code = normalizeCouponCode(String(body?.code ?? ''));
    if (!code) return NextResponse.json({ error: 'Informe o código do cupom.' }, { status: 400 });
    const value = Number(body?.value);
    const discountType = body?.discountType === CouponDiscountType.PERCENTAGE ? CouponDiscountType.PERCENTAGE : CouponDiscountType.FIXED;
    if (!Number.isInteger(value) || value < 0) return NextResponse.json({ error: 'Informe um valor válido para o desconto.' }, { status: 400 });
    if (discountType === CouponDiscountType.PERCENTAGE && value > 100) return NextResponse.json({ error: 'O percentual deve estar entre 0 e 100.' }, { status: 400 });
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) return NextResponse.json({ error: 'Já existe um cupom com este código.' }, { status: 409 });
    const coupon = await prisma.coupon.create({ data: {
      code,
      description: body?.description ? String(body.description).trim() : null,
      discountType,
      value,
      status: body?.status === CouponStatus.INACTIVE ? CouponStatus.INACTIVE : CouponStatus.ACTIVE,
      startsAt: body?.startsAt ? new Date(body.startsAt) : null,
      endsAt: body?.endsAt ? new Date(body.endsAt) : null,
      maxRedemptions: body?.maxRedemptions == null || body.maxRedemptions === '' ? null : Number(body.maxRedemptions),
      perCustomerLimit: body?.perCustomerLimit == null || body.perCustomerLimit === '' ? null : Number(body.perCustomerLimit),
      minOrderCents: body?.minOrderCents == null || body.minOrderCents === '' ? null : Number(body.minOrderCents),
      maxDiscountCents: body?.maxDiscountCents == null || body.maxDiscountCents === '' ? null : Number(body.maxDiscountCents),
      productId: body?.productId || null,
    } });
    void logger.info('admin.coupons.created', { couponId: coupon.id, code: coupon.code, discountType, value });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (error) {
    void logger.error('admin.coupons.create_failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível criar o cupom' }, { status: 400 });
  }
});

export { GET, POST };
