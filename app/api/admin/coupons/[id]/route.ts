import { NextResponse } from 'next/server';
import { CouponDiscountType, CouponStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireSuperadmin } from '@/lib/auth';
import { logger, logRequest } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const PATCH = logRequest('admin.coupons.update', async (request: Request, { params }: { params: { id: string } }) => {
  try {
    await requireSuperadmin();
    const body = await request.json().catch(() => null);
    const data: Record<string, unknown> = {};
    if (body?.description !== undefined) data.description = body.description ? String(body.description).trim() : null;
    if (body?.status !== undefined) data.status = body.status === CouponStatus.ARCHIVED ? CouponStatus.ARCHIVED : body.status === CouponStatus.INACTIVE ? CouponStatus.INACTIVE : CouponStatus.ACTIVE;
    if (body?.startsAt !== undefined) data.startsAt = body.startsAt ? new Date(body.startsAt) : null;
    if (body?.endsAt !== undefined) data.endsAt = body.endsAt ? new Date(body.endsAt) : null;
    if (body?.maxRedemptions !== undefined) data.maxRedemptions = body.maxRedemptions == null || body.maxRedemptions === '' ? null : Number(body.maxRedemptions);
    if (body?.perCustomerLimit !== undefined) data.perCustomerLimit = body.perCustomerLimit == null || body.perCustomerLimit === '' ? null : Number(body.perCustomerLimit);
    if (body?.minOrderCents !== undefined) data.minOrderCents = body.minOrderCents == null || body.minOrderCents === '' ? null : Number(body.minOrderCents);
    if (body?.maxDiscountCents !== undefined) data.maxDiscountCents = body.maxDiscountCents == null || body.maxDiscountCents === '' ? null : Number(body.maxDiscountCents);
    if (body?.productId !== undefined) data.productId = body.productId || null;
    if (body?.value !== undefined) {
      const value = Number(body.value);
      if (!Number.isInteger(value) || value < 0) return NextResponse.json({ error: 'Valor de desconto inválido.' }, { status: 400 });
      data.value = value;
    }
    if (body?.discountType !== undefined) data.discountType = body.discountType === CouponDiscountType.PERCENTAGE ? CouponDiscountType.PERCENTAGE : CouponDiscountType.FIXED;
    const coupon = await prisma.coupon.update({ where: { id: params.id }, data });
    void logger.info('admin.coupons.updated', { couponId: coupon.id, code: coupon.code, status: coupon.status });
    return NextResponse.json({ data: coupon });
  } catch (error) {
    void logger.error('admin.coupons.update_failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível atualizar o cupom' }, { status: 400 });
  }
});

const DELETE = logRequest('admin.coupons.delete', async (_request: Request, { params }: { params: { id: string } }) => {
  try {
    await requireSuperadmin();
    const existing = await prisma.coupon.findUnique({ where: { id: params.id }, select: { redemptionCount: true, code: true } });
    if (!existing) return NextResponse.json({ error: 'Cupom não encontrado' }, { status: 404 });
    if (existing.redemptionCount > 0) {
      // Cupom já usado não é removido: ele é arquivado para preservar o histórico.
      const coupon = await prisma.coupon.update({ where: { id: params.id }, data: { status: CouponStatus.ARCHIVED } });
      void logger.info('admin.coupons.archived', { couponId: params.id, code: existing.code });
      return NextResponse.json({ data: coupon });
    }
    await prisma.coupon.delete({ where: { id: params.id } });
    void logger.info('admin.coupons.deleted', { couponId: params.id, code: existing.code });
    return NextResponse.json({ data: { ok: true } });
  } catch (error) {
    void logger.error('admin.coupons.delete_failed', { message: error instanceof Error ? error.message : 'erro' });
    return NextResponse.json({ error: 'Não foi possível remover o cupom' }, { status: 400 });
  }
});

export { PATCH, DELETE };
